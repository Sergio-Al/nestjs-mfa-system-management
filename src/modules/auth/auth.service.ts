import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import { Usuario } from '../../entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usuarioRepository.findOne({
      where: { email },
      relations: ['tienda', 'rol'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const { password: _, ...result } = user;
    return result;
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
    const existingUser = await this.usuarioRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.usuarioRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      nombre_completo: registerDto.nombre_completo,
      telefono: registerDto.telefono,
      tienda: { id: registerDto.tiendaId } as any,
      rol: { id: registerDto.rolId } as any,
      activo: true,
    });

    const savedUser = await this.usuarioRepository.save(newUser);
    const { password, ...result } = savedUser;

    return {
      user: result,
      ...this.generateTokens(result),
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

    // Save secret temporarily (will be confirmed after verification)
    user.mfa_secret = secret;
    await this.usuarioRepository.save(user);

    return {
      secret,
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

    const isValid = otplib.authenticator.verify({
      token,
      secret: user.mfa_secret,
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

    const isValid = otplib.authenticator.verify({
      token,
      secret: user.mfa_secret,
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

  private generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol?.nombre,
      tienda: user.tienda?.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
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
}
