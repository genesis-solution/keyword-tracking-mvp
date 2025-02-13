const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

async function main() {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Say this is a test" }],
    store: true,
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}

exports.trackKeyword = (req, res) => {
  const { prompt, keyword } = req.params;
  main();
  res.send(`Prompt: ${prompt}, Keyword: ${keyword}`);
};
