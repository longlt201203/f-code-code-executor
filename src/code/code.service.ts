import { Injectable } from '@nestjs/common';
import { ExecuteCodeDto } from 'src/code/dto/execute-code.dto';
import { performance } from 'perf_hooks';
import { execSync, spawn } from 'child_process';
import { ExecuteResultDto } from 'src/code/dto/execute-result.dto';
import * as pidusage from "pidusage";
import { randomFillSync } from 'node:crypto';
import * as fs from "fs";
import { PlatformService } from 'src/platform/platform.service';

@Injectable()
export class CodeService {
    constructor(
        private readonly platformService: PlatformService
    ) {}

    init() {

    }

    execute() {

    }

    clean() {

    }

    async executeCode(dto: ExecuteCodeDto) {
        const platform = await this.platformService.findOne(dto.platform);
        


        return new Promise<ExecuteResultDto>((resolve, reject) => {
            // try {

            // } catch (err) {
            //     reject(err);
            // }
            // Create temporary folder to perform actions
            const secret = randomFillSync(Buffer.alloc(10)).toString("hex");
            const execName = `${platform.name} - ${secret}`;
            fs.mkdirSync(execName);
            
            // Build the code (if need)
            if (platform.buildCommand) {
                fs.writeFileSync(`${execName}/${execName}.${platform.fileExt}`, dto.code);
                try {
                    // const buildOutput = execSync();
                } catch (err) {

                }
            }


            
            // Preparing the process
            let maxMem = 0;
            let maxCpu = 0;
            const outputs = [];
            const command = `docker run -i ${dto.platform} node ${dto.code}`;

            // Spawn the child process
            const startTime = performance.now();
            const cp = spawn(command, [dto.input], {
                shell: true,
                stdio: ["pipe", "pipe", "pipe"],
                timeout: 10000,
            });

            // Start the metric
            const metricId = setInterval(async () => {
                const stats = await pidusage(cp.pid);
                if (stats.cpu > maxCpu) {
                    maxCpu = stats.cpu;
                }
                if (stats.memory > maxMem) {
                    maxMem = stats.memory;
                }
            }, 50);

            // Collect data
            cp.stdout.on("data", (chunk) => {
                outputs.push(chunk);
            });

            // Process done
            cp.on("close", (code, signal) => {
                // Stop the metric
                clearInterval(metricId);

                // Stop timer
                const endTime = performance.now();

                // Return data
                resolve({
                    status: "success",
                    cpuUsage: maxCpu,
                    execTime: endTime-startTime,
                    exitCode: code,
                    memUsage: maxMem,
                    output: outputs.join("\n")
                });
            });

            // Process error
            cp.on("error", (err) => {
                // Stop the metric
                clearInterval(metricId);

                // Stop timer
                const endTime = performance.now();

                // Return data
                resolve({
                    status: "runtime_error",
                    cpuUsage: maxCpu,
                    execTime: endTime-startTime,
                    exitCode: -999999,
                    memUsage: maxMem,
                    output: err.message
                });
            });
        });
    }
}
