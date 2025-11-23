import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Almacen } from './almacen.entity';
import { Inventario } from './inventario.entity';
import { Movimiento } from './movimiento.entity';

@Entity('TIENDAS')
export class Tienda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  codigo: string;

  @Column()
  direccion: string;

  @Column()
  ciudad: string;

  @Column()
  departamento: string;

  @Column()
  telefono: string;

  @Column()
  horario_atencion: string;

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

  @OneToMany(() => Usuario, (usuario) => usuario.tienda)
  usuarios: Usuario[];

  @OneToMany(() => Almacen, (almacen) => almacen.tienda)
  almacenes: Almacen[];

  @OneToMany(() => Inventario, (inventario) => inventario.tienda)
  inventarios: Inventario[];

  @OneToMany(() => Movimiento, (movimiento) => movimiento.tiendaOrigen)
  movimientosOrigen: Movimiento[];

  @OneToMany(() => Movimiento, (movimiento) => movimiento.tiendaDestino)
  movimientosDestino: Movimiento[];
}
