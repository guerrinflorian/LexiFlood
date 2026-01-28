import { Server, Socket } from 'socket.io';
import { checkWord } from './dictionary';

const LETTER_BAG_COUNTS: Record<string, number> = {
  E: 15,
  A: 9,
  I: 8,
  O: 6,
  U: 5,
  Y: 2,
  S: 7,
  R: 6,
  T: 6,
  N: 6,
  L: 5,
  D: 3,
  M: 3,
  P: 2,
  C: 2,
  B: 2,
  F: 2,
  G: 2,
  H: 2,
  V: 1,
  J: 1,
  Q: 1,
  K: 1,
  W: 1,
  X: 1,
  Z: 1
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

const LETTER_POINTS: Record<string, number> = {
  A: 1,
  E: 1,
  I: 1,
  L: 1,
  N: 1,
  O: 1,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  D: 2,
  G: 2,
  M: 2,
  B: 2,
  C: 2,
  P: 2,
  F: 3,
  H: 3,
  V: 3,
  W: 3,
  Y: 3,
  J: 5,
  Q: 5,
  K: 5,
  X: 5,
  Z: 5
};

const ROUND_DURATION_MS = 90_000;
const LETTER_INTERVAL_MS = 2500;
const INITIAL_LETTERS = 5;
const INTERMISSION_DURATION_MS = 10_000;

const normalizeWord = (value: string) =>
  value
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z]/g, '');

const getLengthModifiers = (length: number) => {
  if (length === 2) {
    return { multiplier: 0.5, bonus: 0 };
  }
  if (length === 3) {
    return { multiplier: 1, bonus: 0 };
  }
  if (length === 4) {
    return { multiplier: 1.1, bonus: 5 };
  }
  if (length === 5) {
    return { multiplier: 1.2, bonus: 10 };
  }
  if (length === 6) {
    return { multiplier: 1.3, bonus: 20 };
  }
  if (length === 7) {
    return { multiplier: 1.4, bonus: 30 };
  }
  if (length >= 8) {
    return { multiplier: 1.5, bonus: 50 };
  }
  return { multiplier: 1, bonus: 0 };
};

const computeScore = (word: string) => {
  const letters = word.split('');
  const letterSum = letters.reduce((sum, letter) => sum + (LETTER_POINTS[letter] ?? 0), 0);
  const { multiplier, bonus } = getLengthModifiers(word.length);
  return Math.floor(letterSum * multiplier + bonus);
};

const buildLetterBag = () => {
  const bag: string[] = [];
  Object.entries(LETTER_BAG_COUNTS).forEach(([letter, count]) => {
    for (let item = 0; item < count; item += 1) {
      bag.push(letter);
    }
  });
  return bag;
};

const getConsonantStreak = (letters: string[]) => {
  let streak = 0;
  for (let index = letters.length - 1; index >= 0; index -= 1) {
    const letter = letters[index];
    if (!letter) {
      break;
    }
    if (VOWELS.has(letter)) {
      break;
    }
    streak += 1;
  }
  return streak;
};

const getVowelRatio = (letters: string[]) => {
  if (!letters.length) {
    return 0;
  }
  const vowelCount = letters.filter((letter) => VOWELS.has(letter)).length;
  return vowelCount / letters.length;
};

