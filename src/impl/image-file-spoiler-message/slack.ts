"use strict";

import { inject, injectable } from "inversify";
import { WebClient } from "@slack/client";

import { ROLES } from "../../domain/roles";
import { ImageFileSpoilerMessageSink } from "../../domain/image-file-spoiler-message";
import { RuntimeConfigProvider } from "../../domain/runtime-config";

@injectable()
export class SlackImageFileCommentatorFactory {
    private slackClient: WebClient;

    public constructor(
        @inject(ROLES.RuntimeConfigProvider)
        configProvider: RuntimeConfigProvider
    ) {
        const config = configProvider.get();
        this.slackClient = new WebClient(config.slack.apiToken);
    }

    public createSlackImageFileCommentator(
        fileId: string
    ): ImageFileSpoilerMessageSink {
        const addCommentToFile = (comment: string) => {
            return this.slackClient.files.comments
                .add({
                    file: fileId,
                    comment
                })
                .then(_ => {});
        };

        return {
            publish: message => addCommentToFile(message.message)
        };
    }
}
