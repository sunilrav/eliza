import { composeContext, Content, generateText, HandlerCallback, ModelClass } from "@elizaos/core";
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
        "NEWS", "GET_NEWS", "GET_CURRENT_NEWS", "GET_LATEST_NEWS", "NEWS_UPDATE", "LATEST_NEWS"
    ],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Get the news for a search term when asked by the user.",
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

        const context = `Extract the search term from the user's message.
                            The message is: ${_message.content.text}
                            Only respond with the search term, do not include any other text.`;

        const searchTerm = await generateText({
            runtime: _runtime,
            context,
            modelClass: ModelClass.SMALL,
            stop: ["\n"],
        })

        const news_results = await getNews(searchTerm);

        const responseText = "Here are the news articles for: " +
                                searchTerm +
                                "\n\n\n" +
                                news_results;

        const newMemory: Memory = {
            userId: _message.agentId,
            agentId: _message.agentId,
            roomId: _message.roomId,
            content: {
                text: responseText,
                action: "NEWS_RESPONSE",
                source: _message.content.source
            } as Content,
            embedding: new Array(384)
        };

        await _runtime.messageManager.createMemory(newMemory);

        _callback(newMemory.content);

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
