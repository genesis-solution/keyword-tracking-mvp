const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

async function getChatResponse(prompt) {
  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini-2024-07-18",
    messages: [{ role: "user", content: prompt }],
    store: true,
    stream: true,
  });

  let response = "";
  for await (const chunk of stream) {
    response += chunk.choices[0]?.delta?.content || "";
  }
  return response;
}

async function parseRankBasic(prompt, keyword) {
  const response = await getChatResponse(prompt);
  const rank = await getChatResponse(
    `What is the rank of this keyword "${keyword}" in this response?\nHere's the response: ${response}. Reply only with the rank number.`
  );
  return {
    response,
    rank: parseInt(rank),
  };
}

async function parseRankSimple(prompt, keyword) {
  const response = await getChatResponse(
    prompt +
      "\nPlease response with the rank only. No explanatin needed. Put it in this format.\n1. Tesla Model X (2025)\n2. Jeep Grand Cherokee (2025)\n3. ..."
  );

  const rank = await getChatResponse(
    `What is the rank of this keyword "${keyword}" in this response?\nHere's the response: ${response}. Reply only with the rank number.`
  );
  console.log(rank);
  return {
    response,
    rank: parseInt(rank),
  };
}

async function parseRankAdvanced(prompt, keyword) {
  const response = await getChatResponse(
    `You're the world's best marketing analyst. Please rank the keyword based on the prompt. Please response with the rank only. No explanatin needed. Here's the prompt: "${prompt}". Here's the keyword: "${keyword}"`
  );

  return {
    response,
    rank: parseInt(response),
  };
}

exports.trackKeyword = async (req, res) => {
  const { type, prompt, keyword } = req.params;

  let result;
  if (type === "basic") {
    result = await parseRankBasic(prompt, keyword);
  } else if (type === "simple") {
    result = await parseRankSimple(prompt, keyword);
  } else if (type === "advanced") {
    result = await parseRankAdvanced(prompt, keyword);
  } else {
    return res.status(400).send("Invalid type parameter");
  }

  res.send(
    `<pre>Type: ${type}\nPrompt: ${prompt}\nKeyword: ${keyword}\n\nRank: ${
      result.rank ? result.rank : "Not Ranked"
    }\n\n${
      process.env.DETAIL_SHOW === "true" ? `Details: \n${result.response}` : ""
    }</pre>`
  );
};
