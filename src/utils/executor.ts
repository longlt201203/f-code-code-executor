import { randomFillSync } from "node:crypto";
import { ExecuteResult } from "src/executor/execute-result";
import { ExecutorExeception } from "src/executor/executor-exception";
import { Platform } from "src/platform/entities/platform.entity";
import * as fs from "fs";
import { exec, spawn } from "node:child_process";
import { rimrafSync } from "rimraf";
import * as pidusage from "pidusage";
import { CommandBuilder } from "./command-builder";

export type ExecuteStatus = "success" | "compile_error" | "runtime_error";

export class Executor {
    private metricId: NodeJS.Timeout;
    private secret: string;
    private execName: string;
    private cpuUsage: number;
    private execTime: number;
    private exitCode: number;
    private memUsage: number;
    private output: string;

    constructor(private readonly platform: Platform) {
        this.secret = randomFillSync(Buffer.alloc(16)).toString("hex");
        this.execName = `${platform.name} - ${this.secret}`;
    }

    private async init(code: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Create a folder to pack your code
            fs.mkdirSync(this.execName);

            // Store code to temporary file
            const codeFilePath = `${this.execName}/${this.execName}.${this.platform.fileExt}`;
            fs.writeFileSync(codeFilePath, code);

            // Build file
            if (this.platform.buildCommand) {
                const command = CommandBuilder.dockerCommand();
                command.volume(`/${this.execName}`, `/app`);
                command.run(this.platform.dockerImage, "-i");
                command.Options.push(`cd /app | ${this.platform.buildCommand}`);
                command.Aliases["{file}"] = `${this.execName}.${this.platform.fileExt}`;

                exec(command.toString(), (err, stdout, stderr) => {
                    if (err) {
                        reject(new ExecutorExeception("compile_error", stderr));
                    }
                });
            }
            resolve();
        });
    }

    private async execute(input: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Prepare to execute
            let maxMem = 0;
            let maxCpu = 0;
            const outputs = [];
            const command = CommandBuilder.dockerCommand();
            command.volume(`"/${this.execName}"`, `/app`);
            command.run(this.platform.dockerImage, "-i");
            command.Options.push(`cd /app | ${this.platform.execCommand}`);
            command.Aliases["{file}"] = `${this.execName}.${this.platform.fileBuiltExt ? this.platform.fileBuiltExt : this.platform.fileExt}`;
            console.log(command.toString());

            // Spawn the child process
            const startTime = performance.now();
            const cp = spawn(command.toString(), [input], {
                shell: true,
                stdio: ["pipe", "pipe", "pipe"],
                timeout: 10000,
            });

            cp.on("spawn", () => {
                // Start the metric
                this.metricId = setInterval(async () => {
                    try {
                        const stats = await pidusage(cp.pid);
                        if (stats.cpu > maxCpu) {
                            maxCpu = stats.cpu;
                        }
                        if (stats.memory > maxMem) {
                            maxMem = stats.memory;
                        }
                    } catch (err) {
                    }
                }, 50);
            });

            // Collect data
            cp.stdout.on("data", (chunk) => {
                outputs.push(chunk);
            });

            // Process done
            cp.on("close", (code, signal) => {
                // Stop timer
                const endTime = performance.now();

                // Update data
                this.cpuUsage = maxCpu;
                this.memUsage = maxMem;
                this.exitCode = code;
                this.output = outputs.join("\n");
                this.execTime = endTime - startTime;
                resolve();
            });

            // Process error
            cp.on("error", (err) => {
                // Stop timer
                const endTime = performance.now();

                // Return data
                this.cpuUsage = maxCpu;
                this.memUsage = maxMem;
                this.exitCode = -99999;
                this.output = outputs.join("\n");
                this.execTime = endTime - startTime;
                reject(new ExecutorExeception("runtime_error", err.message));
            });
        });
    }

    private clean() {
        // // Remove folder
        // rimrafSync(this.execName);

        // Stop the metric
        clearInterval(this.metricId);
    }

    async start(code: string, input: string): Promise<ExecuteResult> {
        let status: ExecuteStatus = "success";

        try {
            await this.init(code);
            await this.execute(input);
        } catch (err) {
            if (err instanceof ExecutorExeception) {
                status = err.status;
                this.output = err.message;
            } else {
                throw err;
            }
        } finally {
            this.clean();
            return {
                status,
                cpuUsage: this.cpuUsage,
                execTime: this.execTime,
                exitCode: this.exitCode,
                memUsage: this.memUsage,
                output: this.output
            };
        }
    }
}