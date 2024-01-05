export class ExecuteResultDto {
    status: "success" | "compile_error" | "runtime_error";
    exitCode: number;
    execTime: number;
    memUsage: number;
    cpuUsage: number;
    output: string;
}