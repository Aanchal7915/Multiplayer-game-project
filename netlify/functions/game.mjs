import { getStore } from '@netlify/blobs';

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

function pickRandomQuestions(count = 3) {
  const shuffled = [...QUESTION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const store = () => getStore({ name: 'mindblitz-arena-rooms', consistency: 'strong' });
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  }
});

const fail = (message, status = 400) => json({ error: message }, status);
const codeOf = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
const safeName = s => String(s || '').trim().replace(/\s+/g, ' ').slice(0, 18);

function publicRoom(room, playerId) {
  const qList = (room.questions && room.questions.length) ? room.questions : QUESTION_POOL.slice(0, 3);
  const q = room.status === 'playing' ? qList[room.round] : null;
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score, joinedAt: p.joinedAt })),
    round: room.round,
    roundCount: qList.length,
    currentQuestion: q ? {
      category: q.category,
      text: q.text,
      options: q.options,
      correctIndex: room.revealed ? q.correctIndex : null,
      explanation: room.revealed ? q.explanation : null
    } : null,
    answers: room.answers,
    answerCount: Object.keys(room.answers || {}).length,
    revealed: room.revealed,
    version: room.version
  };
}

async function readRoom(code) {
  return await (await store()).get(code, { type: 'json' });
}

async function writeRoom(room, isNew = false) {
  room.version = (room.version || 0) + 1;
  const result = isNew
    ? await (await store()).setJSON(room.code, room, { onlyIfNew: true })
    : await (await store()).setJSON(room.code, room);
  if (isNew && !result.modified) {
    throw Object.assign(new Error('Arena code collision. Please try again.'), { status: 409 });
  }
}

function requirePlayer(room, id) {
  const p = room.players.find(x => x.id === id);
  if (!p) throw Object.assign(new Error('You are not registered in this arena.'), { status: 403 });
  return p;
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type'
      }
    });
  }

  if (req.method !== 'POST') return fail('Use POST for game actions.', 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return fail('Invalid request payload.');
  }

  const action = String(body.action || '');

  try {
    if (action === 'create') {
      const name = safeName(body.name);
      if (name.length < 2) return fail('Please choose a nickname with at least 2 characters.');
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 15; i++) {
        code = '';
        for (let j = 0; j < 7; j++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (code.length === 7 && !await readRoom(code)) break;
        code = '';
      }
      if (!code) return fail('Could not create an arena. Please try again.', 503);

      const player = { id: crypto.randomUUID(), name, score: 0, joinedAt: Date.now() };
      const room = {
        code,
        hostId: player.id,
        status: 'lobby',
        players: [player],
        round: -1,
        questions: pickRandomQuestions(3),
        answers: {},
        revealed: false,
        version: 0,
        createdAt: Date.now()
      };
      await writeRoom(room, true);
      return json({ room: publicRoom(room, player.id), player });
    }

    const code = codeOf(body.code);
    if (code.length !== 7) return fail('Enter a valid 7-character arena code.');
    let room = await readRoom(code);
    if (!room) return fail('Arena not found. Verify the code and try again.', 404);

    if (action === 'join') {
      const name = safeName(body.name);
      if (name.length < 2) return fail('Please choose a nickname with at least 2 characters.');
      if (room.status !== 'lobby') return fail('Battle is already underway. Join a new arena.', 409);
      if (room.players.length >= 8) return fail('Arena is full (8 competitors maximum).', 409);

      const player = { id: crypto.randomUUID(), name, score: 0, joinedAt: Date.now() };
      room.players.push(player);
      await writeRoom(room);
      return json({ room: publicRoom(room, player.id), player });
    }

    const playerId = String(body.playerId || '');
    const player = requirePlayer(room, playerId);

    if (action === 'get') return json({ room: publicRoom(room, playerId) });

    if (action === 'start') {
      if (room.hostId !== playerId) return fail('Only the host can launch the battle.', 403);
      if (room.status !== 'lobby') return fail('The battle has already started.');
      if (room.players.length < 2) return fail('At least 2 competitors are required to launch.');
      if (!room.questions || !room.questions.length) {
        room.questions = pickRandomQuestions(3);
      }
      room.status = 'playing';
      room.round = 0;
      room.answers = {};
      room.revealed = false;
      await writeRoom(room);
      return json({ room: publicRoom(room, playerId) });
    }

    if (action === 'answer') {
      if (room.status !== 'playing') return fail('Submissions are currently locked.', 409);
      if (room.revealed) return fail('This round has concluded.', 409);
      if (Object.prototype.hasOwnProperty.call(room.answers, playerId)) return fail('Your choice is already locked in.', 409);

      const choice = Number(body.choice);
      const qList = (room.questions && room.questions.length) ? room.questions : QUESTION_POOL;
      const q = qList[room.round];
      if (!Number.isInteger(choice) || choice < 0 || choice >= q.options.length) {
        return fail('Select one of the valid options.');
      }

      const firstCorrect = !Object.values(room.answers).some(a => a.choice === q.correctIndex);
      const correct = choice === q.correctIndex;
      const points = correct ? 100 + (firstCorrect ? 50 : 0) : 0;

      room.answers[playerId] = { choice, correct, points, at: Date.now() };
      player.score += points;

      if (Object.keys(room.answers).length >= room.players.length) {
        room.revealed = true;
      }
      await writeRoom(room);
      return json({ ok: true, points, correct, room: publicRoom(room, playerId) });
    }

    if (action === 'next') {
      if (room.hostId !== playerId) return fail('Only the host can advance rounds.', 403);
      if (room.status !== 'playing') return fail('No active battle round.');
      if (!room.revealed && Object.keys(room.answers).length < room.players.length) {
        return fail('Awaiting all competitor submissions.', 409);
      }

      const qList = (room.questions && room.questions.length) ? room.questions : QUESTION_POOL;
      room.revealed = true;
      if (room.round + 1 >= qList.length) {
        room.status = 'finished';
      } else {
        room.round++;
        room.answers = {};
        room.revealed = false;
      }
      await writeRoom(room);
      return json({ room: publicRoom(room, playerId) });
    }

    return fail('Unrecognized action.');
  } catch (e) {
    return fail(e.message || 'Game server error.', e.status || 500);
  }
};
