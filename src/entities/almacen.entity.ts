import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tienda } from './tienda.entity';
import { Inventario } from './inventario.entity';

@Entity('ALMACENES')
export class Almacen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  codigo: string;

  @ManyToOne(() => Tienda, (tienda) => tienda.almacenes)
  @JoinColumn({ name: 'tienda_id' })
  tienda: Tienda;

  @Column()
  ubicacion: string;

  @Column()
  tipo: string;

  @Column('decimal')
  capacidad_m3: number;

  @Column('decimal')
  area_m2: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ nullable: true })
  sync_id: string;

  @Column({ type: 'timestamp', nullable: true })
  last_sync: Date;

  @OneToMany(() => Inventario, (inventario) => inventario.almacen)
  inventarios: Inventario[];
}
