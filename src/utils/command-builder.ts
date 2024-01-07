import { DockerCommand } from "./docker-command";

export class CommandBuilder {
    static dockerCommand() {
        return new DockerCommand();
    }
}