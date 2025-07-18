import { prisma } from '../lib/prisma'; 
import type { JwtPayload } from './auth';
import type { Response } from 'express';

export interface GraphQLContext {
  prisma: typeof prisma;
  user: JwtPayload | null;
  res: Response;
}
