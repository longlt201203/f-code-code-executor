import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeModule } from './code/code.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from 'src/utils/validation.pipe';
import { DbModule } from './db/db.module';
import { PlatformModule } from './platform/platform.module';
import { ExecutorModule } from './executor/executor.module';
import MyExceptionFilter from 'src/utils/my-exception.filter';

@Module({
  imports: [CodeModule, DbModule, PlatformModule, ExecutorModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    {
      provide: APP_FILTER,
      useClass: MyExceptionFilter
    },
    AppService
  ],
})
export class AppModule {}
