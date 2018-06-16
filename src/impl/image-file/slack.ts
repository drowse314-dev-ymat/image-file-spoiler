"use strict";

import * as https from "https";
import * as url from "url";
import { inject, injectable } from "inversify";
import { WebClient } from "@slack/client";
import * as mime from "mime";

import { ROLES } from "../../domain/roles";
import {
    NewImageFileEventProvider,
    NewImageFileEvent
} from "../../domain/image-file";
import { RuntimeConfigProvider } from "../../domain/runtime-config";
import { Logger } from "../../domain/logger";

interface SlackNewFileEvent {
    event: {
        type: "file_shared";
        file_id: string;
        user_id: string;
        file: {
            id: string;
        };
        event_ts: string;
    };
}

interface SlackFileInfo {
    id: string;
    name: string;
    url_private_download: string;
}

class SlackImageFileEventProvider implements NewImageFileEventProvider {
    public constructor(
        private eventTimestampMillis: number,
        private download: () => Promise<NodeJS.ReadableStream>
    ) {}

    public get(): Promise<NewImageFileEvent> {
        return Promise.resolve({
            eventTimestampMillis: this.eventTimestampMillis,
            getImageFileRef: () =>
                Promise.resolve({
                    getContent: () => this.download()
                })
        });
    }

    public subscribe(_fn: (event: NewImageFileEvent) => Promise<void>): this {
        throw new Error("not implemented");
        return this;
    }
}

@injectable()
export class SlackImageFileEventProviderFactory {
    private slackApiToken: string;
    private slackClient: WebClient;

    public constructor(
        @inject(ROLES.RuntimeConfigProvider)
        configProvider: RuntimeConfigProvider,
        @inject(ROLES.Logger) private logger: Logger
    ) {
        const config = configProvider.get();
        this.slackApiToken = config.slack.apiToken;
        this.slackClient = new WebClient(this.slackApiToken);
    }

    public getProvider(
        incomingEvent: any
    ): Promise<{
        provider: NewImageFileEventProvider;
        slackNewFileEvent: SlackNewFileEvent;
    }> {
        const asSlackEvent = <SlackNewFileEvent>incomingEvent;
        const isLikeSlackNewFileEvent =
            asSlackEvent.event &&
            asSlackEvent.event.type === "file_shared" &&
            asSlackEvent.event.file_id;

        if (!isLikeSlackNewFileEvent) {
            return Promise.reject(
                new Error(
                    "incoming payload does not look like a Slack new file event"
                )
            );
        }

        const getFileInfo = (): Promise<SlackFileInfo> =>
            this.slackClient.files
                .info({
                    file: asSlackEvent.event.file_id,
                    count: 0
                })
                .then(result => {
                    if (!result.ok) {
                        return Promise.reject(
                            new Error(
                                `failed to get file info: "${
                                    asSlackEvent.event.file
                                }"`
                            )
                        );
                    }

                    const asSlackFileInfo = <SlackFileInfo>(result as any).file;
                    const mimeType = mime.getType(asSlackFileInfo.name);

                    if (!mimeType || !mimeType.startsWith("image/")) {
                        return Promise.reject(
                            new Error(
                                `new file does not look like an image: "${
                                    asSlackFileInfo.name
                                }"`
                            )
                        );
                    }

                    return Promise.resolve(asSlackFileInfo);
                });

        const downloadFile = (
            fileInfo: SlackFileInfo
        ): Promise<NodeJS.ReadableStream> => {
            try {
                this.logger.log(
                    "SlackImageFileEventProviderFactory",
                    fileInfo,
                    "download image file requested"
                );
                return new Promise<NodeJS.ReadableStream>(resolve => {
                    const options = Object.assign(
                        {},
                        url.parse(fileInfo.url_private_download),
                        {
                            headers: {
                                Authorization: `Bearer ${this.slackApiToken}`
                            }
                        }
                    );
                    https.get(options, res => resolve(res));
                });
            } catch (e) {
                return Promise.reject(e);
            }
        };

        return getFileInfo().then(fileInfo => ({
            provider: new SlackImageFileEventProvider(
                new Date().valueOf(),
                () => downloadFile(fileInfo)
            ),
            slackNewFileEvent: asSlackEvent
        }));
    }
}
