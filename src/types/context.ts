import { prisma } from '../lib/prisma'; 
import type { JwtPayload } from './auth';

export interface GraphQLContext {
  prisma: typeof prisma;
  user: JwtPayload | null;
}
