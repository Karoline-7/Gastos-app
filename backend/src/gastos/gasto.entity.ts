
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Categoria } from '../categorias/categoria.entity';

@Entity()
export class Gasto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  descripcion: string;

  @Column('float')
  monto: number;

  @Column({ type: 'datetime' })
  fecha: Date;

  @ManyToOne(() => Categoria, { eager: true, nullable: false })
  categoria: Categoria;
}
