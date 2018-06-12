"use strict";

import * as fs from "fs";
import * as readline from "readline";
import { inject, injectable } from "inversify";

import { ROLES } from "../../domain/roles";
import {
    NewImageFileEventProvider,
    NewImageFileEvent
} from "../../domain/image-file";
import { Logger } from "../../domain/logger";

@injectable()
export class CliNewImageFileEventProvider implements NewImageFileEventProvider {
    private eventSubscriberFns: ((
        ev: NewImageFileEvent
    ) => Promise<void>)[] = [];

    public constructor(@inject(ROLES.Logger) private logger: Logger) {
        this.logger.log(
            "CliNewImageFileEventProvider",
            null,
            "start reading from stdin"
        );
        const reader = readline.createInterface({
            input: process.stdin
        });

        reader
            .on("line", (line: string) => {
                const path = line.trim();

                const getContent = (): Promise<NodeJS.ReadableStream> => {
                    if (!fs.existsSync(path)) {
                        return Promise.reject(`path not found: "${path}"`);
                    }
                    return Promise.resolve(fs.createReadStream(path));
                };
                const newImageFileEvent: NewImageFileEvent = {
                    eventTimestampMillis: new Date().valueOf(),
                    getImageFileRef: () => {
                        return Promise.resolve({
                            getContent
                        });
                    }
                };
                this.eventSubscriberFns.forEach(subscriberFn =>
                    subscriberFn(newImageFileEvent).catch(err =>
                        this.logger.log(
                            "CliNewImageFileEventProvider",
                            err,
                            "error from subscriber function"
                        )
                    )
                );
            })
            .on("close", () => {
                this.logger.log(
                    "CliNewImageFileEventProvider",
                    null,
                    "terminate reader"
                );
            });
    }

    public get(): Promise<NewImageFileEvent> {
        throw new Error("not implemented");
    }

    public subscribe(
        subscriberFn: (ev: NewImageFileEvent) => Promise<void>
    ): this {
        this.eventSubscriberFns.push(subscriberFn);
        return this;
    }
}
