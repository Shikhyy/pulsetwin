import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { login, getCurrentUser } from './auth.service.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);
      const user = await login(email, password);
      const token = fastify.jwt.sign({ id: user.id, role: user.role, email: user.email });
      return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    } catch (e: any) {
      return reply.status(401).send({ error: e.message || 'Unauthorized' });
    }
  });

  fastify.post('/refresh', async (request, reply) => {
    try {
      await request.jwtVerify();
      const userPayload = request.user as any;
      const token = fastify.jwt.sign({ id: userPayload.id, role: userPayload.role, email: userPayload.email });
      return { token };
    } catch (e) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.get('/me', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }]
  }, async (request, reply) => {
    const userPayload = request.user as any;
    try {
      const user = await getCurrentUser(userPayload.id);
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    } catch (e: any) {
      return reply.status(404).send({ error: 'User not found' });
    }
  });
}
