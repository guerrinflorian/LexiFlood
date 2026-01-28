import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { checkWord } from './dictionary';
import { registerMultiplayer } from './multiplayer';

const app = Fastify({ logger: true });

const startServer = async () => {
  await app.register(cors, {
    origin: true
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.post<{ Body: { word?: string } }>('/check-word', async (request, reply) => {
    const { word } = request.body ?? {};
    if (!word) {
      reply.status(400);
      return { valid: false, error: 'Mot manquant.' };
    }
    const valid = checkWord(word);
    return { valid };
  });

  const io = new Server(app.server, {
    cors: { origin: true }
  });

  registerMultiplayer(io);

  const port = 3000;
  try {
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`LexiFlood API running on port ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

startServer();
