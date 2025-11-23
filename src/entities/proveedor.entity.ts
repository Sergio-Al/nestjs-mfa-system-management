import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Producto } from './producto.entity';
import { Lote } from './lote.entity';
import { Movimiento } from './movimiento.entity';

@Entity('PROVEEDORES')
export class Proveedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  razon_social: string;

  @Column({ unique: true })
  nit: string;

  @Column()
  nombre_contacto: string;

  @Column()
  telefono: string;

  @Column()
  email: string;

  @Column()
  direccion: string;

  @Column()
  ciudad: string;

  @Column()
  tipo_material: string;

  @Column()
  dias_credito: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ nullable: true })
  sync_id: string;

  @Column({ nullable: true, type: 'timestamp' })
  last_sync: Date;

  @OneToMany(() => Producto, (producto) => producto.proveedorPrincipal)
  productos: Producto[];

  @OneToMany(() => Lote, (lote) => lote.proveedor)
  lotes: Lote[];

  @OneToMany(() => Movimiento, (movimiento) => movimiento.proveedor)
  movimientos: Movimiento[];
}
