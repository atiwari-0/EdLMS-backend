import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { auth } from './modules/auth';

export const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([auth.typeDefs]),
  resolvers: mergeResolvers([auth.resolvers]),
});
