import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Producto } from './producto.entity';

@Entity('CATEGORIAS')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({ unique: true })
  codigo: string;

  @Column({ nullable: true })
  descripcion: string;

  @ManyToOne(() => Categoria, (categoria) => categoria.subcategorias, {
    nullable: true,
  })
  @JoinColumn({ name: 'categoria_padre_id' })
  categoria_padre: Categoria;

  @Column({ default: true })
  requiere_lote: boolean;

  @Column({ default: false })
  requiere_certificacion: boolean;

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

  @Column({ nullable: true })
  sync_id: string;

  @Column({ nullable: true, type: 'timestamp' })
  last_sync: Date;

  @OneToMany(() => Categoria, (categoria) => categoria.categoria_padre)
  subcategorias: Categoria[];

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];
}