const createLetterGenerator = () => {
  const letterBag = buildLetterBag();
  let lastSpawnedLetter: string | null = null;

  const drawLetterFromBag = () => {
    if (letterBag.length === 0) {
      letterBag.push(...buildLetterBag());
    }
    const index = Math.floor(Math.random() * letterBag.length);
    return letterBag.splice(index, 1)[0];
  };

  const drawSmartLetter = (recentLetters: string[]) => {
    const consonantStreak = getConsonantStreak(recentLetters);
    const vowelRatio = getVowelRatio(recentLetters);
    let forceVowel = consonantStreak >= 4;
    let forceConsonant = false;

    if (!forceVowel && recentLetters.length >= 5) {
      forceConsonant = vowelRatio >= 0.6;
    }

    if (forceVowel && forceConsonant) {
      forceVowel = false;
      forceConsonant = false;
    }

    const pickCandidate = (shouldBeVowel: boolean | null) => {
      let candidate = drawLetterFromBag();
      if (shouldBeVowel === null) {
        return candidate;
      }
      let attempts = 0;
      while (VOWELS.has(candidate) !== shouldBeVowel && attempts < 8) {
        letterBag.push(candidate);
        candidate = drawLetterFromBag();
        attempts += 1;
      }
      return candidate;
    };

    const desiredVowel = forceVowel ? true : forceConsonant ? false : null;
    let letter = pickCandidate(desiredVowel);
    if (lastSpawnedLetter && letter === lastSpawnedLetter) {
      letterBag.push(letter);
      letter = pickCandidate(desiredVowel);
    }
    lastSpawnedLetter = letter;
    return letter;
  };

  return { drawSmartLetter };
};

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let index = 0; index < 4; index += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const generateToken = () => Math.random().toString(36).slice(2, 10).toUpperCase();

type Player = {
  id: string;
  token: string;
  name: string;
  score: number;
  ko: boolean;
  eliminated: boolean;
  connected: boolean;
  usedWords: Set<string>;
};

type LetterEvent = { tickIndex: number; letter: string };
type WordHistoryEntry = {
  id: string;
  playerId: string;
  playerName: string;
  points: number;
  createdAt: number;
};

type Room = {
  code: string;
  hostId: string;
  status: 'lobby' | 'inRound' | 'roundEnd' | 'finished';
  players: Map<string, Player>;
  roundIndex: number;
  rounds: number[];
  roundStartAt: number | null;
  nextRoundStartAt: number | null;
  durationMs: number;
  letterIntervalMs: number;
  letterHistory: LetterEvent[];
  initialLetters: string[];
  wordHistory: WordHistoryEntry[];
  letterTimer: ReturnType<typeof setInterval> | null;
  roundTimer: ReturnType<typeof setTimeout> | null;
};

const rooms = new Map<string, Room>();

const getRoundTargets = (playerCount: number) => {
  if (playerCount <= 3) {
    return [playerCount];
  }
  if (playerCount <= 8) {
    return [3, 3];
  }
  if (playerCount <= 14) {
    return [6, 3, 3];
  }
  return [10, 6, 3, 3];
};

const getRoomPlayers = (room: Room) => Array.from(room.players.values());

const getSortedPlayers = (room: Room) => {
  const players = getRoomPlayers(room);
  return players.sort((a, b) => {
    if (a.eliminated !== b.eliminated) {
      return a.eliminated ? 1 : -1;
    }
    if (a.ko !== b.ko) {
      return a.ko ? 1 : -1;
    }
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name, 'fr');
  });
};

const formatScoreboard = (room: Room) => {
  const sorted = getSortedPlayers(room);
  return sorted.map((player, index) => ({
    id: player.id,
    name: player.name,
    score: player.score,
    ko: player.ko,
    eliminated: player.eliminated,
    connected: player.connected,
    position: index + 1
  }));
};

const emitRoomState = (io: Server, room: Room) => {
  io.to(room.code).emit('room:state', {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    players: getRoomPlayers(room).map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      ko: player.ko,
      eliminated: player.eliminated,
      connected: player.connected
    }))
  });
};

const emitScoreboard = (io: Server, room: Room) => {
  io.to(room.code).emit('game:scoreboard', {
    scoreboard: formatScoreboard(room)
  });
};

const resetRoundState = (room: Room) => {
  room.letterHistory = [];
  room.initialLetters = [];
  room.wordHistory = [];
  room.roundStartAt = null;
  room.nextRoundStartAt = null;
  room.durationMs = ROUND_DURATION_MS;
  room.letterIntervalMs = LETTER_INTERVAL_MS;
};

