"use strict";

import { inject, injectable } from "inversify";
import * as AWS from "aws-sdk";

import { ROLES } from "../../domain/roles";
import { RuntimeConfigProvider } from "../../domain/runtime-config";
import { ImageFileRef } from "../../domain/image-file";
import {
    ImageRecognizer,
    ObjectLabelsInImage
} from "../../domain/image-recognizer";

@injectable()
export class AmazonRekognitionImageRecognizer implements ImageRecognizer {
    private rekognitionClient: AWS.Rekognition;

    public constructor(
        @inject(ROLES.RuntimeConfigProvider)
        runtimeConfigProvider: RuntimeConfigProvider
    ) {
        const config = runtimeConfigProvider.get();
        this.rekognitionClient = new AWS.Rekognition({
            region: "ap-northeast-1",
            credentials: config.aws.credentials
        });
    }

    public findObjects(
        imageFileRef: ImageFileRef
    ): Promise<ObjectLabelsInImage> {
        return imageFileRef
            .getContent()
            .then(readable => this.getBase64String(readable))
            .then(imageContent =>
                this.rekognitionClient
                    .detectLabels({
                        Image: {
                            Bytes: imageContent
                        },
                        MinConfidence: 40
                    })
                    .promise()
                    .then(result => {
                        if (!result.Labels) {
                            throw new Error("");
                        }
                        return {
                            labelsWithConfidence: result.Labels.map(label => ({
                                label: label.Name as string,
                                confidence: (label.Confidence as number) / 100.0
                            }))
                        };
                    })
            );
    }

    private getBase64String(readable: NodeJS.ReadableStream): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            let imageBytes: Buffer[] = [];
            readable
                .on("data", chunk => {
                    imageBytes.push(chunk);
                })
                .on("error", reject)
                .on("end", () => resolve(Buffer.concat(imageBytes)));
        });
    }
}
