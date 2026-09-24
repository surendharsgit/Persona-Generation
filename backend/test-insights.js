import { extractInsights } from './services/insightService.js';

async function run() {
  try {
    const res = await extractInsights({
      personas: [{ id: "p1", name: "Alice", archetype: "Innovator", goals: ["Go fast"] }],
      surveyResults: [],
      interviewMemories: {},
      experimentContext: "Test"
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
run();
