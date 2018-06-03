"use strict";

export interface ImageFileSpoilerMessage {
    // messageの文言に依らず内容を論理的に示す表現
    formalExpr: string;

    mesage: string;
}

export interface ImageFileSpoilerMessageSink {
    publish(message: ImageFileSpoilerMessage): Promise<void>;
}
