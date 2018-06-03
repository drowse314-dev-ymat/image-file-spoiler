"use strict";

import { ImageFileRef } from "../image-file";

export interface ObjectLabelsInImage {
    labelsWithConfidence: ReadonlyMap<string, number>;
}

export interface ImageRecognizer {
    findObjects(imageFileRef: ImageFileRef): Promise<ObjectLabelsInImage>;
}
