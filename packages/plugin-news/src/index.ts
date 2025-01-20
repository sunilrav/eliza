import { Plugin } from "@elizaos/core";
import { newsAction } from "./actions/news.ts";

export * as actions from "./actions/index.ts";
export * as evaluators from "./evaluators/index.ts";
export * as providers from "./providers/index.ts";

export const newsPlugin: Plugin = {
    name: "news",
    description: "News plugin",
    actions: [
        newsAction
    ]
};
