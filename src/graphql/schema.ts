import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { auth } from './modules/auth';
import { admin } from './modules/admin';
import { teacher } from './modules/teacher';
import { student } from './modules/student';
export const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([auth.typeDefs,admin.typeDefs,teacher.typeDefs,student.typeDefs]),
  resolvers: mergeResolvers([auth.resolvers,admin.resolvers,teacher.resolvers,student.resolvers]),
});
