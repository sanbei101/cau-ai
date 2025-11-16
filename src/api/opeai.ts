import { OpenAI } from 'openai';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const client = new OpenAI({
  apiKey: 'sk-qyshvvwucdwoptjqmkdvorsrvkzexspfxribsatifzcwpcit',
  baseURL: 'https://api.siliconflow.cn/v1',
  dangerouslyAllowBrowser: true
});

export const chat = (messages: ChatCompletionMessageParam[]) =>
  client.chat.completions.create({
    model: 'THUDM/glm-4-9b-chat',
    messages,
    stream: true
  });
export default client;
