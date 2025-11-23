import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Producto } from './producto.entity';

@Entity('UNIDADES_MEDIDA')
export class UnidadMedida {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column()
  abreviatura: string;

  @Column()
  tipo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  factor_conversion: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(() => Producto, (producto) => producto.unidadMedida)
  productos: Producto[];
}
