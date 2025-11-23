import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
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
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Email ya registrado' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso o MFA requerido',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('mfa/verify')
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
    return req.user;
  }

  @Get('roles')
  @ApiOperation({ summary: 'Listar roles disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  async getRoles() {
    return this.rolRepository.find({
      select: ['id', 'nombre', 'descripcion'],
    });
  }

  @Get('tiendas')
  @ApiOperation({ summary: 'Listar tiendas disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de tiendas' })
  async getTiendas() {
    return this.tiendaRepository.find({
      where: { activo: true },
      select: ['id', 'nombre', 'codigo', 'ciudad', 'departamento'],
    });
  }
}
