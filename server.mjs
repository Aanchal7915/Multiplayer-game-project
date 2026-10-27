import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const rooms = new Map();

// Rich Question Pool (Dynamically shuffled per game room!)
const questionPool = [
  {
    category: 'Animal Kingdom',
    text: 'Which fascinating creature has three hearts, blue blood, and a mini-brain in each of its arms?',
    options: ['Octopus', 'Giant Squid', 'Starfish', 'Jellyfish'],
    correctIndex: 0,
    explanation: 'An octopus has three hearts (two pump blood to gills, one to body), copper-rich blue blood, and 9 brains in total!'
  },
  {
    category: 'Planet Earth',
    text: 'Scientifically defined by low annual rainfall, what is the largest desert on planet Earth?',
    options: ['Sahara Desert', 'Antarctic Desert', 'Gobi Desert', 'Kalahari Desert'],
    correctIndex: 1,
    explanation: 'Deserts are defined by precipitation, not heat! Covering 14.2 million km², Antarctica is Earth’s largest and driest desert.'
  },
  {
    category: 'Curious Inventions',
    text: 'Which famous household toy was originally invented in the 1930s as a wallpaper soot cleaner?',
    options: ['Play-Doh', 'Bubble Wrap', 'Slinky', 'Silly Putty'],
    correctIndex: 0,
    explanation: 'Play-Doh was created by Kutol Products to wipe coal soot off wallpaper before being rebranded as a modeling toy in 1956!'
  },
  {
    category: 'Cosmos & Space',
    text: 'How long does it take for Venus to rotate once on its axis compared to its complete orbit around the Sun?',
    options: ['One day is longer than its entire year', 'Half an Earth day', 'Exactly 24 hours', 'Equal to one Earth month'],
    correctIndex: 0,
    explanation: 'Venus rotates so slowly (243 Earth days) that a single Venusian day lasts longer than its year orbiting the Sun (225 Earth days)!'
  },
  {
    category: 'Human Body',
    text: 'What is the only muscle in the human body that is anchored at only one end?',
    options: ['Diaphragm', 'Tongue', 'Heart', 'Stapedius'],
    correctIndex: 1,
    explanation: 'The tongue is connected only at the back (hyoid bone), giving it extreme multi-directional flexibility.'
  },
  {
    category: 'World Geography',
    text: 'Which country on Earth spans the most consecutive time zones across its mainland (spanning 11 time zones)?',
    options: ['Russia', 'Canada', 'United States', 'China'],
    correctIndex: 0,
    explanation: 'Russia stretches across Eurasia from the Baltic Sea to the Pacific Ocean, covering 11 contiguous time zones!'
  },
  {
    category: 'Animal Kingdom',
    text: 'What is the only mammal on Earth that is capable of true, sustained flight?',
    options: ['Flying Squirrel', 'Sugar Glider', 'Bat', 'Colugo'],
    correctIndex: 2,
    explanation: 'While flying squirrels glide, bats have true aerodynamic powered wing flight!'
  },
  {
    category: 'Science & Nature',
    text: 'What color is direct sunlight when viewed from outer space, without Earth’s atmospheric scattering?',
    options: ['Pure White', 'Vivid Yellow', 'Pale Blue', 'Bright Orange'],
    correctIndex: 0,
    explanation: 'The Sun emits all visible light wavelengths together, making it appear pure white from space. Earth’s atmosphere scatters blue light, making it look yellow.'
  },
  {
    category: 'Curious Inventions',
    text: 'Bubble Wrap was originally invented in 1957 by engineers who were attempting to create what product?',
    options: ['3D Textured Wallpaper', 'Greenhouse Insulation', 'Car Bumper Cushion', 'Soundproof Tiles'],
    correctIndex: 0,
    explanation: 'Inventors Al Fielding and Marc Chavannes sealed two shower curtains together with air bubbles trying to invent futuristic 3D wallpaper!'
  },
  {
    category: 'World History',
    text: 'What was the very first commercial product ever scanned with a UPC barcode at a supermarket checkout in 1974?',
    options: ['Wrigley’s Juicy Fruit Gum', 'Campbell’s Tomato Soup', 'Coca-Cola Can', 'Kellogg’s Corn Flakes'],
    correctIndex: 0,
    explanation: 'A 10-pack of Wrigley’s Juicy Fruit chewing gum was scanned on June 26, 1974, at a Marsh Supermarket in Troy, Ohio.'
  },
  {
    category: 'Animal Kingdom',
    text: 'What color is a polar bear’s skin underneath its dense white insulating fur coat?',
    options: ['Jet Black', 'Pale Pink', 'Snow White', 'Light Gray'],
    correctIndex: 0,
    explanation: 'Polar bear skin is pitch black to absorb and retain heat from the sun! Their fur is actually translucent and hollow.'
  },
  {
    category: 'Planet Earth',
    text: 'Which massive river carries more fresh water into the ocean than the next seven largest rivers combined?',
    options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'],
    correctIndex: 0,
    explanation: 'The Amazon River accounts for approximately 20% of Earth’s total river discharge into the oceans.'
  },
  {
    category: 'Space & Astronomy',
    text: 'Which planet in our solar system has a density lower than water, meaning it would theoretically float in a giant bathtub?',
    options: ['Saturn', 'Jupiter', 'Uranus', 'Neptune'],
    correctIndex: 0,
    explanation: 'Saturn is made mostly of hydrogen and helium with an average density of just 0.687 g/cm³, lighter than water (1.0 g/cm³)!'
  },
  {
    category: 'Human Body',
    text: 'Despite making up only about 2% of your body weight, your brain consumes approximately how much of your daily oxygen and energy?',
    options: ['About 20%', 'About 5%', 'About 10%', 'About 45%'],
    correctIndex: 0,
    explanation: 'The human brain is a metabolic powerhouse, consuming roughly 20% of the body’s total glucose and oxygen.'
  },
  {
    category: 'Animal Kingdom',
    text: 'A group of wild flamingos gathered together is officially known by which poetic collective noun?',
    options: ['A Flamboyance', 'A Kaleidoscope', 'A Shimmer', 'A Bloom'],
    correctIndex: 0,
    explanation: 'A gathering of flamingos is famously called a "flamboyance", fitting their flamboyant bright pink plumage.'
  },
  {
    category: 'World Wonders',
    text: 'The Great Pyramid of Giza was originally covered in polished casing stones of what brilliant color?',
    options: ['Gleaming White', 'Royal Gold', 'Deep Terracotta', 'Sand Yellow'],
    correctIndex: 0,
    explanation: 'The pyramids were originally clad in smooth, highly polished white Tura limestone that reflected the desert sun like a giant mirror!'
  },
  {
    category: 'Food & Origins',
    text: 'Despite their popular modern English name, French Fries were originally invented in which European country?',
    options: ['Belgium', 'France', 'Germany', 'Netherlands'],
    correctIndex: 0,
    explanation: 'Belgians have been frying thin potato strips along the River Meuse since the late 1600s! American soldiers nicknamed them "French Fries" during WWI because the Belgian army spoke French.'
  },
  {
    category: 'World Geography',
    text: 'Which is the only continent on Earth that has absolutely zero active volcanoes?',
    options: ['Australia', 'Antarctica', 'Africa', 'Europe'],
    correctIndex: 0,
    explanation: 'Australia sits securely in the middle of a tectonic plate rather than at its edges, so it has no active volcanoes today.'
  },
  {
    category: 'Tech & Origins',
    text: 'The short-range wireless technology "Bluetooth" was named after which historical Scandinavian monarch?',
    options: ['King Harald Bluetooth', 'Erik the Red', 'King Canute', 'Ragnar Lothbrok'],
    correctIndex: 0,
    explanation: 'Intel engineer Jim Kardach suggested the name after 10th-century King Harald Bluetooth, who united Scandinavian tribes just as Bluetooth unites devices!'
  },
  {
    category: 'Science & Physics',
    text: 'What is the fastest moving thing in the known universe, traveling at approximately 300,000 kilometers per second?',
    options: ['Light in a vacuum', 'Sound in steel', 'Solar wind', 'Neutron star spin'],
    correctIndex: 0,
    explanation: 'The speed of light in a vacuum (c) is precisely 299,792,458 m/s, the universal cosmic speed limit.'
  },
  {
    category: 'Curious Nature',
    text: 'Which sweet food is the only natural substance known to humans that never spoils or goes bad, even after thousands of years?',
    options: ['Pure Raw Honey', 'Pure Maple Syrup', 'Refined Sugar', 'Salted Butter'],
    correctIndex: 0,
    explanation: 'Due to its low moisture content and acidic pH, archaeologists have found pots of 3,000-year-old honey in Egyptian tombs that are still perfectly edible!'
  }
];

