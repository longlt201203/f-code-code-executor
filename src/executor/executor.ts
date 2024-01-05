import { randomFillSync } from "node:crypto";
import { ExecuteResult } from "src/executor/execute-result";
import { ExecutorExeception } from "src/executor/executor-exception";
import { Platform } from "src/platform/entities/platform.entity";

export type ExecuteStatus = "success" | "compile_error" | "runtime_error";

export class Executor {
    private pid: number;
    private metricId: number;
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

    private async init() {

    }

    private async execute() {}

    private clean() {}

    async start(): Promise<ExecuteResult> {
        let status: ExecuteStatus = "success";

        try {
            await this.init();
            await this.execute();
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