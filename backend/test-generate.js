import { generatePersonas } from './services/personaService.js';

async function run() {
  try {
    const res = await generatePersonas({
      productName: "Test App",
      productDescription: "A test app",
      industry: "Tech",
      targetGender: "Both",
      targetAudienceAge: { min: 18, max: 25 },
      numberOfPersonas: 1,
      researchObjective: "Testing"
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
run();
