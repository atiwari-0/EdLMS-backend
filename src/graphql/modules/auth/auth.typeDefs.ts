export const authTypeDefs = `
  enum Role {
    ADMIN
    TEACHER
    STUDENT
  }

  type AuthPayload {
    token: String!
    role: Role!
  }

  type User {
    id: String!
    name: String!
    email: String!
    role: Role!
  }

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
  }
`;
