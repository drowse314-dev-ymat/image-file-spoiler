"use strict";

import { injectable } from "inversify";
import * as AWS from "aws-sdk";

import {
    RuntimeConfigProvider,
    RuntimeConfig
} from "../../domain/runtime-config";

const ENV_KEY_AWS_PROFILE = "AWS_PROFILE";
const ENV_KEY_SLACK_API_TOKEN = "SLACK_API_TOKEN";
const DEFAULTS = {
    aws: {
        credentials: process.env[ENV_KEY_AWS_PROFILE]
            ? new AWS.SharedIniFileCredentials({
                  profile: process.env[ENV_KEY_AWS_PROFILE]
              })
            : new AWS.EnvironmentCredentials("AWS"),
        region: "ap-northeast-1"
    },

    slack: {
        apiToken: process.env[ENV_KEY_SLACK_API_TOKEN]
            ? <string>process.env[ENV_KEY_SLACK_API_TOKEN]
            : ""
    }
};

@injectable()
export class EnvironmentRuntimeConfigProvider implements RuntimeConfigProvider {
    private cache: RuntimeConfig | undefined = undefined;

    public get() {
        if (this.cache === undefined) {
            this.cache = {
                aws: DEFAULTS.aws,
                slack: DEFAULTS.slack
            };
        }

        return this.cache;
    }
}
