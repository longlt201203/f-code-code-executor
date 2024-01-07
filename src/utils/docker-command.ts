import { Command } from "./command";

export class DockerCommand extends Command {
    constructor() {
        super("docker");
    }

    run(image: string, ...options: string[]) {
        this.options.push("run", ...options, image);
        return this;
    }

    volume(vol: string, dest: string) {
        this.options.push("-v", `${vol}:${dest}`);
        return this;
    }

    pull(image: string, ...options: string[]) {
        this.options.push("pull", ...options, image);
        return this;
    }
}