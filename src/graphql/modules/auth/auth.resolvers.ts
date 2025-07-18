import { signJwt } from '../../../lib/jwt';
import type { GraphQLContext } from '../../../types/context';
import type { LoginInput } from '../../../types/auth';
import bcrypt from 'bcrypt';
export const authResolvers = {
  Mutation: {
    login: async (
      _: unknown,
      { email, password }: LoginInput,
      { prisma }: GraphQLContext
    ) => {
      try {
        console.log('🔐 Login attempt:', email);

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            password: true,
          },
        });

        if (!user) {
          console.warn('❌ Login failed: User not found');
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          console.warn('❌ Login failed: Incorrect password');
          throw new Error('Invalid credentials');
        }

        const token = await signJwt({
          id: user.id,
          role: String(user.role),
        });

        console.log('✅ Login successful:', user.email);

        return {
          token,
          role: user.role,
        };
      } catch (error) {
        console.error('🔥 Login error:', error);
        throw new Error('Unexpected error.');
      }
    },
    logout: async (_: unknown, __: unknown, { res }: GraphQLContext) => {
      res.setHeader('Set-Cookie', 'token=; Max-Age=0; Path=/; HttpOnly');
      return true;
    }
  },

  Query: {
    me: async (_: unknown, __: unknown, { prisma, user }: GraphQLContext) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!dbUser) {
        throw new Error('User not found');
      }

      return dbUser;
    },
  }

};
