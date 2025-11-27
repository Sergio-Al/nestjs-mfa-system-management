import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../../entities/rol.entity';
import { Tienda } from '../../entities/tienda.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(Tienda)
    private tiendaRepository: Repository<Tienda>,
  ) {}

  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 registrations per minute
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Email ya registrado' })
  @ApiTooManyRequestsResponse({ description: 'Demasiadas solicitudes' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso o MFA requerido',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiTooManyRequestsResponse({ description: 'Demasiadas solicitudes' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('mfa/verify')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 MFA attempts per minute
  @ApiOperation({ summary: 'Verificar código MFA' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        temp_token: {
          type: 'string',
          description: 'Token temporal del login',
        },
        token: {
          type: 'string',
          description: 'Código TOTP de 6 dígitos',
          example: '123456',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'MFA verificado exitosamente' })
  @ApiResponse({ status: 401, description: 'Código MFA inválido' })
  @ApiTooManyRequestsResponse({ description: 'Demasiadas solicitudes' })
  async verifyMfa(@Body() body: { temp_token: string; token: string }) {
    return this.authService.verifyMfa(body.temp_token, body.token);
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Habilitar MFA (requiere autenticación)' })
  @ApiResponse({
    status: 200,
    description: 'QR code generado para configurar MFA',
  })
  @ApiResponse({ status: 400, description: 'MFA ya está habilitado' })
  async enableMfa(@Request() req) {
    return this.authService.enableMfa(req.user.userId);
  }

  @Post('mfa/enable/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmar configuración de MFA' })
  @ApiResponse({ status: 200, description: 'MFA habilitado exitosamente' })
  @ApiResponse({ status: 401, description: 'Código MFA inválido' })
  async verifyMfaSetup(@Request() req, @Body() verifyMfaDto: VerifyMfaDto) {
    return this.authService.verifyMfaSetup(req.user.userId, verifyMfaDto.token);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deshabilitar MFA (requiere autenticación)' })
  @ApiResponse({ status: 200, description: 'MFA deshabilitado exitosamente' })
  async disableMfa(@Request() req) {
    return this.authService.disableMfa(req.user.userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.userId);
  }

  @Get('roles')
  @SkipThrottle() // Public info, less critical
  @ApiOperation({ summary: 'Listar roles disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  async getRoles() {
    return this.rolRepository.find({
      select: ['id', 'nombre', 'descripcion'],
    });
  }

  @Get('tiendas')
  @SkipThrottle() // Public info, less critical
  @ApiOperation({ summary: 'Listar tiendas disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de tiendas' })
  async getTiendas() {
    return this.tiendaRepository.find({
      where: { activo: true },
      select: ['id', 'nombre', 'codigo', 'ciudad', 'departamento'],
    });
  }

  @Post('refresh')
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 refresh attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiResponse({
    status: 200,
    description: 'Nuevos tokens generados exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  @ApiTooManyRequestsResponse({ description: 'Demasiadas solicitudes' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión (invalidar refresh token)' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @Post('revoke-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revocar todas las sesiones activas' })
  @ApiResponse({
    status: 200,
    description: 'Todas las sesiones han sido revocadas',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async revokeAllSessions(@Request() req) {
    return this.authService.revokeAllSessions(req.user.userId);
  }
}
