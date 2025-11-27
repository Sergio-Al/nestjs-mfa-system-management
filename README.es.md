# Sistema de Gestión - API

Sistema integral de gestión de inventarios y almacenes construido con NestJS, TypeORM y PostgreSQL. Incluye autenticación multi-factor (MFA), control de acceso basado en roles y seguimiento de inventario en tiempo real.

## Tabla de Contenidos

- [Características de Seguridad](#características-de-seguridad)
- [Implementación CIA](#implementación-cia-triada)
- [Autenticación Multi-Factor (MFA)](#autenticación-multi-factor-mfa)
- [Política de Contraseñas](#política-de-contraseñas)
- [Gestión de Sesiones](#gestión-de-sesiones)
- [Limitación de Tasa (Rate Limiting)](#limitación-de-tasa-rate-limiting)
- [Configuración](#configuración)
- [Endpoints de Autenticación](#endpoints-de-autenticación)

---

## Características de Seguridad

Este proyecto implementa múltiples capas de seguridad siguiendo las mejores prácticas de la industria:

### 🔐 Autenticación y Seguridad
- ✅ Autenticación basada en JWT
- ✅ Autenticación Multi-Factor (MFA) con TOTP
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Hash de contraseñas con bcrypt (12 rondas)
- ✅ **Política de contraseñas fuertes**
- ✅ **Mecanismo de refresh token** seguro
- ✅ **Gestión de sesiones** con logout y revocación
- ✅ **Rate limiting** para prevenir ataques de fuerza bruta
- ✅ **Bloqueo de cuenta** después de intentos fallidos
- ✅ **Cifrado de secretos MFA** en reposo (AES-256-GCM)
- ✅ **Validación de entradas** para claves foráneas

---

## Implementación CIA (Tríada)

La tríada CIA (Confidencialidad, Integridad, Disponibilidad) es el modelo fundamental de seguridad de la información. Este proyecto implementa cada pilar de la siguiente manera:

### 🔐 Confidencialidad

La confidencialidad asegura que la información sensible solo sea accesible para usuarios autorizados.

| Característica | Implementación | Archivo |
|----------------|----------------|---------|
| **Cifrado de secretos MFA** | AES-256-GCM para cifrar secretos TOTP en reposo | `encryption.service.ts` |
| **Hash de contraseñas** | bcrypt con 12 rondas de sal | `auth.service.ts` |
| **Protección de datos sensibles** | Contraseñas y secretos MFA nunca se devuelven en respuestas API | `auth.service.ts` |
| **Tokens JWT firmados** | Tokens firmados con clave secreta segura | `jwt.strategy.ts` |

```typescript
// Ejemplo: Cifrado de secreto MFA
user.mfa_secret = this.encryptionService.encrypt(secret);

// Ejemplo: Hash de contraseña
const hashedPassword = await bcrypt.hash(password, 12);

// Ejemplo: Exclusión de datos sensibles
const { password, mfa_secret, ...result } = user;
return result;
```

### 🛡️ Integridad

La integridad garantiza que los datos no sean modificados de manera no autorizada.

| Característica | Implementación | Archivo |
|----------------|----------------|---------|
| **Validación de entradas** | DTOs con class-validator para sanitización | `register.dto.ts` |
| **Validación de claves foráneas** | tiendaId y rolId se validan antes de crear usuario | `auth.service.ts` |
| **Política de contraseñas** | Validador personalizado que rechaza contraseñas débiles | `password-policy.validator.ts` |
| **Generación segura de tokens** | Tokens TOTP usan generación criptográficamente segura | `auth.service.ts` |

```typescript
// Ejemplo: Validación de tienda antes de registro
const tienda = await this.tiendaRepository.findOne({
  where: { id: registerDto.tiendaId, activo: true },
});
if (!tienda) {
  throw new BadRequestException('La tienda especificada no existe o no está activa');
}

// Ejemplo: Política de contraseñas
@IsStrongPassword()
password: string;
```

### ⚡ Disponibilidad

La disponibilidad asegura que los sistemas y datos estén accesibles cuando se necesiten.

| Característica | Implementación | Archivo |
|----------------|----------------|---------|
| **Bloqueo de cuenta** | Cuentas bloqueadas tras 5 intentos fallidos por 15 minutos | `auth.service.ts` |
| **Desbloqueo automático** | Cuentas se desbloquean automáticamente después del período | `auth.service.ts` |
| **Rate Limiting** | Límites configurables para prevenir ataques DoS | `app.module.ts` |
| **Seguimiento de intentos fallidos** | Sistema rastrea intentos y marcas de tiempo | `usuario.entity.ts` |

```typescript
// Constantes de seguridad
const MAX_FAILED_ATTEMPTS = 5;        // Bloquear tras 5 intentos
const LOCKOUT_DURATION_MINUTES = 15;  // Bloquear por 15 minutos

// Ejemplo: Manejo de intento fallido
if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
  user.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
  throw new ForbiddenException(
    `Cuenta bloqueada por ${LOCKOUT_DURATION_MINUTES} minutos`
  );
}
```

---

## Autenticación Multi-Factor (MFA)

### ¿Qué es MFA?

La Autenticación Multi-Factor agrega una capa adicional de seguridad requiriendo dos o más factores de verificación:

1. **Algo que sabes** → Contraseña
2. **Algo que tienes** → Código TOTP del teléfono

### Implementación TOTP

Este proyecto usa **TOTP (Time-based One-Time Password)** según RFC 6238:

- Códigos de 6 dígitos
- Válidos por 30 segundos
- Compatibles con Google Authenticator, Authy, Microsoft Authenticator

### Flujo de Habilitación MFA

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE HABILITACIÓN MFA                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Usuario autenticado                                          │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────┐                                           │
│  │ POST /mfa/enable │ ◄── Requiere JWT válido                   │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────┐                       │
│  │ Servidor genera:                      │                       │
│  │ • Secreto TOTP (base32)              │                       │
│  │ • Código QR para escanear            │                       │
│  │ • Cifra secreto con AES-256-GCM      │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────┐                       │
│  │ Respuesta:                            │                       │
│  │ {                                     │                       │
│  │   "secret": "JBSWY3DPEHPK...",       │                       │
│  │   "qrCode": "data:image/png;base64.."│                       │
│  │ }                                     │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                      │
│           ▼                                                      │
│  2. Usuario escanea QR con app autenticadora                    │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────┐                                    │
│  │ POST /mfa/enable/verify │                                    │
│  │ { "token": "123456" }   │                                    │
│  └────────┬────────────────┘                                    │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────┐                       │
│  │ Servidor:                             │                       │
│  │ • Descifra secreto almacenado        │                       │
│  │ • Verifica código TOTP               │                       │
│  │ • Activa mfa_enabled = true          │                       │
│  └──────────────────────────────────────┘                       │
│                                                                  │
│  ✅ MFA HABILITADO                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Login con MFA

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE LOGIN CON MFA                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. POST /auth/login                                             │
│     { "email": "...", "password": "..." }                       │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────┐                       │
│  │ Servidor valida:                      │                       │
│  │ • ¿Cuenta bloqueada? → Error 403     │                       │
│  │ • ¿Contraseña correcta? → Si no, +1  │                       │
│  │ • ¿Usuario activo?                   │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────┐                       │
│  │ ¿MFA habilitado?                      │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                      │
│     ┌─────┴─────┐                                               │
│     │           │                                                │
│     ▼           ▼                                                │
│   [NO]        [SÍ]                                               │
│     │           │                                                │
│     ▼           ▼                                                │
│  Tokens      Token temporal (5 min)                              │
│  completos   { "requires_mfa": true,                             │
│              "temp_token": "..." }                               │
│                 │                                                │
│                 ▼                                                │
│  2. POST /auth/mfa/verify                                        │
│     { "temp_token": "...", "token": "123456" }                  │
│                 │                                                │
│                 ▼                                                │
│  ┌──────────────────────────────────────┐                       │
│  │ Servidor:                             │                       │
│  │ • Valida temp_token                  │                       │
│  │ • Descifra secreto MFA               │                       │
│  │ • Verifica código TOTP               │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────┐                       │
│  │ Respuesta:                            │                       │
│  │ {                                     │                       │
│  │   "access_token": "eyJ...",          │                       │
│  │   "refresh_token": "abc123...",      │                       │
│  │   "expires_in": "24h",               │                       │
│  │   "user": { ... }                    │                       │
│  │ }                                     │                       │
│  └──────────────────────────────────────┘                       │
│                                                                  │
│  ✅ AUTENTICACIÓN COMPLETA                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Seguridad del Secreto MFA

El secreto MFA se protege mediante:

```typescript
// 1. Generación segura
const secret = otplib.authenticator.generateSecret();

// 2. Cifrado antes de almacenar (AES-256-GCM)
const encryptedSecret = this.encryptionService.encrypt(secret);
user.mfa_secret = encryptedSecret;

// 3. Descifrado solo para verificación
const decryptedSecret = this.encryptionService.decrypt(user.mfa_secret);
const isValid = otplib.authenticator.verify({ token, secret: decryptedSecret });
```

---

## Política de Contraseñas

### Requisitos

| Requisito | Valor |
|-----------|-------|
| Longitud mínima | 8 caracteres |
| Longitud máxima | 128 caracteres |
| Mayúsculas | Al menos 1 |
| Minúsculas | Al menos 1 |
| Números | Al menos 1 |
| Caracteres especiales | Al menos 1 (!@#$%^&*()_+-=[]{};\':"\|,.<>/?) |
| Caracteres repetidos | Máximo 2 consecutivos |
| Contraseñas comunes | Bloqueadas (password, qwerty, admin, etc.) |

### Implementación

```typescript
// src/common/validators/password-policy.validator.ts

@ValidatorConstraint({ name: 'passwordPolicy', async: false })
export class PasswordPolicyConstraint implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    // Verificar longitud
    if (password.length < 8 || password.length > 128) return false;
    
    // Verificar mayúsculas
    if (!/[A-Z]/.test(password)) return false;
    
    // Verificar minúsculas
    if (!/[a-z]/.test(password)) return false;
    
    // Verificar números
    if (!/\d/.test(password)) return false;
    
    // Verificar caracteres especiales
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    
    // Verificar patrones comunes
    const commonPatterns = [/password/i, /qwerty/i, /123456/, /admin/i];
    if (commonPatterns.some(p => p.test(password))) return false;
    
    // Verificar caracteres repetidos
    if (/(.)\1{2,}/.test(password)) return false;
    
    return true;
  }
}
```

### Uso en DTOs

```typescript
// src/modules/auth/dto/register.dto.ts

export class RegisterDto {
  @ApiProperty({
    description: 'Contraseña segura',
    example: 'SecurePass123!',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
```

---

## Gestión de Sesiones

### Tokens

El sistema utiliza dos tipos de tokens:

| Token | Duración | Propósito |
|-------|----------|-----------|
| **Access Token** | 24 horas | Autenticación de peticiones API |
| **Refresh Token** | 7 días | Obtener nuevos access tokens sin re-login |

### Flujo de Refresh Token

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE REFRESH TOKEN                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Access token expira                                          │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────┐                       │
│  │ POST /auth/refresh                    │                       │
│  │ { "refresh_token": "abc123..." }     │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────┐                       │
│  │ Servidor:                             │                       │
│  │ • Busca usuario con refresh token    │                       │
│  │ • Compara hash con bcrypt            │                       │
│  │ • Verifica expiración                │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────┐                       │
│  │ Rotación de tokens:                   │                       │
│  │ • Nuevo access_token                 │                       │
│  │ • Nuevo refresh_token                │                       │
│  │ • Invalida refresh token anterior    │                       │
│  └──────────────────────────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Seguridad del Refresh Token

```typescript
// Generación segura
const refreshToken = crypto.randomBytes(64).toString('hex');

// Hash antes de almacenar
const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

// Almacenar en base de datos
await this.usuarioRepository.update(user.id, {
  refresh_token: refreshTokenHash,
  refresh_token_expires: expirationDate,
});
```

### Endpoints de Sesión

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/auth/refresh` | POST | Obtener nuevos tokens con refresh token |
| `/auth/logout` | POST | Cerrar sesión actual (requiere JWT) |
| `/auth/revoke-all` | POST | Revocar todas las sesiones (requiere JWT) |

---

## Limitación de Tasa (Rate Limiting)

### Configuración por Endpoint

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/auth/register` | 3 solicitudes | 1 minuto |
| `/auth/login` | 5 solicitudes | 1 minuto |
| `/auth/mfa/verify` | 5 solicitudes | 1 minuto |
| `/auth/refresh` | 10 solicitudes | 1 minuto |
| Global (resto) | 100 solicitudes | 1 minuto |

### Implementación

```typescript
// app.module.ts
ThrottlerModule.forRoot({
  throttlers: [
    { name: 'short', ttl: 1000, limit: 3 },
    { name: 'medium', ttl: 10000, limit: 20 },
    { name: 'long', ttl: 60000, limit: 100 },
  ],
}),

// auth.controller.ts
@Post('login')
@Throttle({ short: { limit: 5, ttl: 60000 } })
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### Respuesta cuando se excede el límite

```json
{
  "statusCode": 429,
  "message": "Demasiadas solicitudes. Por favor, espere un momento antes de intentar nuevamente."
}
```

---

## Configuración

### Variables de Entorno

```env
# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=system_management

# JWT
JWT_SECRET=tu-clave-secreta-muy-segura-cambiar-en-produccion
JWT_EXPIRATION=24h

# Cifrado MFA (generar con: openssl rand -hex 32)
ENCRYPTION_KEY=tu-clave-256-bits-en-hexadecimal

# Rate Limiting (opcional)
THROTTLE_SHORT_TTL=1000
THROTTLE_SHORT_LIMIT=3
THROTTLE_MEDIUM_TTL=10000
THROTTLE_MEDIUM_LIMIT=20
THROTTLE_LONG_TTL=60000
THROTTLE_LONG_LIMIT=100

# Aplicación
PORT=3000
```

### Generar Claves Seguras

```bash
# Generar ENCRYPTION_KEY (256-bit hex)
openssl rand -hex 32

# Generar JWT_SECRET
openssl rand -base64 32
```

---

## Endpoints de Autenticación

### Resumen de Endpoints

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/auth/register` | POST | No | Registrar nuevo usuario |
| `/auth/login` | POST | No | Iniciar sesión |
| `/auth/refresh` | POST | No | Refrescar tokens |
| `/auth/logout` | POST | JWT | Cerrar sesión |
| `/auth/revoke-all` | POST | JWT | Revocar todas las sesiones |
| `/auth/profile` | GET | JWT | Obtener perfil |
| `/auth/mfa/enable` | POST | JWT | Habilitar MFA |
| `/auth/mfa/enable/verify` | POST | JWT | Confirmar MFA |
| `/auth/mfa/verify` | POST | No | Verificar código MFA |
| `/auth/mfa/disable` | POST | JWT | Deshabilitar MFA |
| `/auth/roles` | GET | No | Listar roles disponibles |
| `/auth/tiendas` | GET | No | Listar tiendas disponibles |

### Ejemplos de Uso

#### Registro
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "MiPassword123!",
    "nombre_completo": "Juan Pérez",
    "telefono": "+591 70123456",
    "tiendaId": "<ID_TIENDA>",
    "rolId": "<ID_ROL>"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "MiPassword123!"
  }'
```

#### Habilitar MFA
```bash
curl -X POST http://localhost:3000/auth/mfa/enable \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

#### Verificar MFA (durante login)
```bash
curl -X POST http://localhost:3000/auth/mfa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "temp_token": "<TOKEN_TEMPORAL>",
    "token": "123456"
  }'
```

---

## Estructura de Archivos de Seguridad

```
src/
├── common/
│   ├── guards/
│   │   └── auth-throttler.guard.ts    # Guard personalizado de rate limiting
│   ├── services/
│   │   └── encryption.service.ts      # Servicio de cifrado AES-256-GCM
│   └── validators/
│       └── password-policy.validator.ts  # Validador de contraseñas
├── entities/
│   └── usuario.entity.ts              # Campos de seguridad del usuario
└── modules/
    └── auth/
        ├── auth.controller.ts         # Endpoints de autenticación
        ├── auth.service.ts            # Lógica de autenticación
        ├── auth.module.ts             # Configuración del módulo
        ├── dto/
        │   ├── login.dto.ts
        │   ├── register.dto.ts
        │   ├── refresh-token.dto.ts
        │   └── verify-mfa.dto.ts
        ├── guards/
        │   └── jwt-auth.guard.ts
        └── strategies/
            ├── jwt.strategy.ts
            └── local.strategy.ts
```

---

## Mejores Prácticas de Seguridad

1. ✅ **Nunca commitear archivo `.env`** - Usar `.env.example` como plantilla
2. ✅ **Cambiar JWT_SECRET** en producción a una cadena aleatoria fuerte
3. ✅ **Generar ENCRYPTION_KEY único** para cada ambiente
4. ✅ **Usar HTTPS** en producción
5. ✅ **Habilitar MFA** para cuentas de administrador
6. ✅ **Políticas de rotación de contraseñas** regulares
7. ✅ **Mantener dependencias actualizadas**: `npm audit` y `npm update`
8. ✅ **Monitorear intentos de login fallidos** para detectar ataques

---

## Licencia

Este proyecto está bajo la licencia UNLICENSED.
