import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tienda } from './tienda.entity';
import { Rol } from './rol.entity';
import { Movimiento } from './movimiento.entity';
import { Auditoria } from './auditoria.entity';

@Entity('USUARIOS')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  nombre_completo: string;

  @Column()
  telefono: string;

  @Column()
  password: string;

  @Column({ default: false })
  mfa_enabled: boolean;

  @Column({ nullable: true })
  mfa_secret: string;

  @ManyToOne(() => Tienda, (tienda) => tienda.usuarios)
  @JoinColumn({ name: 'tienda_id' })
  tienda: Tienda;

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

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

  @OneToMany(() => Movimiento, (movimiento) => movimiento.usuario)
  movimientos: Movimiento[];

  @OneToMany(() => Auditoria, (auditoria) => auditoria.usuario)
  auditorias: Auditoria[];
}
