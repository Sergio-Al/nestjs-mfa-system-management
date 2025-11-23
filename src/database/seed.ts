import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { runSeeds } from './seeds/initial-seed';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { Tienda } from '../entities/tienda.entity';
import { Almacen } from '../entities/almacen.entity';
import { Categoria } from '../entities/categoria.entity';
import { UnidadMedida } from '../entities/unidad-medida.entity';
import { Proveedor } from '../entities/proveedor.entity';
import { Producto } from '../entities/producto.entity';
import { Lote } from '../entities/lote.entity';
import { Inventario } from '../entities/inventario.entity';
import { Movimiento } from '../entities/movimiento.entity';
import { Auditoria } from '../entities/auditoria.entity';

config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
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
  synchronize: false,
});

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');
    await AppDataSource.initialize();
    console.log('✓ Database connection established\n');

    await runSeeds(AppDataSource);

    await AppDataSource.destroy();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
