import { Injectable } from '@nestjs/common';
import { ExecuteCodeDto } from 'src/code/dto/execute-code.dto';
import { performance } from 'perf_hooks';
import { spawn } from 'child_process';
import { ExecuteResultDto } from 'src/code/dto/execute-result.dto';
import * as pidusage from "pidusage";
import { randomFillSync } from 'node:crypto';

@Injectable()
export class CodeService {
    async executeCode(dto: ExecuteCodeDto) {
        return new Promise<ExecuteResultDto>((resolve, reject) => {
            // Preparing the process
            let maxMem = 0;
            let maxCpu = 0;
            const outputs = [];
            const command = `docker run -i ${dto.platform} node ${dto.code}`;

            // Spawn the child process
            const startTime = performance.now();
            const cp = spawn(command, [dto.input], {
                detached: true,
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
