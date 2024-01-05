import { ExecuteStatus } from "src/executor/executor";

export class ExecutorExeception extends Error {
    status: ExecuteStatus;

    constructor(status: ExecuteStatus, message: string) {
        super(message);
        this.status = status;
    }
}