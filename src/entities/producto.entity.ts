import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Categoria } from './categoria.entity';
import { UnidadMedida } from './unidad-medida.entity';
import { Proveedor } from './proveedor.entity';
import { Lote } from './lote.entity';
import { Inventario } from './inventario.entity';
import { Movimiento } from './movimiento.entity';

@Entity('PRODUCTOS')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', unique: true, length: 100 })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @ManyToOne(() => UnidadMedida, (unidadMedida) => unidadMedida.productos)
  @JoinColumn({ name: 'unidad_medida_id' })
  unidadMedida: UnidadMedida;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos)
  @JoinColumn({ name: 'proveedor_principal_id' })
  proveedorPrincipal: Proveedor;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioCompra: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioVenta: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pesoUnitarioKg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  volumenUnitarioM3: number;

  @Column({ type: 'int', default: 0 })
  stockMinimo: number;

  @Column({ type: 'int', default: 0 })
  stockMaximo: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gradoCalidad: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  normaTecnica: string;

  @Column({ type: 'boolean', default: false })
  requiereAlmacenCubierto: boolean;

  @Column({ type: 'boolean', default: false })
  materialPeligroso: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagenUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fichaTecnicaUrl: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  syncId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSync: Date;

  @OneToMany(() => Lote, (lote) => lote.producto)
  lotes: Lote[];

  @OneToMany(() => Inventario, (inventario) => inventario.producto)
  inventarios: Inventario[];

  @OneToMany(() => Movimiento, (movimiento) => movimiento.producto)
  movimientos: Movimiento[];
}