const startRound = (io: Server, room: Room) => {
  if (room.letterTimer) {
    clearInterval(room.letterTimer);
    room.letterTimer = null;
  }
  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
    room.roundTimer = null;
  }
  room.status = 'inRound';
  resetRoundState(room);
  const activePlayers = getRoomPlayers(room).filter((player) => !player.eliminated);
  activePlayers.forEach((player) => {
    player.score = 0;
    player.ko = false;
    player.usedWords = new Set();
  });

  const generator = createLetterGenerator();
  const recentLetters: string[] = [];
  room.initialLetters = Array.from({ length: INITIAL_LETTERS }, () => {
    const letter = generator.drawSmartLetter(recentLetters);
    recentLetters.push(letter);
    return letter;
  });
  room.initialLetters.forEach((letter, index) => {
    room.letterHistory.push({ tickIndex: index, letter });
  });

  room.roundStartAt = Date.now() + 1000;
  room.nextRoundStartAt = null;

  const targetQualified = room.rounds[room.roundIndex] ?? 1; // Default to 1 (winner) if index out of bounds

  io.to(room.code).emit('game:round:start', {
    roundIndex: room.roundIndex,
    totalRounds: room.rounds.length,
    targetQualified,
    roundStartAt: room.roundStartAt,
    durationMs: room.durationMs,
    letterIntervalMs: room.letterIntervalMs,
    initialLetters: room.initialLetters
  });

  emitScoreboard(io, room);

  const startLetterLoop = () => {
    let tickIndex = room.initialLetters.length;
    room.letterTimer = setInterval(() => {
      const letter = generator.drawSmartLetter(recentLetters);
      recentLetters.push(letter);
      room.letterHistory.push({ tickIndex, letter });
      io.to(room.code).emit('game:letter', { tickIndex, letter });
      tickIndex += 1;
    }, room.letterIntervalMs);
  };

  const startDelay = Math.max(room.roundStartAt - Date.now(), 0);
  setTimeout(startLetterLoop, startDelay + room.letterIntervalMs);

  room.roundTimer = setTimeout(() => {
    if (room.letterTimer) {
      clearInterval(room.letterTimer);
      room.letterTimer = null;
    }
    room.roundTimer = null;
    finishRound(io, room);
  }, startDelay + room.durationMs);
};

const finishRound = (io: Server, room: Room) => {
  room.status = 'roundEnd';

  const targetRemaining = room.rounds[room.roundIndex];
  const sorted = getSortedPlayers(room).filter((player) => !player.eliminated);

  // Check if only one connected player remains during the game
  const connectedActivePlayers = sorted.filter((player) => player.connected);
  if (connectedActivePlayers.length <= 1) {
    // Force finish the game if only one player remains
    room.status = 'finished';
    const scoreboard = formatScoreboard(room);
    io.to(room.code).emit('game:end', {
      scoreboard,
      winnerId: connectedActivePlayers[0]?.id ?? scoreboard[0]?.id ?? null
    });
    if (room.letterTimer) {
      clearInterval(room.letterTimer);
      room.letterTimer = null;
    }
    if (room.roundTimer) {
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
    }
    return;
  }

  const qualifiers = sorted.slice(0, targetRemaining);
  const eliminated = sorted.slice(targetRemaining);

  eliminated.forEach((player) => {
    player.eliminated = true;
  });

  const scoreboard = formatScoreboard(room);

  room.roundIndex += 1;

  if (room.roundIndex >= room.rounds.length) {
    room.nextRoundStartAt = null;
    io.to(room.code).emit('game:round:end', {
      roundIndex: room.roundIndex - 1,
      totalRounds: room.rounds.length,
      scoreboard,
      eliminatedIds: eliminated.map((player) => player.id),
      qualifiedIds: qualifiers.map((player) => player.id),
      nextRoundStartAt: null
    });
    room.status = 'finished';
    io.to(room.code).emit('game:end', {
      scoreboard,
      winnerId: scoreboard[0]?.id ?? null
    });
    if (room.letterTimer) {
      clearInterval(room.letterTimer);
      room.letterTimer = null;
    }
    if (room.roundTimer) {
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
    }
    return;
  }

  room.nextRoundStartAt = Date.now() + INTERMISSION_DURATION_MS;
  io.to(room.code).emit('game:round:end', {
    roundIndex: room.roundIndex - 1,
    totalRounds: room.rounds.length,
    scoreboard,
    eliminatedIds: eliminated.map((player) => player.id),
    qualifiedIds: qualifiers.map((player) => player.id),
    nextRoundStartAt: room.nextRoundStartAt
  });

  const delay = Math.max(room.nextRoundStartAt - Date.now(), 0);
  setTimeout(() => {
    startRound(io, room);
  }, delay);
};

