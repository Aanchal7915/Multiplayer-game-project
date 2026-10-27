import { randomUUID } from 'node:crypto';

// In-memory arena state for Vercel Serverless Function instances
const activeArenas = globalThis._mindblitz_arenas || new Map();
globalThis._mindblitz_arenas = activeArenas;

const QUESTION_POOL = [
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
    category: 'World Geography',
    text: 'Which country in the world boasts the highest total number of natural and artificial islands (over 267,000 islands)?',
    options: ['Sweden', 'Indonesia', 'Philippines', 'Canada'],
    correctIndex: 0,
    explanation: 'Sweden officially holds the world record with approximately 267,570 islands, though fewer than 1,000 are inhabited!'
  },
  {
    category: 'World History',
    text: 'Constructed around 2560 BC, the Great Pyramid of Giza was the tallest man-made structure on Earth for over how many years?',
    options: ['Over 3,800 years', 'About 500 years', 'Around 1,200 years', 'Roughly 2,000 years'],
    correctIndex: 0,
    explanation: 'At 146.6 meters tall, the Great Pyramid remained the world’s tallest human-made structure until the spire of Lincoln Cathedral in England was built in 1311 AD (approx. 3,871 years)!'
  },
  {
    category: 'Computer Science',
    text: 'In 1947, computer pioneer Grace Hopper recorded the first actual computer bug in an electromechanical computer logbook. What was it?',
    options: ['A real moth trapped in a relay', 'A blown vacuum tube', 'A misplaced punch card', 'A copper wire solder short'],
    correctIndex: 0,
    explanation: 'Operators working on the Harvard Mark II computer found a live moth trapped between relay points, taped it into their logbook, and wrote "First actual case of bug being found"!'
  },
  {
    category: 'Natural Wonders',
    text: 'What is the deepest known location in Earth’s oceans, descending nearly 11,000 meters (36,000 feet) below sea level?',
    options: ['Challenger Deep', 'Java Trench', 'Puerto Rico Trench', 'Milwaukee Deep'],
    correctIndex: 0,
    explanation: 'Challenger Deep at the southern end of the Mariana Trench is the lowest point on Earth’s seabed, deep enough to fully submerge Mount Everest with over 2 km of water above it!'
  },
  {
    category: 'Science & Physics',
    text: 'Approximately how long does it take for light emitted from the surface of the Sun to travel across space and reach planet Earth?',
    options: ['8 minutes and 20 seconds', 'Instantaneous', 'About 30 seconds', '1 hour and 15 minutes'],
    correctIndex: 0,
    explanation: 'Traveling at ~300,000 km/s across an average distance of 149.6 million km, sunlight takes roughly 8 minutes and 20 seconds (500 seconds) to reach us.'
  },
  {
    category: 'Physics & Nature',
    text: 'Which constant represents the absolute universal cosmic speed limit in physics?',
    options: ['Speed of light in a vacuum (c)', 'Speed of sound (Mach 1)', 'Escape velocity of Earth', 'Orbital speed of Jupiter'],
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
  const shuffled = [...QUESTION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const sanitizePlayerName = s => String(s || '').trim().replace(/\s+/g, ' ').slice(0, 18);
const normalizeArenaCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

function sanitizeRoomSnapshot(arena) {
  const qList = (arena.questions && arena.questions.length) ? arena.questions : QUESTION_POOL.slice(0, 3);
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
    answerCount: Object.keys(arena.answers || {}).length,
    revealed: arena.revealed,
    version: arena.version
  };
}

export default async function handler(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  try {
    if (payload.action === 'create') {
      const name = sanitizePlayerName(payload.name);
      if (name.length < 2) return res.status(400).json({ error: 'Please choose a nickname with at least 2 characters.' });
      
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code;
      do {
        code = '';
        for (let i = 0; i < 7; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      } while (code.length !== 7 || activeArenas.has(code));

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
      activeArenas.set(code, arena);
      return res.status(200).json({ room: sanitizeRoomSnapshot(arena), player });
    }

    const code = normalizeArenaCode(payload.code);
    if (code.length !== 7) return res.status(400).json({ error: 'Enter the 7-character arena code.' });
    const arena = activeArenas.get(code);
    if (!arena) return res.status(404).json({ error: 'Arena not found. Verify the code and try again.' });

    if (payload.action === 'join') {
      const name = sanitizePlayerName(payload.name);
      if (name.length < 2) return res.status(400).json({ error: 'Please choose a nickname with at least 2 characters.' });
      if (arena.status !== 'lobby') return res.status(409).json({ error: 'Battle is already underway. Join a new arena.' });
      if (arena.players.length >= 8) return res.status(409).json({ error: 'Arena is full (8 competitors maximum).' });

      const player = { id: randomUUID(), name, score: 0, joinedAt: Date.now() };
      arena.players.push(player);
      arena.version++;
      return res.status(200).json({ room: sanitizeRoomSnapshot(arena), player });
    }

    const activePlayer = arena.players.find(x => x.id === payload.playerId);
    if (!activePlayer) return res.status(403).json({ error: 'You are not registered in this arena.' });

    if (payload.action === 'get') {
      return res.status(200).json({ room: sanitizeRoomSnapshot(arena) });
    }

    if (payload.action === 'start') {
      if (arena.hostId !== activePlayer.id) return res.status(403).json({ error: 'Only the host can launch the battle.' });
      if (arena.status !== 'lobby') return res.status(400).json({ error: 'The battle has already started.' });
      if (arena.players.length < 2) return res.status(400).json({ error: 'At least 2 competitors are required to launch.' });

      if (!arena.questions || !arena.questions.length) {
        arena.questions = pickQuestions(3);
      }
      arena.status = 'playing';
      arena.round = 0;
      arena.answers = {};
      arena.revealed = false;
      arena.version++;
      return res.status(200).json({ room: sanitizeRoomSnapshot(arena) });
    }

    if (payload.action === 'answer') {
      if (arena.status !== 'playing' || arena.revealed) return res.status(409).json({ error: 'Submissions are currently locked.' });
      if (Object.hasOwn(arena.answers, activePlayer.id)) return res.status(409).json({ error: 'Your choice is already locked in.' });

      const choice = Number(payload.choice);
      const qList = (arena.questions && arena.questions.length) ? arena.questions : QUESTION_POOL;
      const currentQ = qList[arena.round];
      if (!Number.isInteger(choice) || choice < 0 || choice >= currentQ.options.length) {
        return res.status(400).json({ error: 'Select one of the valid options.' });
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
      return res.status(200).json({ ok: true, points, correct, room: sanitizeRoomSnapshot(arena) });
    }

    if (payload.action === 'next') {
      if (arena.hostId !== activePlayer.id) return res.status(403).json({ error: 'Only the host can advance rounds.' });
      if (arena.status !== 'playing') return res.status(400).json({ error: 'No active battle round.' });
      if (!arena.revealed && Object.keys(arena.answers).length < arena.players.length) {
        return res.status(409).json({ error: 'Awaiting all competitor submissions.' });
      }

      const qList = (arena.questions && arena.questions.length) ? arena.questions : QUESTION_POOL;
      arena.revealed = true;
      if (arena.round + 1 >= qList.length) {
        arena.status = 'finished';
      } else {
        arena.round++;
        arena.answers = {};
        arena.revealed = false;
      }
      arena.version++;
      return res.status(200).json({ room: sanitizeRoomSnapshot(arena) });
    }

    return res.status(400).json({ error: 'Unrecognized action.' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Serverless function error.' });
  }
}
