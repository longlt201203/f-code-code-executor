import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('platform')
@ApiTags("platform")
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Post()
  create(@Body() createPlatformDto: CreatePlatformDto) {
    return this.platformService.create(createPlatformDto);
  }

  @Get()
  findAll() {
    return this.platformService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.platformService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.platformService.remove(id);
  }
}
