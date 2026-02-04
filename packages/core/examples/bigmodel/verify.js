// Simple BigModel connectivity verifier
// Usage: BIGMODEL_API_KEY=your_key node packages/core/examples/bigmodel/verify.js

async function main() {
  const apiKey = process.env.BIGMODEL_API_KEY;
  if (!apiKey) {
    console.error('Missing BIGMODEL_API_KEY environment variable');
    process.exit(2);
  }

  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  const body = {
    model: 'glm-4',
    messages: [{ role: 'user', content: 'ping' }],
    stream: false,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    console.log('Status:', res.status);
    const txt = await res.text();
    try {
      const json = JSON.parse(txt);
      console.log('Response JSON:', JSON.stringify(json, null, 2));
      const content = json.choices?.[0]?.message?.content ?? json.data?.[0]?.content ?? null;
      if (content) console.log('Extracted content:', content);
    } catch (e) {
      console.log('Response text:', txt);
    }
  } catch (e) {
    console.error('Request failed:', e);
    process.exit(3);
  }
}

main();
