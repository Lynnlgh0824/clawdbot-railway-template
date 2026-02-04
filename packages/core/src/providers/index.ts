import { BigModelProvider } from './bigmodel';

// Register providers here. Add other providers (openai, anthropic, etc.) alongside bigmodel.
export const Providers: Record<string, any> = {
  bigmodel: BigModelProvider,
};

export default Providers;
