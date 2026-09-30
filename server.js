import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const APPLICANTS_FILE = path.join(DATA_DIR, 'applicants.json');
const CHALLENGES_FILE = path.join(DATA_DIR, 'challenges.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const initializeFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

const initialChallenges = [
  {
    id: 1,
    title: "The Neural Glitch",
    prize: "$500",
    difficulty: "Hard",
    description: "Debug a recursive LLM loop that started writing its own gothic poetry. Restore sanity to the system.",
    category: "Debugging"
  },
  {
    id: 2,
    title: "Vibe Mesh Protocol",
    prize: "$1,200",
    difficulty: "Expert",
    description: "Build a real-time visualization of a multi-agent swarm consensus algorithm using three.js.",
    category: "Frontend"
  }
];

initializeFile(APPLICANTS_FILE, []);
initializeFile(CHALLENGES_FILE, initialChallenges);

app.use(cors());
app.use(bodyParser.json());

// Challenges Endpoints
app.get('/api/challenges', (req, res) => {
  try {
    const challenges = JSON.parse(fs.readFileSync(CHALLENGES_FILE));
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load challenges' });
  }
});

app.post('/api/challenges', (req, res) => {
  const challenge = req.body;
  if (!challenge.title || !challenge.prize || !challenge.description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const challenges = JSON.parse(fs.readFileSync(CHALLENGES_FILE));
  challenge.id = Date.now();
  challenges.push(challenge);
  
  fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(challenges, null, 2));
  res.status(201).json(challenge);
});

app.delete('/api/challenges/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let challenges = JSON.parse(fs.readFileSync(CHALLENGES_FILE));
  challenges = challenges.filter(c => c.id !== id);
  fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(challenges, null, 2));
  res.status(204).send();
});

// Applicants/Participants Endpoints
app.get('/api/applicants', (req, res) => {
  const applicants = JSON.parse(fs.readFileSync(APPLICANTS_FILE));
  res.json(applicants);
});

app.post('/api/apply', (req, res) => {
  const applicant = req.body;
  if (!applicant.name || !applicant.email || !applicant.challengeId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const applicants = JSON.parse(fs.readFileSync(APPLICANTS_FILE));
  applicant.id = Date.now();
  applicant.timestamp = new Date().toISOString();
  applicants.push(applicant);
  
  fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(applicants, null, 2));
  res.status(201).json({ message: 'Application submitted successfully!', id: applicant.id });
});

app.listen(PORT, () => {
  console.log(`Strong Vibe Server running at http://localhost:${PORT}`);
});
