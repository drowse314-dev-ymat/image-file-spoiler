"use strict";

import { ImageFileRef } from "../image-file";

export interface ObjectLabelsInImage {
    labelsWithConfidence: { label: string; confidence: number }[];
}

export interface ImageRecognizer {
    findObjects(imageFileRef: ImageFileRef): Promise<ObjectLabelsInImage>;
}
