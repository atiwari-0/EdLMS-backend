import { prisma } from '../lib/prisma';
import { jwtVerify } from 'jose';
import type { GraphQLContext } from '../types/context';
import type { JwtPayload } from '../types/auth';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createContext({ request }: { request: Request }): Promise<GraphQLContext> {
  const header = request.headers.get('authorization');
  let user: JwtPayload | null = null;
  if (header?.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    if (token) {
        try {
        const { payload } = await jwtVerify(token, secret);
        if (typeof payload.id === 'string' && typeof payload.role === 'string') {
            user = {
            id: payload.id,
            role: payload.role as JwtPayload['role'],
            };
        }
        } catch (err) {
        console.warn('JWT verification failed:', err);
        user = null;
        }
    }
  }

  return { prisma, user };
}
