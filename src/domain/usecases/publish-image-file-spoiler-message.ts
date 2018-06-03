"use strict";

import { inject } from "inversify";

import { ROLES } from "../roles";
import { NewImageFileEventProvider } from "../image-file";
import { ImageRecognizer } from "../image-recognizer";
import { ImageFileSpoilerMessageSink } from "../image-file-spoiler-message";

export class PublishImageFileSpoilerMessage {
    public constructor(
        @inject(ROLES.NewImageFileEventProvider)
        private newImageFileEventProvider: NewImageFileEventProvider,
        @inject(ROLES.ImageRecognizer) //
        private imageRecognizer: ImageRecognizer,
        @inject(ROLES.ImageFileSpoilerMessageSink)
        private imageFileSpoilerMessageSink: ImageFileSpoilerMessageSink
    ) {}

    public invole(): Promise<void> {
        // fake reference
        this.newImageFileEventProvider;
        this.imageRecognizer;
        this.imageFileSpoilerMessageSink;

        return Promise.resolve();
    }
}
