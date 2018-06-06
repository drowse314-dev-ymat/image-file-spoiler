"use strict";

import {
    NewImageFileEventProvider,
    NewImageFileEvent
} from "../domain/image-file";
import {
    ImageRecognizer,
    ObjectLabelsInImage
} from "../domain/image-recognizer";
import {
    ImageFileSpoilerMessageSink,
    ImageFileSpoilerMessage
} from "../domain/image-file-spoiler-message";

export const createNewImageFileEventProviderMock = (
    event: NewImageFileEvent
): NewImageFileEventProvider => {
    return {
        get: () => Promise.resolve(event)
    };
};

export const createImageRecognizerMock = (
    result: ObjectLabelsInImage
): ImageRecognizer => {
    return {
        findObjects: _imageFileRef => Promise.resolve(result)
    };
};

export const createImageFileSpoilerMessageSinkMock = (
    sink: ImageFileSpoilerMessage[]
): ImageFileSpoilerMessageSink => {
    return {
        publish: message => {
            sink.push(message);
            return Promise.resolve();
        }
    };
};
