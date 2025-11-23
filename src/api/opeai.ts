import { OpenAI } from 'openai';

export const client = new OpenAI({
  apiKey: 'sk-qyshvvwucdwoptjqmkdvorsrvkzexspfxribsatifzcwpcit',
  baseURL: 'https://api.siliconflow.cn/v1',
  dangerouslyAllowBrowser: true
});
