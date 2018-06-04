"use strict";

import { inject, injectable } from "inversify";

import { ROLES } from "../roles";
import { NewImageFileEventProvider } from "../image-file";
import { ImageRecognizer } from "../image-recognizer";
import { ImageFileSpoilerMessageSink } from "../image-file-spoiler-message";

@injectable()
export class PublishImageFileSpoilerMessage {
    public constructor(
        @inject(ROLES.NewImageFileEventProvider)
        private newImageFileEventProvider: NewImageFileEventProvider,
        @inject(ROLES.ImageRecognizer) //
        private imageRecognizer: ImageRecognizer,
        @inject(ROLES.ImageFileSpoilerMessageSink)
        private imageFileSpoilerMessageSink: ImageFileSpoilerMessageSink
    ) {}

    public invoke(): Promise<void> {
        // fake reference
        this.newImageFileEventProvider;
        this.imageRecognizer;
        this.imageFileSpoilerMessageSink;

        return Promise.resolve();
    }
}
