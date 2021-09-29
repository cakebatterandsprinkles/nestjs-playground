import { Toy } from '../entities/toy.entity';
import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsString()
  breed: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Toy)
  favoriteToys: Toy[];
  hatedToys: Toy[];
}
