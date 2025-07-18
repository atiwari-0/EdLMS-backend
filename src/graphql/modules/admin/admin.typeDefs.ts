export const adminTypeDefs = /* GraphQL */ `

 enum Role {
    ADMIN
    TEACHER
    STUDENT
  }
 type User {
    id: String!
    name: String!
    email: String!
    role: Role!
  }

  type Student {
    id: String!
    userId: String!
    classId: String!
    user: User!
    class: ClassRoom!
  }

  type Teacher {
    id: String!
    userId: String!
    subjectId: String!
    user: User!
    subject: Subject!
    classes: [ClassRoom!]!
  }

  type ClassRoom {
    id: String!
    name: String!
  }

  type Subject {
    id: String!
    name: String!
  }

  input CreateStudentInput {
    name: String!
    classId: String!
  }

  input CreateTeacherInput {
    name: String!
    subjectId: String!
    classIds: [String!]!
  }

  input CreateClassInput {
    name: String!
  }

  input CreateSubjectInput {
    name: String!
  }

  type Mutation {
    createStudent(input: CreateStudentInput!): Student!
    createTeacher(input: CreateTeacherInput!): Teacher!
    createClassRoom(input: CreateClassInput!): ClassRoom!
    createSubject(input: CreateSubjectInput!): Subject!
  }

  type Query {
    students: [Student!]!
    teachers: [Teacher!]!
    subjects: [Subject!]!
    classes: [ClassRoom!]!
  }

`;
