import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from './producto.entity';
import { Inventario } from './inventario.entity';
import { Lote } from './lote.entity';
import { Tienda } from './tienda.entity';
import { Proveedor } from './proveedor.entity';
import { Usuario } from './usuario.entity';

@Entity('MOVIMIENTOS')
export class Movimiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  numero_movimiento: string;

  @ManyToOne(() => Producto, (producto) => producto.movimientos)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ManyToOne(() => Inventario, (inventario) => inventario.movimientos)
  @JoinColumn({ name: 'inventario_id' })
  inventario: Inventario;

  @ManyToOne(() => Lote, (lote) => lote.movimientos, { nullable: true })
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @ManyToOne(() => Tienda, (tienda) => tienda.movimientosOrigen, {
    nullable: true,
  })
  @JoinColumn({ name: 'tienda_origen_id' })
  tiendaOrigen: Tienda;

  @ManyToOne(() => Tienda, (tienda) => tienda.movimientosDestino, {
    nullable: true,
  })
  @JoinColumn({ name: 'tienda_destino_id' })
  tiendaDestino: Tienda;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.movimientos, {
    nullable: true,
  })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @Column()
  tipo:
    | 'COMPRA'
    | 'VENTA'
    | 'TRANSFERENCIA'
    | 'AJUSTE'
    | 'DEVOLUCION'
    | 'MERMA';

  @Column({ nullable: true })
  motivo: string;

  @Column()
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  costo_unitario: number;

  @Column('decimal', { precision: 10, scale: 2 })
  costo_total: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  peso_total_kg: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.movimientos)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column()
  estado: 'PENDIENTE' | 'EN_TRANSITO' | 'COMPLETADO' | 'CANCELADO';

  @Column()
  fecha_movimiento: Date;

  @Column({ nullable: true })
  numero_factura: string;

  @Column({ nullable: true })
  numero_guia_remision: string;

  @Column({ nullable: true })
  vehiculo_placa: string;

  @Column({ nullable: true })
  conductor: string;

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

  @Column({ nullable: true })
  last_sync: Date;

  @Column({ default: false })
  sincronizado: boolean;
}
