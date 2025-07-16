import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './src/graphql/schema';
import { createContext } from './src/middleware/auth';
import 'dotenv/config';

const yoga = createYoga({
  schema,
  context: createContext,
});

createServer(yoga).listen(4000, () => {
  console.log('🚀 Server ready at http://localhost:4000/graphql');
});
