"use strict";

import { inject, injectable } from "inversify";
import * as _ from "lodash";

import { ROLES } from "../roles";
import { NewImageFileEventProvider, NewImageFileEvent } from "../image-file";
import { ImageRecognizer, ObjectLabelsInImage } from "../image-recognizer";
import {
    ImageFileSpoilerMessageSink,
    ImageFileSpoilerMessage
} from "../image-file-spoiler-message";

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
        return this.newImageFileEventProvider
            .get()
            .then(newImageFileEvent =>
                this.handleNewImageFileEvent(newImageFileEvent)
            );
    }

    public serve(): void {
        this.newImageFileEventProvider.subscribe(newImageFileEvent =>
            this.handleNewImageFileEvent(newImageFileEvent)
        );
    }

    private handleNewImageFileEvent(
        newImageFileEvent: NewImageFileEvent
    ): Promise<void> {
        return newImageFileEvent
            .getImageFileRef()
            .then(imageFileRef =>
                this.imageRecognizer.findObjects(imageFileRef)
            )
            .then(objectLabelsInImage =>
                this.composeImageFileSpoilerMessage(
                    newImageFileEvent,
                    objectLabelsInImage
                )
            )
            .then(message => this.imageFileSpoilerMessageSink.publish(message));
    }

    private composeImageFileSpoilerMessage(
        _newImageFileEvent: NewImageFileEvent,
        objectLabelsInImage: ObjectLabelsInImage
    ): Promise<ImageFileSpoilerMessage> {
        const maxConfidence = Math.max(
            ...objectLabelsInImage.labelsWithConfidence.map(kv => kv.confidence)
        );

        const spoilerMessageBuilder = this.getSpoilerMessageBuilder(
            maxConfidence
        );

        const pickupLabels = _
            .sortBy(
                objectLabelsInImage.labelsWithConfidence.filter(kv =>
                    spoilerMessageBuilder.filterLabel(kv.confidence)
                ),
                kv => -1 * kv.confidence
            )
            .map(kv => kv.label);

        const message: ImageFileSpoilerMessage = {
            formalExpr:
                pickupLabels.length > 1
                    ? `or(${spoilerMessageBuilder.formatFormalExpr(
                          pickupLabels
                      )})`
                    : spoilerMessageBuilder.formatFormalExpr(pickupLabels),
            message: spoilerMessageBuilder.formatMessage(pickupLabels)
        };
        return Promise.resolve(message);
    }

    private getSpoilerMessageBuilder(
        maxConfidence: number
    ): {
        filterLabel: (confidence: number) => boolean;
        formatFormalExpr: (labels: string[]) => string;
        formatMessage: (labels: string[]) => string;
    } {
        if (maxConfidence >= 0.9) {
            return {
                filterLabel: c => c >= 0.9,
                formatFormalExpr: labels =>
                    labels.map(l => `certainly(${l})`).join(", "),
                formatMessage: labels => `${labels.join("か")}です！`
            };
        }
        if (maxConfidence >= 0.7) {
            return {
                filterLabel: c => c >= 0.7,
                formatFormalExpr: labels =>
                    labels.map(l => `probably(${l})`).join(", "),
                formatMessage: labels => `${labels.join("か")}だと思われます。`
            };
        }
        if (maxConfidence > 0.5) {
            return {
                filterLabel: c => c > 0.5,
                formatFormalExpr: labels =>
                    labels.map(l => `possibly(${l})`).join(", "),
                formatMessage: labels => `${labels.join("か")}...？`
            };
        }
        return {
            filterLabel: _c => false,
            formatFormalExpr: _ls => "no_idea",
            formatMessage: _ls => "わかりません.."
        };
    }
}
