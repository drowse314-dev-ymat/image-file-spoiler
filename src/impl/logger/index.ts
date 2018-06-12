"use strict";

import { injectable } from "inversify";

import { Logger } from "../../domain/logger";

@injectable()
export class ConsoleLogger implements Logger {
    public log(domain: string, content: any, message?: string) {
        const noContent = content === null || content === undefined;
        console.log(
            `[${domain}] ${message ? message + ": " : ""}${
                noContent ? "<no data>" : JSON.stringify(content, null, "")
            }`
        );
    }
}
