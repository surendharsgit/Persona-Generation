import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const MEMORY_FILE = path.join(DATA_DIR, 'memory.json');
const SURVEYS_FILE = path.join(DATA_DIR, 'surveys.json');
const INSIGHTS_FILE = path.join(DATA_DIR, 'insights.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure files exist
const initFile = (filePath, defaultData = {}) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
};

initFile(MEMORY_FILE);
initFile(SURVEYS_FILE, []);
initFile(INSIGHTS_FILE, null);

const readJsonFile = (filePath, defaultData) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read file ${filePath}:`, error);
    return defaultData;
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to write file ${filePath}:`, error);
  }
};

// Memory Store Methods
export const getPersonaMemory = (personaId) => {
  const store = readJsonFile(MEMORY_FILE, {});
  return store[personaId] || { history: [], dynamicContext: {} };
};

export const getAllPersonaMemories = () => {
  return readJsonFile(MEMORY_FILE, {});
};

export const savePersonaMemory = (personaId, memoryData) => {
  const store = readJsonFile(MEMORY_FILE, {});
  store[personaId] = {
    history: memoryData.history || [],
    dynamicContext: memoryData.dynamicContext || {}
  };
  writeJsonFile(MEMORY_FILE, store);
  return store[personaId];
};

export const clearPersonaMemory = (personaId) => {
  const store = readJsonFile(MEMORY_FILE, {});
  if (store[personaId]) {
    delete store[personaId];
    writeJsonFile(MEMORY_FILE, store);
  }
  return { history: [], dynamicContext: {} };
};

// Survey Store Methods
export const getSurveys = () => {
  return readJsonFile(SURVEYS_FILE, []);
};

export const saveSurveys = (surveyData) => {
  writeJsonFile(SURVEYS_FILE, surveyData);
  return surveyData;
};

// Insight Store Methods
export const getInsights = () => {
  return readJsonFile(INSIGHTS_FILE, null);
};

export const saveInsights = (insightsData) => {
  writeJsonFile(INSIGHTS_FILE, insightsData);
  return insightsData;
};
