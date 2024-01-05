import { Body, Controller, Post } from '@nestjs/common';
import { CodeService } from './code.service';
import { ExecuteCodeDto } from 'src/code/dto/execute-code.dto';

@Controller('code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post("execute")
  execute(@Body() dto: ExecuteCodeDto) {
    return this.codeService.executeCode(dto);
  }
}
