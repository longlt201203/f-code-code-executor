import { Module } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { PlatformController } from './platform.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from 'src/platform/entities/platform.entity';

@Module({
  controllers: [PlatformController],
  providers: [PlatformService],
  imports: [TypeOrmModule.forFeature([Platform])],
  exports: [PlatformService]
})
export class PlatformModule {}