function pickQuestions(count = 3) {
  const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Sanitizes player input name (trims whitespace, caps length).
 */
const sanitizePlayerName = rawName => String(rawName || '').trim().replace(/\s+/g, ' ').slice(0, 18);

/**
 * Normalizes 7-character arena room code.
 */
const normalizeArenaCode = rawCode => String(rawCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

/**
 * Sanitizes in-memory arena state for client consumption.
 * Hides correct answers and explanations until round reveal.
 */
function sanitizeRoomSnapshot(arena) {
  const qList = (arena.questions && arena.questions.length) ? arena.questions : questionPool.slice(0, 3);
  const currentQ = arena.status === 'playing' ? qList[arena.round] : null;
  return {
    code: arena.code,
    hostId: arena.hostId,
    status: arena.status,
    players: arena.players.map(({ id, name, score, joinedAt }) => ({ id, name, score, joinedAt })),
    round: arena.round,
    roundCount: qList.length,
    currentQuestion: currentQ ? {
      category: currentQ.category,
      text: currentQ.text,
      options: currentQ.options,
      correctIndex: arena.revealed ? currentQ.correctIndex : null,
      explanation: arena.revealed ? currentQ.explanation : null
    } : null,
    answers: arena.answers,
    answerCount: Object.keys(arena.answers).length,
    revealed: arena.revealed,
    version: arena.version
  };
}

function sendJsonResponse(res, statusCode, data, contentType = 'application/json; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(contentType.startsWith('application/json') ? JSON.stringify(data) : data);
}

function sendHttpError(res, errorMessage, statusCode = 400) {
  sendJsonResponse(res, statusCode, { error: errorMessage });
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'POST' && url.pathname === '/api/game') {
    let payload;
    try {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      if (raw.length > 20000) return sendHttpError(res, 'Payload too large.', 413);
      payload = JSON.parse(raw || '{}');
    } catch {
      return sendHttpError(res, 'Invalid request payload.');
    }

    try {
      if (payload.action === 'create') {
        const name = sanitizePlayerName(payload.name);
        if (name.length < 2) return sendHttpError(res, 'Please choose a nickname with at least 2 characters.');
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code;
        do {
          code = '';
          for (let i = 0; i < 7; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
        } while (code.length !== 7 || rooms.has(code));

        const player = { id: randomUUID(), name, score: 0, joinedAt: Date.now() };
        const arena = {
          code,
          hostId: player.id,
          status: 'lobby',
          players: [player],
          round: -1,
          questions: pickQuestions(3),
          answers: {},
          revealed: false,
          version: 0
        };
        rooms.set(code, arena);
        return sendJsonResponse(res, 200, { room: sanitizeRoomSnapshot(arena), player });
      }

      const code = normalizeArenaCode(payload.code);
      if (code.length !== 7) return sendHttpError(res, 'Enter the 7-character arena code.', 400);
      const arena = rooms.get(code);
      if (!arena) return sendHttpError(res, 'Arena not found. Verify the code and try again.', 404);

      if (payload.action === 'join') {
        const name = sanitizePlayerName(payload.name);
        if (name.length < 2) return sendHttpError(res, 'Please choose a nickname with at least 2 characters.');
        if (arena.status !== 'lobby') return sendHttpError(res, 'Battle is already underway. Join a new arena.', 409);
        if (arena.players.length >= 8) return sendHttpError(res, 'Arena is full (8 competitors maximum).', 409);

        const player = { id: randomUUID(), name, score: 0, joinedAt: Date.now() };
        arena.players.push(player);
        arena.version++;
        return sendJsonResponse(res, 200, { room: sanitizeRoomSnapshot(arena), player });
      }

      const activePlayer = arena.players.find(x => x.id === payload.playerId);
      if (!activePlayer) return sendHttpError(res, 'You are not registered in this arena.', 403);

      if (payload.action === 'get') return sendJsonResponse(res, 200, { room: sanitizeRoomSnapshot(arena) });

      if (payload.action === 'start') {
        if (arena.hostId !== activePlayer.id) return sendHttpError(res, 'Only the host can launch the battle.', 403);
        if (arena.status !== 'lobby') return sendHttpError(res, 'The battle has already started.');
        if (arena.players.length < 2) return sendHttpError(res, 'At least 2 competitors are required to launch.');
        
        // Ensure arena has fresh questions
        if (!arena.questions || !arena.questions.length) {
          arena.questions = pickQuestions(3);
        }
        arena.status = 'playing';
        arena.round = 0;
        arena.answers = {};
        arena.revealed = false;
        arena.version++;
        return sendJsonResponse(res, 200, { room: sanitizeRoomSnapshot(arena) });
      }

      if (payload.action === 'answer') {
        if (arena.status !== 'playing' || arena.revealed) return sendHttpError(res, 'Submissions are currently locked.', 409);
        if (Object.hasOwn(arena.answers, activePlayer.id)) return sendHttpError(res, 'Your choice is already locked in.', 409);

        const choice = Number(payload.choice);
        const qList = (arena.questions && arena.questions.length) ? arena.questions : questionPool;
        const currentQ = qList[arena.round];
        if (!Number.isInteger(choice) || choice < 0 || choice >= currentQ.options.length) {
          return sendHttpError(res, 'Select one of the valid options.');
        }

        const firstCorrect = !Object.values(arena.answers).some(a => a.choice === currentQ.correctIndex);
        const correct = choice === currentQ.correctIndex;
        const points = correct ? 100 + (firstCorrect ? 50 : 0) : 0;

        arena.answers[activePlayer.id] = { choice, correct, points, at: Date.now() };
        activePlayer.score += points;

        if (Object.keys(arena.answers).length >= arena.players.length) {
          arena.revealed = true;
        }
        arena.version++;
        return sendJsonResponse(res, 200, { ok: true, points, correct, room: sanitizeRoomSnapshot(arena) });
      }

      if (payload.action === 'next') {
        if (arena.hostId !== activePlayer.id) return sendHttpError(res, 'Only the host can advance rounds.', 403);
        if (arena.status !== 'playing') return sendHttpError(res, 'No active battle round.');
        if (!arena.revealed && Object.keys(arena.answers).length < arena.players.length) {
          return sendHttpError(res, 'Awaiting all competitor submissions.', 409);
        }

        const qList = (arena.questions && arena.questions.length) ? arena.questions : questionPool;
        arena.revealed = true;
        if (arena.round + 1 >= qList.length) {
          arena.status = 'finished';
        } else {
          arena.round++;
          arena.answers = {};
          arena.revealed = false;
        }
        arena.version++;
        return sendJsonResponse(res, 200, { room: sanitizeRoomSnapshot(arena) });
      }

      return sendHttpError(res, 'Unrecognized action.');
    } catch (e) {
      return sendHttpError(res, e.message || 'Server error occurred.', 500);
    }
  }

  if (req.method === 'GET') {
    const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    if (file.includes('..') || file.startsWith('/')) return fail(res, 'Not found.', 404);

    const full = path.join(root, file);
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8',
      '.md': 'text/markdown; charset=utf-8',
      '.svg': 'image/svg+xml'
    };

    try {
      const data = await readFile(full);
      return respond(res, 200, data, types[path.extname(full)] || 'application/octet-stream');
    } catch {
      return fail(res, 'Resource not found.', 404);
    }
  }

  fail(res, 'Not found.', 404);
}

const port = Number(process.env.PORT || 3001);
createServer((req, res) => {
  handle(req, res).catch(() => fail(res, 'Unexpected server error.', 500));
}).listen(port, '0.0.0.0', () => console.log(`MindBlitz Arena is running at http://localhost:${port}`));
