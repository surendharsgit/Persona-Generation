import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const MEMORY_FILE = path.join(DATA_DIR, 'memory.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure memory file exists
if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify({}, null, 2), 'utf-8');
}

const readMemoryFile = () => {
  try {
    const raw = fs.readFileSync(MEMORY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read memory file, returning empty object:", error);
    return {};
  }
};

const writeMemoryFile = (data) => {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to write to memory file:", error);
  }
};

export const getPersonaMemory = (personaId) => {
  const store = readMemoryFile();
  return store[personaId] || { history: [], dynamicContext: {} };
};

export const savePersonaMemory = (personaId, memoryData) => {
  const store = readMemoryFile();
  store[personaId] = {
    history: memoryData.history || [],
    dynamicContext: memoryData.dynamicContext || {}
  };
  writeMemoryFile(store);
  return store[personaId];
};

export const clearPersonaMemory = (personaId) => {
  const store = readMemoryFile();
  if (store[personaId]) {
    delete store[personaId];
    writeMemoryFile(store);
  }
  return { history: [], dynamicContext: {} };
};
