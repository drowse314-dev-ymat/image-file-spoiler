"use strict";

import { Container } from "inversify";

import { ROLES } from "../domain/roles";

import { PublishImageFileSpoilerMessage } from "../domain/usecases/publish-image-file-spoiler-message";

import { ImageRecognizer } from "../domain/image-recognizer";
import { AmazonRekognitionImageRecognizer } from "../impl/image-recognizer";

import { RuntimeConfigProvider } from "../domain/runtime-config";
import { EnvironmentRuntimeConfigProvider } from "../impl/runtime-config";
import { Logger } from "../domain/logger";
import { ConsoleLogger } from "../impl/logger";

export const buildServiceRegistry = (): Container => {
    const registry = new Container({ defaultScope: "Singleton" });

    // usecases
    registry
        .bind<PublishImageFileSpoilerMessage>(
            ROLES.PublishImageFileSpoilerMessage
        )
        .to(PublishImageFileSpoilerMessage);

    // roles
    registry
        .bind<ImageRecognizer>(ROLES.ImageRecognizer)
        .to(AmazonRekognitionImageRecognizer);

    // utilities
    registry
        .bind<RuntimeConfigProvider>(ROLES.RuntimeConfigProvider)
        .to(EnvironmentRuntimeConfigProvider);
    registry.bind<Logger>(ROLES.Logger).to(ConsoleLogger);

    return registry;
};