const sendSnapshot = (socket: Socket, room: Room) => {
  const scoreboard = formatScoreboard(room);
  socket.emit('game:snapshot', {
    status: room.status,
    roundIndex: room.roundIndex,
    totalRounds: room.rounds.length,
    targetQualified: room.rounds[room.roundIndex] ?? 1,
    roundStartAt: room.roundStartAt,
    nextRoundStartAt: room.nextRoundStartAt,
    durationMs: room.durationMs,
    letterIntervalMs: room.letterIntervalMs,
    letterHistory: room.letterHistory,
    initialLetters: room.initialLetters,
    wordHistory: room.wordHistory,
    scoreboard,
    winnerId: room.status === 'finished' ? scoreboard[0]?.id ?? null : null
  });
};

const checkAndHandleGameEnd = (io: Server, room: Room) => {
  if (room.status !== 'inRound' && room.status !== 'roundEnd') {
    return;
  }

  const connectedActivePlayers = getRoomPlayers(room)
    .filter((p) => !p.eliminated && p.connected);

  if (connectedActivePlayers.length <= 1) {
    if (room.letterTimer) {
      clearInterval(room.letterTimer);
      room.letterTimer = null;
    }
    if (room.roundTimer) {
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
    }
    room.status = 'finished';
    const scoreboard = formatScoreboard(room);
    io.to(room.code).emit('game:end', {
      scoreboard,
      winnerId: connectedActivePlayers[0]?.id ?? scoreboard[0]?.id ?? null
    });
  }
};

