import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Producto } from './producto.entity';
import { Almacen } from './almacen.entity';
import { Tienda } from './tienda.entity';
import { Lote } from './lote.entity';
import { Movimiento } from './movimiento.entity';

@Entity('INVENTARIOS')
export class Inventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  producto_id: string;

  @ManyToOne(() => Producto, (producto) => producto.inventarios)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ type: 'uuid' })
  almacen_id: string;

  @ManyToOne(() => Almacen, (almacen) => almacen.inventarios)
  @JoinColumn({ name: 'almacen_id' })
  almacen: Almacen;

  @Column({ type: 'uuid' })
  tienda_id: string;

  @ManyToOne(() => Tienda, (tienda) => tienda.inventarios)
  @JoinColumn({ name: 'tienda_id' })
  tienda: Tienda;

  @Column({ type: 'uuid', nullable: true })
  lote_id: string;

  @ManyToOne(() => Lote, (lote) => lote.inventarios, { nullable: true })
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @Column({ type: 'int' })
  cantidad_actual: number;

  @Column({ type: 'int' })
  cantidad_reservada: number;

  @Column({ type: 'int' })
  cantidad_disponible: number;

  @Column({ type: 'decimal' })
  valor_total: number;

  @Column({ type: 'varchar' })
  ubicacion_fisica: string;

  @Column({ type: 'timestamp' })
  ultima_actualizacion: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  sync_id: string;

  @Column({ type: 'timestamp', nullable: true })
  last_sync: Date;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.inventario)
  movimientos: Movimiento[];
}
