import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { auth } from './modules/auth';
import { admin } from './modules/admin';

export const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([auth.typeDefs,admin.typeDefs]),
  resolvers: mergeResolvers([auth.resolvers,admin.resolvers]),
});
