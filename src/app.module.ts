import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { TiendasModule } from './modules/tiendas/tiendas.module';
import { ProductosModule } from './modules/productos/productos.module';
import { InventariosModule } from './modules/inventarios/inventarios.module';
import { MovimientosModule } from './modules/movimientos/movimientos.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { Tienda } from './entities/tienda.entity';
import { Almacen } from './entities/almacen.entity';
import { Categoria } from './entities/categoria.entity';
import { UnidadMedida } from './entities/unidad-medida.entity';
import { Proveedor } from './entities/proveedor.entity';
import { Producto } from './entities/producto.entity';
import { Lote } from './entities/lote.entity';
import { Inventario } from './entities/inventario.entity';
import { Movimiento } from './entities/movimiento.entity';
import { Auditoria } from './entities/auditoria.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'postgres'),
        database: configService.get('DATABASE_NAME', 'system_management'),
        entities: [
          Usuario,
          Rol,
          Tienda,
          Almacen,
          Categoria,
          UnidadMedida,
          Proveedor,
          Producto,
          Lote,
          Inventario,
          Movimiento,
          Auditoria,
        ],
        synchronize: true,
        logging: true,
      }),
    }),
    AuthModule,
    UsuariosModule,
    TiendasModule,
    ProductosModule,
    InventariosModule,
    MovimientosModule,
  ],
})
export class AppModule {}
