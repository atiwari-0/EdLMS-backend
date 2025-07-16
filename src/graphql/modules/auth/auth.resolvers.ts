import { signJwt } from '../../../lib/jwt';
import type { GraphQLContext } from '../../../types/context';
import type { LoginInput } from '../../../types/auth';

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

        const isValid = await Bun.password.verify(password, user.password);
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
