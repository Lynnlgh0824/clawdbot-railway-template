import { BigModelProvider } from '../../src/providers/bigmodel';

async function main() {
  const apiKey = process.env.BIGMODEL_API_KEY;
  if (!apiKey) {
    console.error('Please set BIGMODEL_API_KEY environment variable');
    process.exit(1);
  }

  const p = new BigModelProvider({ apiKey, model: 'glm-4' });

  // 非流式示例
  const resp = await p.chat([
    { role: 'system', content: '你是一个友好的助手。' },
    { role: 'user', content: '请用一句话介绍 TypeScript。' },
  ]);
  console.log('=== Non-stream response ===');
  console.log(resp.content);

  // 注意：当前 provider 实现不支持流式；如需流式请改造 provider.chat
}

main().catch((err) => {
  console.error('example error', err);
  process.exit(1);
});
