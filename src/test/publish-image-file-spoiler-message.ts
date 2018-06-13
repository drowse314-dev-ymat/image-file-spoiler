"use strict";

import "reflect-metadata";
import { Container } from "inversify";

import { testWithContext } from "./ava-utils";
import * as mocks from "./mocks";

import { ROLES } from "../domain/roles";
import { buildServiceRegistry } from "../config";
import { NewImageFileEventProvider } from "../domain/image-file";
import {
    ImageRecognizer,
    ObjectLabelsInImage
} from "../domain/image-recognizer";
import {
    ImageFileSpoilerMessageSink,
    ImageFileSpoilerMessage
} from "../domain/image-file-spoiler-message";
import { Logger } from "../domain/logger";
import { PublishImageFileSpoilerMessage } from "../domain/usecases/publish-image-file-spoiler-message";

const test = testWithContext(() => {
    const registry = buildServiceRegistry();

    const messagesSent: ImageFileSpoilerMessage[] = [];
    registry
        .bind<ImageFileSpoilerMessageSink>(ROLES.ImageFileSpoilerMessageSink)
        .toConstantValue(
            mocks.createImageFileSpoilerMessageSinkMock(messagesSent)
        );
    registry
        .bind<NewImageFileEventProvider>(ROLES.NewImageFileEventProvider)
        .toConstantValue(
            mocks.createNewImageFileEventProviderMock({
                eventTimestampMillis: new Date().valueOf(),
                getImageFileRef: () =>
                    Promise.resolve({
                        getContent: () =>
                            Promise.reject(new Error("not implemented"))
                    })
            })
        );
    // テストでは不要
    registry
        .rebind<Logger>(ROLES.Logger)
        .toConstantValue({ log: (_domain, _content) => {} });

    return { registry, messagesSent };
});

const invokeUsecase = (
    registry: Container,
    recognizerResult: ObjectLabelsInImage
): Promise<void> => {
    registry
        .rebind<ImageRecognizer>(ROLES.ImageRecognizer)
        .toConstantValue(mocks.createImageRecognizerMock(recognizerResult));

    return registry
        .get<PublishImageFileSpoilerMessage>(
            ROLES.PublishImageFileSpoilerMessage
        )
        .invoke();
};

test("[90, 100]%のラベル1つを検知", t => {
    const labels: [string, number][] = [["dog", 1.0]];
    const recognizerResult: ObjectLabelsInImage = {
        labelsWithConfidence: labels.map(([label, confidence]) => ({
            label,
            confidence
        }))
    };

    return invokeUsecase(t.context.registry, recognizerResult).then(() => {
        t.is(t.context.messagesSent.length, 1);
        t.deepEqual(t.context.messagesSent[0].formalExpr, "certainly(dog)");
    });
});

test("[90, 100]%ラベルを複数検知", t => {
    const labels: [string, number][] = [
        ["dog", 0.93],
        ["cat", 0.91],
        ["bear", 0.8]
    ];
    const recognizerResult: ObjectLabelsInImage = {
        labelsWithConfidence: labels.map(([label, confidence]) => ({
            label,
            confidence
        }))
    };

    return invokeUsecase(t.context.registry, recognizerResult).then(() => {
        t.is(t.context.messagesSent.length, 1);
        t.deepEqual(
            t.context.messagesSent[0].formalExpr,
            "or(certainly(dog), certainly(cat))"
        );
    });
});

test("[70, 90)%ラベルを複数検知", t => {
    const labels: [string, number][] = [
        ["dog", 0.89],
        ["cat", 0.71],
        ["bear", 0.6],
        ["rabbit", 0.3]
    ];
    const recognizerResult: ObjectLabelsInImage = {
        labelsWithConfidence: labels.map(([label, confidence]) => ({
            label,
            confidence
        }))
    };

    return invokeUsecase(t.context.registry, recognizerResult).then(() => {
        t.is(t.context.messagesSent.length, 1);
        t.deepEqual(
            t.context.messagesSent[0].formalExpr,
            "or(probably(dog), probably(cat))"
        );
    });
});

test("(50, 70)%ラベルを複数検知", t => {
    const labels: [string, number][] = [
        ["cat", 0.61],
        ["dog", 0.51],
        ["bear", 0.3],
        ["rabbit", 0.3]
    ];
    const recognizerResult: ObjectLabelsInImage = {
        labelsWithConfidence: labels.map(([label, confidence]) => ({
            label,
            confidence
        }))
    };

    return invokeUsecase(t.context.registry, recognizerResult).then(() => {
        t.is(t.context.messagesSent.length, 1);
        t.deepEqual(
            t.context.messagesSent[0].formalExpr,
            "or(possibly(cat), possibly(dog))"
        );
    });
});

test("[0, 50]%ラベルのみ", t => {
    const labels: [string, number][] = [
        ["dog", 0.5],
        ["cat", 0.42],
        ["bear", 0.3]
    ];
    const recognizerResult: ObjectLabelsInImage = {
        labelsWithConfidence: labels.map(([label, confidence]) => ({
            label,
            confidence
        }))
    };

    return invokeUsecase(t.context.registry, recognizerResult).then(() => {
        t.is(t.context.messagesSent.length, 1);
        t.deepEqual(t.context.messagesSent[0].formalExpr, "no_idea");
    });
});
