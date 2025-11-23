import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Producto } from './producto.entity';
import { Proveedor } from './proveedor.entity';
import { Inventario } from './inventario.entity';
import { Movimiento } from './movimiento.entity';

@Entity('LOTES')
export class Lote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  numero_lote: string;

  @ManyToOne(() => Producto, (producto) => producto.lotes)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ type: 'timestamp' })
  fecha_fabricacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_vencimiento: Date;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.lotes)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @Column({ nullable: true })
  numero_factura: string;

  @Column()
  cantidad_inicial: number;

  @Column()
  cantidad_actual: number;

  @Column({ nullable: true })
  certificado_calidad_url: string;

  @Column({ nullable: true })
  observaciones: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Column({ nullable: true })
  sync_id: string;

  @Column({ type: 'timestamp', nullable: true })
  last_sync: Date;

  @OneToMany(() => Inventario, (inventario) => inventario.lote)
  inventarios: Inventario[];

  @OneToMany(() => Movimiento, (movimiento) => movimiento.lote)
  movimientos: Movimiento[];
}
