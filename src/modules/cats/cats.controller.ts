import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { PaginationQueryDto } from './common/dto/pagination-query.dto';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}
  @Get()
  findAllCats(@Query() paginationQuery: PaginationQueryDto) {
    return this.catsService.findAllCats(paginationQuery);
  }

  @Get('breed/:breed')
  findBreed(@Param('breed') breed: string) {
    return this.catsService.findBreed(breed);
  }

  @Get(':id')
  findOneCat(@Param('id') id: number) {
    return this.catsService.findOneCat(id);
  }

  @Get(':breedId/:catId')
  findCat(@Param('catId') catId: number) {
    return `You are looking for the cat with the id of ${catId}.`;
  }

  @Post()
  // @HttpCode(HttpStatus.I_AM_A_TEAPOT)
  createCat(@Body() createCatDto: CreateCatDto) {
    return this.catsService.createCat(createCatDto);
  }

  @Patch(':id')
  updateCat(@Param('id') id: number, @Body() body: UpdateCatDto) {
    return this.catsService.updateCat(id, body);
  }

  @Delete(':id')
  removeCat(@Param('id') id: number) {
    return this.catsService.removeCat(id);
  }

  @Post('/recommend/:catId/:toyId')
  async recommendToy(
    @Param('catId') catId: number,
    @Param('toyId') toyId: number,
  ) {
    const cat = await this.catsService.findOneCat(catId);
    return await this.catsService.recommendToy(cat, toyId);
  }
}
