import {
  HttpStatus,
  Injectable,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Cat } from './entities/cat.entity';
import { Toy } from './entities/toy.entity';
import { Event } from '../../events/entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { PaginationQueryDto } from './common/dto/pagination-query.dto';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
    @InjectRepository(Toy)
    private readonly toyRepository: Repository<Toy>,
    private readonly connection: Connection,
  ) {}

  findAllCats(paginationQuery: PaginationQueryDto) {
    const { offset, limit } = paginationQuery;
    return this.catRepository.find({
      relations: ['favoriteToys', 'hatedToys'],
      skip: offset,
      take: limit,
    });
  }

  async findOneCat(id: number) {
    const theCat = await this.catRepository.findOne(id, {
      relations: ['favoriteToys', 'hatedToys'],
    });
    if (!theCat) {
      throw new HttpException(
        `This cat with the id of ${id} does not exist.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return theCat;
  }

  async findBreed(breed: string) {
    const cats = await this.catRepository.find({ breed });
    return cats;
  }

  async createCat(createCatDto: CreateCatDto) {
    // this method will first loop through all the toys that's in the createCatDto, and
    // will call the preloadToyByName method.
    const favoriteToys = await Promise.all(
      createCatDto.favoriteToys.map((toy) => this.preloadToyByName(toy.name)),
    );
    const hatedToys = await Promise.all(
      createCatDto.hatedToys.map((toy) => this.preloadToyByName(toy.name)),
    );

    const newLocal = {
      ...createCatDto,
      hatedToys,
      favoriteToys,
    };
    // To create new cat, first create an instance of the cat, with the new toy arrays added to it
    const newCat = this.catRepository.create(newLocal);
    // Then save it to the repository
    return this.catRepository.save(newCat);
  }

  async updateCat(id: number, updateCatDto: UpdateCatDto) {
    // this method will first loop through all the toys that's in the updateCatDto, and
    // will call the preloadToyByName method.
    const favoriteToys = updateCatDto.favoriteToys
      ? await Promise.all(
          updateCatDto.favoriteToys.map((toy) =>
            this.preloadToyByName(toy.name),
          ),
        )
      : updateCatDto.favoriteToys;

    const hatedToys = updateCatDto.hatedToys
      ? await Promise.all(
          updateCatDto.hatedToys.map((toy) => this.preloadToyByName(toy.name)),
        )
      : updateCatDto.hatedToys;

    // Preload repository method creates a new entity based on the object passed into it
    // It checks if it already exists in the database, and if so, retrieves it
    // If entity exists already, preload replaces all the values with the new ones passed into it
    // If the entity with that id doesn't exist, it returns undefined
    // So always handle the undefined
    const cat = await this.catRepository.preload({
      ...updateCatDto,
      id,
      favoriteToys,
      hatedToys,
    });

    if (!cat) {
      throw new NotFoundException(
        `Cat with the id of ${id} couldn't be found.`,
      );
    }
    // If everything goes okay, we can save it to our database
    return this.catRepository.save(cat);
  }

  async removeCat(id: number) {
    const cat = await this.catRepository.findOne(id);
    // We don't need to throw an error if the cat is not found, because the findOne method
    // automatically handles that for us.
    return this.catRepository.remove(cat);
  }

  private async preloadToyByName(name: string): Promise<Toy> {
    // If a toy with this name exists, return it. If it doesn't exist, create it:
    const existingToy = await this.toyRepository.findOne({ name });
    if (existingToy) {
      return existingToy;
    }
    return this.toyRepository.create({ name });
  }

  async recommendToy(cat: Cat, toyId: number) {
    // Create a new queryRunner instance
    const queryRunner = this.connection.createQueryRunner();

    // Establish a connection with the new queryRunner instance
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // We wrap the entire transaction logic in a try-catch-finally block so if anything goes wrong, we can handle it:
    try {
      cat.recommendations++;

      const triggeredEvent = new Event();
      triggeredEvent.name = 'recommend_toy';
      triggeredEvent.type = 'toy';
      triggeredEvent.payload = { catId: cat.id, toyId };

      await queryRunner.manager.save(cat);
      await queryRunner.manager.save(triggeredEvent);
      // If either saving cat or the triggeredEvent fails, the request will fall to the catch block

      await queryRunner.commitTransaction();
    } catch (err) {
      // if something goes wrong, we take the whole transaction operation back
      await queryRunner.rollbackTransaction();
    } finally {
      // Once everything is finished, you should close (or release) the queryRunner:
      await queryRunner.release();
    }
    // Alternative way of doing the same thing:
    // await this.connection.transaction(async (manager) => {
    //   cat.recommendations++;

    //   const triggeredEvent = new Event();
    //   triggeredEvent.name = 'recommend_toy';
    //   triggeredEvent.type = 'toy';
    //   triggeredEvent.payload = { catId: cat.id, toyId };

    //   await manager.save(cat);
    //   await manager.save(triggeredEvent);
    // });
  }
}
