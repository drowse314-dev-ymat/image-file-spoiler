"use strict";

import "reflect-metadata";

import { buildServiceRegistry } from "../config";
import { ROLES } from "../domain/roles";

import { PublishImageFileSpoilerMessage } from "../domain/usecases/publish-image-file-spoiler-message";
import { NewImageFileEventProvider } from "../domain/image-file/image-file-event";
import { CliNewImageFileEventProvider } from "../impl/image-file";
import { ImageFileSpoilerMessageSink } from "../domain/image-file-spoiler-message";
import { Logger } from "../domain/logger";

const main = () => {
    const serviceRegistry = buildServiceRegistry();
    serviceRegistry
        .bind<NewImageFileEventProvider>(ROLES.NewImageFileEventProvider)
        .to(CliNewImageFileEventProvider);

    const logger = serviceRegistry.get<Logger>(ROLES.Logger);
    const messageLogger: ImageFileSpoilerMessageSink = {
        publish: message => {
            logger.log("MessageLogger in main", message, "message received");
            return Promise.resolve();
        }
    };
    serviceRegistry
        .bind<ImageFileSpoilerMessageSink>(ROLES.ImageFileSpoilerMessageSink)
        .toConstantValue(messageLogger);

    const usecase = serviceRegistry.get<PublishImageFileSpoilerMessage>(
        ROLES.PublishImageFileSpoilerMessage
    );
    usecase.serve();
};

main();
