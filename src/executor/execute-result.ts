import { ExecuteStatus } from "src/executor/executor";

export class ExecuteResult {
    status: ExecuteStatus;
    exitCode: number;
    execTime: number;
    memUsage: number;
    cpuUsage: number;
    output: string;
}