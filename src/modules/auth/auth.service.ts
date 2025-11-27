import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import { Usuario } from '../../entities/usuario.entity';
import { Tienda } from '../../entities/tienda.entity';
import { Rol } from '../../entities/rol.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EncryptionService } from '../../common/services/encryption.service';

// Security configuration constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Tienda)
    private tiendaRepository: Repository<Tienda>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usuarioRepository.findOne({
      where: { email },
      relations: ['tienda', 'rol'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      const remainingMinutes = Math.ceil(
        (new Date(user.locked_until).getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Cuenta bloqueada. Intente nuevamente en ${remainingMinutes} minutos`,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed attempts
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Reset failed attempts on successful login
    await this.resetFailedAttempts(user);

    const { password: _, mfa_secret, ...result } = user;
    return result;
  }

  private async handleFailedLogin(user: Usuario): Promise<void> {
    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
    user.last_failed_login = new Date();

    if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
      user.locked_until = new Date(
        Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000,
      );
      await this.usuarioRepository.save(user);
      throw new ForbiddenException(
        `Cuenta bloqueada por ${LOCKOUT_DURATION_MINUTES} minutos debido a múltiples intentos fallidos`,
      );
    }

    await this.usuarioRepository.save(user);
  }

  private async resetFailedAttempts(user: Usuario): Promise<void> {
    if (user.failed_login_attempts > 0 || user.locked_until) {
      user.failed_login_attempts = 0;
      user.locked_until = null;
      user.last_failed_login = null;
      await this.usuarioRepository.save(user);
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (user.mfa_enabled) {
      // Return temporary token for MFA verification
      const tempToken = this.jwtService.sign(
        { sub: user.id, mfa_pending: true },
        { expiresIn: '5m' },
      );

      return {
        requires_mfa: true,
        temp_token: tempToken,
        message: 'Por favor ingrese su código MFA',
      };
    }

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto) {
    // Validate tienda exists
    const tienda = await this.tiendaRepository.findOne({
      where: { id: registerDto.tiendaId, activo: true },
    });
    if (!tienda) {
      throw new BadRequestException(
        'La tienda especificada no existe o no está activa',
      );
    }

    // Validate rol exists
    const rol = await this.rolRepository.findOne({
      where: { id: registerDto.rolId },
    });
    if (!rol) {
      throw new BadRequestException('El rol especificado no existe');
    }

    // Check if email already exists
    const existingUser = await this.usuarioRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Use stronger bcrypt rounds
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      BCRYPT_ROUNDS,
    );

    const newUser = this.usuarioRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      nombre_completo: registerDto.nombre_completo,
      telefono: registerDto.telefono,
      tienda: tienda,
      rol: rol,
      activo: true,
      failed_login_attempts: 0,
    });

    const savedUser = await this.usuarioRepository.save(newUser);
    const { password, mfa_secret, ...result } = savedUser;

    const tokens = await this.generateTokens({ ...result, tienda, rol });

    return {
      user: result,
      ...tokens,
    };
  }

  async enableMfa(userId: string) {
    const user = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (user.mfa_enabled) {
      throw new BadRequestException('MFA ya está habilitado');
    }

    const secret = otplib.authenticator.generateSecret();
    const otpauth = otplib.authenticator.keyuri(
      user.email,
      'System Management',
      secret,
    );

    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    // Encrypt and save secret (will be confirmed after verification)
    user.mfa_secret = this.encryptionService.encrypt(secret);
    await this.usuarioRepository.save(user);

    return {
      secret, // Show secret to user for manual entry (one-time only)
      qrCode: qrCodeUrl,
      message:
        'Escanee el código QR con su aplicación de autenticación (Google Authenticator, Authy, etc.)',
    };
  }

  async verifyMfaSetup(userId: string, token: string) {
    const user = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.mfa_secret) {
      throw new BadRequestException('MFA no está configurado');
    }

    // Decrypt the MFA secret for verification
    const decryptedSecret = this.encryptionService.decrypt(user.mfa_secret);

    const isValid = otplib.authenticator.verify({
      token,
      secret: decryptedSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Código MFA inválido');
    }

    user.mfa_enabled = true;
    await this.usuarioRepository.save(user);

    return {
      message: 'MFA habilitado exitosamente',
    };
  }

  async verifyMfa(tempToken: string, token: string) {
    let decoded;
    try {
      decoded = this.jwtService.verify(tempToken);
    } catch (error) {
      throw new UnauthorizedException('Token temporal inválido o expirado');
    }

    if (!decoded.mfa_pending) {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.usuarioRepository.findOne({
      where: { id: decoded.sub },
      relations: ['tienda', 'rol'],
    });

    if (!user || !user.mfa_enabled || !user.mfa_secret) {
      throw new BadRequestException('MFA no está configurado');
    }

    // Decrypt the MFA secret for verification
    const decryptedSecret = this.encryptionService.decrypt(user.mfa_secret);

    const isValid = otplib.authenticator.verify({
      token,
      secret: decryptedSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Código MFA inválido');
    }

    const { password, mfa_secret, ...userWithoutSensitive } = user;
    return this.generateTokens(userWithoutSensitive);
  }

  async disableMfa(userId: string) {
    const user = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    user.mfa_enabled = false;
    user.mfa_secret = null;
    await this.usuarioRepository.save(user);

    return {
      message: 'MFA deshabilitado exitosamente',
    };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol?.nombre,
      tienda: user.tienda?.id,
    };

    // Generate access token
    const access_token = this.jwtService.sign(payload);

    // Generate refresh token (longer-lived, opaque token)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(
      refreshTokenExpires.getDate() + REFRESH_TOKEN_EXPIRY_DAYS,
    );

    // Store hashed refresh token in database
    await this.usuarioRepository.update(user.id, {
      refresh_token: refreshTokenHash,
      refresh_token_expires: refreshTokenExpires,
    });

    return {
      access_token,
      refresh_token: refreshToken,
      expires_in: this.configService.get('JWT_EXPIRATION') || '24h',
      refresh_expires_in: `${REFRESH_TOKEN_EXPIRY_DAYS} days`,
      user: {
        id: user.id,
        email: user.email,
        nombre_completo: user.nombre_completo,
        telefono: user.telefono,
        tienda: user.tienda,
        rol: user.rol,
        mfa_enabled: user.mfa_enabled,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    // Find users with non-null refresh tokens
    const users = await this.usuarioRepository.find({
      where: { activo: true },
      relations: ['tienda', 'rol'],
    });

    // Find the user whose refresh token matches
    let validUser: Usuario | null = null;
    for (const user of users) {
      if (user.refresh_token) {
        const isValid = await bcrypt.compare(refreshToken, user.refresh_token);
        if (isValid) {
          validUser = user;
          break;
        }
      }
    }

    if (!validUser) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // Check if refresh token has expired
    if (
      validUser.refresh_token_expires &&
      new Date() > new Date(validUser.refresh_token_expires)
    ) {
      // Clear expired refresh token
      await this.usuarioRepository.update(validUser.id, {
        refresh_token: null,
        refresh_token_expires: null,
      });
      throw new UnauthorizedException('Refresh token expirado');
    }

    const { password, mfa_secret, refresh_token, ...userWithoutSensitive } =
      validUser;
    return this.generateTokens(userWithoutSensitive);
  }

  async logout(userId: string) {
    // Invalidate refresh token by clearing it from database
    await this.usuarioRepository.update(userId, {
      refresh_token: null,
      refresh_token_expires: null,
    });

    return {
      message: 'Sesión cerrada exitosamente',
    };
  }

  async revokeAllSessions(userId: string) {
    // Revoke all sessions by clearing refresh token
    // In a more advanced implementation, you could maintain a token blacklist
    // or use token versioning
    await this.usuarioRepository.update(userId, {
      refresh_token: null,
      refresh_token_expires: null,
    });

    return {
      message: 'Todas las sesiones han sido revocadas',
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.usuarioRepository.findOne({
      where: { id: userId },
      relations: ['tienda', 'rol'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }
}
