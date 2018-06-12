"use strict";

export const ROLES = {
    // usecases
    PublishImageFileSpoilerMessage: Symbol("PublishImageFileSpoilerMessage"),

    // domain roles
    NewImageFileEventProvider: Symbol("NewImageFileEventProvider"),
    ImageRecognizer: Symbol("ImageRecognizer"),
    ImageFileSpoilerMessageSink: Symbol("ImageFileSpoilerMessageSink"),

    // utilities
    RuntimeConfigProvider: Symbol("RuntimeConfigProvider"),
    Logger: Symbol("Logger")
};
