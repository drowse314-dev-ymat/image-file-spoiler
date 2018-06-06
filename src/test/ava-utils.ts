"use strict";

import * as ava from "ava";

// https://github.com/avajs/ava/blob/master/docs/recipes/typescript.md
export const testWithContext = <T>(
    getContext: () => T
): ava.RegisterContextual<T> => {
    ava.test.beforeEach(t => {
        Object.assign(t.context, getContext());
    });
    return ava.test;
};
