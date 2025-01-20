import { HandlerCallback } from "@elizaos/core";
import {
    ActionExample,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@elizaos/core";

export const newsAction: Action = {
    name: "NEWS",
    similes: [
        "NEWS", "GET_NEWS", "GET_CURRENT_NEWS", "GET_LATEST_NEWS", "NEWS_UPDATE"
    ],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Get news for a search term when asked by the user.",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown},
        _callback: HandlerCallback
    ): Promise<boolean> => {

        async function getNews(searchTerm: string) {
            const url = `https://newsapi.org/v2/everything?q=${searchTerm}&apiKey=${process.env.NEWS_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.articles
                        .slice(0, 5)
                        .map((article: any) => `${article.title}\n${article.description}\n${article.content}`)
                        .join("\n\n");
        }

        const searchTerm = _message.content.text;

        const news_results = await getNews(searchTerm);

        _callback({
                text: "Here are the latest news articles for: " +
                searchTerm +
                "\n\n\n" +
                news_results

        });

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Hey whats up" },
            },
            {
                user: "{{user2}}",
                content: { text: "oh hey", action: "NONE" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "whats the latest news on the election" },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "NEWS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "get me the latest news on the election" },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "NEWS" },
            }
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "what are the current news stories about the election" },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "NEWS" },
            }
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "any update on the election?", },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "NEWS" },
            },
        ],
    ] as ActionExample[][],
} as Action;
