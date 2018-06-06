"use strict";

import { Container } from "inversify";

import { ROLES } from "../domain/roles";
import { PublishImageFileSpoilerMessage } from "../domain/usecases/publish-image-file-spoiler-message";

export const buildServiceRegistry = (): Container => {
    const registry = new Container({ defaultScope: "Singleton" });

    registry
        .bind<PublishImageFileSpoilerMessage>(
            ROLES.PublishImageFileSpoilerMessage
        )
        .to(PublishImageFileSpoilerMessage);

    return registry;
};
