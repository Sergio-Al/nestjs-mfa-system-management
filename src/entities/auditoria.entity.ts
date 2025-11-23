import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('AUDITORIAS')
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.auditorias)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar' })
  tabla_afectada: string;

  @Column({ type: 'varchar' })
  accion: string;

  @Column({ type: 'json' })
  datos_anteriores: object;

  @Column({ type: 'json' })
  datos_nuevos: object;

  @Column({ type: 'varchar' })
  ip_address: string;

  @Column({ type: 'varchar' })
  dispositivo: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
