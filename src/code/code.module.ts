import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { PlatformModule } from 'src/platform/platform.module';

@Module({
  controllers: [CodeController],
  providers: [CodeService],
  imports: [PlatformModule]
})
export class CodeModule {}
