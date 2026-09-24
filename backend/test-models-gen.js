import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function testModel(modelName) {
  try {
    const res = await ai.models.generateContent({
      model: modelName,
      contents: "hello",
    });
    console.log(`Success with ${modelName}`);
  } catch (e) {
    console.log(`Failed with ${modelName}: ${e.message}`);
  }
}

async function run() {
  await testModel('gemini-flash-latest');
  await testModel('gemini-pro-latest');
  await testModel('gemini-1.5-flash');
}
run();
