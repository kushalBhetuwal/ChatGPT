import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import Configuration from "openai";

dotenv.config();

const config = new Configuration({
  apiKey: "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",
});

const openai = new OpenAI(config);
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "hello from frontend",
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `${prompt}`,
      max_tokens: 3000,
      temperature: 0,
    });
    console.log(response);

    res.status(200).send({
      bot:response.choices[0].text
    })
  } catch (error) {
    console.error(error);
    res.status(401).send({error})

  }
});

app.listen(5000, () =>
  console.log("listening on port 5000 at http://localhost:5000")
);
