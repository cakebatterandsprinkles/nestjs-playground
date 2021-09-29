import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat } from './entities/cat.entity';
import { Toy } from './entities/toy.entity';
import { Event } from '../../events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cat, Toy, Event])],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [],
})
export class CatsModule {}
