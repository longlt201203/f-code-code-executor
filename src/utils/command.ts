export class Command {
    constructor(
        protected readonly cmd: string,
        protected readonly options: string[] = [],
        protected readonly aliases: { [key: string]: string } = {}
    ) {}

    get Options() {
        return this.options;
    }

    get Aliases() {
        return this.aliases;
    }
    
    toString() {
        let command = this.cmd;
        if (this.options && this.options.length > 0) {
            command = `${command} ${this.options.join(" ")}`;
        }
        if (this.aliases && Object.keys(this.aliases).length > 0) {
            Object.keys(this.aliases).forEach(key => {
                command = command.replaceAll(key, `"${this.aliases[key]}"`);
            });
        }
        return command;
    }
}