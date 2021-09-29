import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cat } from './cat.entity';

@Entity()
export class Toy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Here, we just specify it is a many to many relationship
  @ManyToMany(() => Cat, (cat) => cat.favoriteToys)
  catsThatLike: Cat[];

  @ManyToMany(() => Cat, (cat) => cat.hatedToys)
  catsThatHate: Cat[];
}
