"use strict";

export interface ImageFileRef {
    getContent(): Promise<NodeJS.ReadableStream>;
}
