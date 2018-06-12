"use strict";

import { ImageFileRef } from "./image-file-ref";

export interface NewImageFileEvent {
    // 新しい画像ファイルの発生を `NewImageFileEventProvider` が認識した時刻
    eventTimestampMillis: number;

    getImageFileRef(): Promise<ImageFileRef>;
}

export interface NewImageFileEventProvider {
    get(): Promise<NewImageFileEvent>;
    subscribe(fn: (ev: NewImageFileEvent) => Promise<void>): this;
}
