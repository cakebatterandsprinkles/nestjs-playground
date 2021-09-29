import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  // With the @Type() decorator, we make sure the value that is coming in is a Number.
  // (Because query parameters are sent over the network as strings.)
  // @IsOptional() decorator marks the field as optional.
  // @IsPositive() decorator makes sure the value coming in is a positive number.

  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  limit: number;

  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  offset: number;
}
