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
                newImageFileEvent
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

        const toStatementExpr = (predicates: string[]) =>
            predicates.length === 0
                ? "no_idea"
                : predicates.length > 1
                    ? `or(${predicates.join(", ")})`
                    : predicates[0];

        if (maxConfidence >= 0.9) {
            const pickups = _.sortBy(
                objectLabelsInImage.labelsWithConfidence.filter(
                    kv => kv.confidence >= 0.9
                ),
                kv => -1 * kv.confidence
            );
            return Promise.resolve({
                formalExpr: toStatementExpr(
                    pickups.map(kv => `certainly(${kv.label})`)
                ),
                message: `${pickups.map(kv => kv.label).join("か")}です！`
            });
        }
        if (maxConfidence >= 0.7) {
            const pickups = _.sortBy(
                objectLabelsInImage.labelsWithConfidence.filter(
                    kv => kv.confidence >= 0.7
                ),
                kv => -1 * kv.confidence
            );
            return Promise.resolve({
                formalExpr: toStatementExpr(
                    pickups.map(kv => `probably(${kv.label})`)
                ),
                message: `${pickups
                    .map(kv => kv.label)
                    .join("か")}だと思われます。`
            });
        }
        if (maxConfidence > 0.5) {
            const pickups = _.sortBy(
                objectLabelsInImage.labelsWithConfidence.filter(
                    kv => kv.confidence > 0.5
                ),
                kv => -1 * kv.confidence
            );
            return Promise.resolve({
                formalExpr: toStatementExpr(
                    pickups.map(kv => `possibly(${kv.label})`)
                ),
                message: `${pickups.map(kv => kv.label).join("か")}...？`
            });
        }

        return Promise.resolve({
            formalExpr: toStatementExpr([]),
            message: "わかりません.."
        });
    }
}
