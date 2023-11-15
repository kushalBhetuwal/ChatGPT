import OpenAI from "openai";
import * as dotenv from "dotenv";
import readline from "readline";
import express from 'express';
import cors from 'cors';

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

dotenv.config();
const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
});

const app = express();
app.use(cors());
app.use(express.json());


app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    console.log(secretKey)
    const assistant = await openai.beta.assistants.create({
      name: "Research Assistant",
      instructions:
        "You are a Personal Research Assistant. This assistant AI tool will help to analyze data, explore literature review, present conceptual frameworks, charts, provide findings, methodology, and conclusion.",
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4-1106-preview",
    });

    const thread = await openai.beta.threads.create();
    
    // Send user prompt to the assistant
    const userMessage = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt,
    });

    // Retrieve assistant's response
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Get the last assistant message from the messages array
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessageForRun = messages.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    const assistantMessage = lastMessageForRun.content[0].text.value.trim();

    // Send the assistant's message back to the client
    res.status(200).send({
      bot:assistantMessage
    })
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => console.log(`Running at http://localhost:3000`));

