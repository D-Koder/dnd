// Vercel Serverless Function — proxies DM requests to the Groq API (OpenAI-compatible).
// Used as a speed race against Anthropic in index.html: whichever provider responds
// first with a valid structured response wins. The Groq key lives only here, never
// in the browser.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GROQ_API_KEY is not set on the server. Add it in your Vercel project settings if you want the Groq race enabled.' });
    return;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Proxy request failed' });
  }
};
