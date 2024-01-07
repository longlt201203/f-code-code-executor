import { Injectable } from '@nestjs/common';
import { ExecuteCodeDto } from 'src/code/dto/execute-code.dto';
import { performance } from 'perf_hooks';
import { execSync, spawn } from 'child_process';
import { ExecuteResultDto } from 'src/code/dto/execute-result.dto';
import * as pidusage from "pidusage";
import { randomFillSync } from 'node:crypto';
import * as fs from "fs";
import { PlatformService } from 'src/platform/platform.service';
import { Executor } from 'src/utils/executor';

@Injectable()
export class CodeService {
    constructor(
        private readonly platformService: PlatformService
    ) {}

    async executeCode(dto: ExecuteCodeDto) {
        const platform = await this.platformService.findOne(dto.platform);
        const executor = new Executor(platform);
        return executor.start(dto.code, dto.input);
    }
}