export const registerMultiplayer = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('room:create', ({ name }: { name: string }) => {
      const code = generateRoomCode();
      const token = generateToken();
      const player: Player = {
        id: socket.id,
        token,
        name: name?.trim() || 'LexiHero',
        score: 0,
        ko: false,
        eliminated: false,
        connected: true,
        usedWords: new Set()
      };
      const room: Room = {
        code,
        hostId: socket.id,
        status: 'lobby',
        players: new Map([[socket.id, player]]),
        roundIndex: 0,
        rounds: [],
        roundStartAt: null,
        nextRoundStartAt: null,
        durationMs: ROUND_DURATION_MS,
        letterIntervalMs: LETTER_INTERVAL_MS,
        letterHistory: [],
        initialLetters: [],
        wordHistory: [],
        letterTimer: null,
        roundTimer: null
      };
      rooms.set(code, room);
      socket.join(code);
      socket.emit('room:created', {
        code,
        token,
        playerId: socket.id,
        hostId: room.hostId
      });
      emitRoomState(io, room);
    });

    socket.on('room:join', ({ code, name, token }: { code: string; name: string; token?: string }) => {
      const room = rooms.get(code);
      if (!room) {
        socket.emit('error', { message: 'Room introuvable.' });
        return;
      }

      const existingPlayer = token
        ? Array.from(room.players.values()).find((player) => player.token === token)
        : undefined;

      if (!existingPlayer && room.status !== 'lobby') {
        socket.emit('error', { message: 'La partie a déjà commencé.' });
        return;
      }

      if (existingPlayer) {
        const previousId = existingPlayer.id;
        room.players.delete(previousId);
        existingPlayer.id = socket.id;
        existingPlayer.connected = true;
        if (name) {
          existingPlayer.name = name.trim();
        }
        room.players.set(socket.id, existingPlayer);
        if (room.hostId === previousId) {
          room.hostId = socket.id;
        }
      } else {
        const newToken = generateToken();
        const player: Player = {
          id: socket.id,
          token: newToken,
          name: name?.trim() || 'LexiHero',
          score: 0,
          ko: false,
          eliminated: false,
          connected: true,
          usedWords: new Set()
        };
        room.players.set(socket.id, player);
      }

      socket.join(code);
      const player = room.players.get(socket.id);
      socket.emit('room:joined', {
        code,
        token: player?.token,
        playerId: socket.id,
        hostId: room.hostId
      });
      emitRoomState(io, room);

      if (room.status !== 'lobby') {
        sendSnapshot(socket, room);
      }
    });

    socket.on('room:leave', () => {
      const room = Array.from(rooms.values()).find((item) => item.players.has(socket.id));
      if (!room) {
        return;
      }
      room.players.delete(socket.id);
      socket.leave(room.code);
      if (room.hostId === socket.id) {
        const nextHost = getRoomPlayers(room).find((player) => player.connected);
        room.hostId = nextHost?.id ?? room.hostId;
      }
      if (room.players.size === 0) {
        rooms.delete(room.code);
        return;
      }

      checkAndHandleGameEnd(io, room);

      emitRoomState(io, room);
      emitScoreboard(io, room);
    });


    socket.on('game:start', () => {
      const room = Array.from(rooms.values()).find((item) => item.players.has(socket.id));
      if (!room) {
        return;
      }
      if (room.hostId !== socket.id) {
        socket.emit('error', { message: 'Seul l\'hôte peut lancer la partie.' });
        return;
      }
      const activePlayers = getRoomPlayers(room).filter((player) => player.connected);
      if (activePlayers.length < 2) {
        socket.emit('error', { message: 'Il faut au moins 2 joueurs.' });
        return;
      }
      room.roundIndex = 0;
      room.rounds = getRoundTargets(activePlayers.length);
      room.players.forEach((player) => {
        player.eliminated = false;
        player.ko = false;
        player.score = 0;
        player.usedWords = new Set();
      });
      startRound(io, room);
    });

    socket.on('word:submit', ({ word }: { word: string }) => {
      const room = Array.from(rooms.values()).find((item) => item.players.has(socket.id));
      const player = room?.players.get(socket.id);
      if (!room || !player) {
        return;
      }
      if (room.status !== 'inRound' || player.eliminated || player.ko) {
        socket.emit('word:result', { ok: false, message: 'Action impossible.' });
        return;
      }
      const normalized = normalizeWord(word ?? '');
      if (!normalized) {
        socket.emit('word:result', { ok: false, message: 'Mot vide.' });
        return;
      }
      if (player.usedWords.has(normalized)) {
        socket.emit('word:result', { ok: false, message: 'Mot déjà utilisé.' });
        return;
      }
      if (!checkWord(normalized)) {
        socket.emit('word:result', { ok: false, message: 'Mot invalide.' });
        return;
      }
      const points = computeScore(normalized);
      player.score += points;
      player.usedWords.add(normalized);
      socket.emit('word:result', {
        ok: true,
        word: normalized,
        points,
        score: player.score
      });
      const historyEntry: WordHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        playerId: player.id,
        playerName: player.name,
        points,
        createdAt: Date.now()
      };
      room.wordHistory.unshift(historyEntry);
      io.to(room.code).emit('game:word:history', historyEntry);
      emitScoreboard(io, room);
    });

    socket.on('player:ko', () => {
      const room = Array.from(rooms.values()).find((item) => item.players.has(socket.id));
      const player = room?.players.get(socket.id);
      if (!room || !player || player.ko || player.eliminated) {
        return;
      }
      player.ko = true;
      player.eliminated = true; // KO implies elimination

      checkAndHandleGameEnd(io, room);

      emitScoreboard(io, room);
      emitRoomState(io, room);
    });

    socket.on('disconnect', () => {
      const room = Array.from(rooms.values()).find((item) => item.players.has(socket.id));
      const player = room?.players.get(socket.id);
      if (!room || !player) {
        return;
      }
      player.connected = false;
      if (room.hostId === socket.id) {
        const nextHost = getRoomPlayers(room).find((item) => item.connected);
        room.hostId = nextHost?.id ?? room.hostId;
      }

      checkAndHandleGameEnd(io, room);

      emitRoomState(io, room);
      emitScoreboard(io, room);
    });
  });
};
