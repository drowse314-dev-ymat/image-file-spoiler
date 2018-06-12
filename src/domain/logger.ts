"use strict";

export interface Logger {
    log(domain: string, content: any, message?: string): void;
}
