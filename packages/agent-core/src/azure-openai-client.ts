import { AzureOpenAI } from 'openai';
import { OpenAIBaseClient } from './openai-base-client';

/**
 * Azure OpenAI LLM client for production scale.
 * LLM_MODEL should be set to the Azure deployment name (e.g. 'gpt-4o-mini').
 */
export class AzureOpenAIClient extends OpenAIBaseClient {
  constructor(options?: {
    model?: string;
    endpoint?: string;
    apiKey?: string;
    apiVersion?: string;
  }) {
    const client = new AzureOpenAI({
      endpoint: options?.endpoint || process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: options?.apiKey || process.env.AZURE_OPENAI_API_KEY,
      apiVersion: options?.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-10-21',
    });
    const model = options?.model || process.env.LLM_MODEL || 'gpt-4o-mini';
    super(client, model);
  }
}
