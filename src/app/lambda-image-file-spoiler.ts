"use strict";

import "reflect-metadata";
import * as AWSLambda from "aws-lambda";

import { buildServiceRegistry } from "../config";
import { ROLES } from "../domain/roles";

import { PublishImageFileSpoilerMessage } from "../domain/usecases/publish-image-file-spoiler-message";
import { NewImageFileEventProvider } from "../domain/image-file/image-file-event";
import { SlackImageFileEventProviderFactory } from "../impl/image-file";
import { ImageFileSpoilerMessageSink } from "../domain/image-file-spoiler-message";
import { SlackImageFileCommentatorFactory } from "../impl/image-file-spoiler-message";
import { Logger } from "../domain/logger";

export const handler: AWSLambda.Handler = async (event, _context, callback) => {
    const serviceRegistry = buildServiceRegistry();

    const logger = serviceRegistry.get<Logger>(ROLES.Logger);
    logger.log("handler", event, "invoked with event payload");

    return serviceRegistry
        .resolve(SlackImageFileEventProviderFactory)
        .getProvider(event)
        .then(({ provider, slackNewFileEvent }) => {
            serviceRegistry
                .bind<NewImageFileEventProvider>(
                    ROLES.NewImageFileEventProvider
                )
                .toConstantValue(provider);

            const imageFileSpoilerMessageSink = serviceRegistry
                .resolve(SlackImageFileCommentatorFactory)
                .createSlackImageFileCommentator(
                    slackNewFileEvent.event.file_id
                );
            serviceRegistry
                .bind<ImageFileSpoilerMessageSink>(
                    ROLES.ImageFileSpoilerMessageSink
                )
                .toConstantValue(imageFileSpoilerMessageSink);

            const usecase = serviceRegistry.get<PublishImageFileSpoilerMessage>(
                ROLES.PublishImageFileSpoilerMessage
            );
            return usecase.invoke();
        })
        .then(
            () => {
                logger.log("handler", null, "Execution succeeded");
                callback(null);
            },
            err => {
                logger.log("handler", err.message, "Execution failed");
                // リトライはしないで欲しい
                callback(null, err);
            }
        );
};
