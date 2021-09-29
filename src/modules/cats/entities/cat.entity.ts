import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Toy } from './toy.entity';

@Entity() // SQL table name = cat
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  breed: string;

  // @JoinTable() decorator specifies the owner of the relationship
  // Each cat can have multiple different favorite toys, and each toy can be in multiple cat's favoriteToys array
  // so the relationship will be ManyToMany.
  // @ManyToMany decorator gets the type of the relationship for the first argument,
  // which is just a function that returns a reference to the related entity.
  // As the second parameter, it gets an arrow function that returns the related entity and
  // specify what property needs to be selected (what are the specified cats are referred to as inside of the Toys entity?)

  @JoinTable()
  @ManyToMany(() => Toy, (toy) => toy.catsThatLike, { cascade: true })
  favoriteToys: Toy[];

  @JoinTable()
  @ManyToMany(() => Toy, (toy) => toy.catsThatHate, { cascade: true })
  hatedToys: Toy[];

  @Column({ default: 0 })
  recommendations: number;
}
