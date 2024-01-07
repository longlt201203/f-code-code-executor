import { ExecuteStatus } from "src/utils/executor";

export class ExecuteResult {
    status: ExecuteStatus;
    exitCode: number;
    execTime: number;
    memUsage: number;
    cpuUsage: number;
    output: string;
}