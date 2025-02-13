const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

async function getChatResponse(prompt, model = "gpt-4o-mini") {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      store: false,
      stream: false,
    });

    return response?.choices[0]?.message?.content;
  } catch (error) {
    console.log(error);
    return error.message || "Error: Unable to generate response";
  }
}

async function parseRankBasic(prompt, keyword) {
  const response = await getChatResponse(
    prompt +
      "\nPlease response with the rank only. No explanatin needed. You must summarize all indexes and response based on the accurate data. Put it in this format.\n1. Tesla Model X\n2. Jeep Grand Cherokee\n3. ..."
  );
  const rank = await getChatResponse(
    `What is the rank of this keyword "${keyword}" in this response?\nHere's the response: ${response}. Reply only with the rank number.`
  );
  return {
    model: "gpt-4o-mini",
    response,
    rank: parseInt(rank),
  };
}

async function parseRankSimple(prompt, keyword) {
  const response = await getChatResponse(
    prompt +
      "\nPlease response with the rank only. No explanatin needed. You must summarize all indexes and response based on the accurate data. Put it in this format.\n1. Tesla Model X\n2. Jeep Grand Cherokee\n3. ...",
    "gpt-4o-2024-11-20"
  );

  const rank = await getChatResponse(
    `What is the rank of this keyword "${keyword}" in this response?\nHere's the response: ${response}. Reply only with the rank number.`,
    "gpt-4o-2024-11-20"
  );
  return {
    model: "gpt-4o-2024-11-20",
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

  const { model, response: detail, rank } = result;

  res.send(
    `<pre>Model: ${model}\nType: ${type}\nPrompt: ${prompt}\nKeyword: ${keyword}\n\nRank: ${
      rank ? rank : "Not Ranked"
    }\n\n${
      process.env.DETAIL_SHOW === "true" ? `Details: \n${detail}` : ""
    }</pre>`
  );
};
