"use strict";

import * as AWS from "aws-sdk";

export interface RuntimeConfig {
    aws: {
        region: string;
        credentials: AWS.Credentials;
    };

    slack: {
        apiToken: string;
    }
}

export interface RuntimeConfigProvider {
    get(): RuntimeConfig;
}
