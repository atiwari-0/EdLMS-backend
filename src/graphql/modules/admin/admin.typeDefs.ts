export const adminTypeDefs = /* GraphQL */ `

 enum Role {
    ADMIN
    TEACHER
    STUDENT
  }
 type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  type Student {
    id: ID!
    classId: ID!
    user: User!
    class: ClassRoom!
  }

  type Teacher {
    id: ID!
    userId: ID!
    subjectId: ID!
    user: User!
    subject: Subject!
    classes: [ClassRoom!]!
  }

  type ClassRoom {
    id: ID!
    name: String!
  }

  type Subject {
    id: ID!
    name: String!
  }

  input CreateStudentInput {
    name: String!
    classId: ID!
  }

  input CreateTeacherInput {
    name: String!
    subjectId: ID!
    classIds: [ID!]!
  }

  input CreateClassInput {
    name: String!
  }

  input CreateSubjectInput {
    name: String!
  }
  
  input UpdateStudentInput {
    id: ID!
    name: String
    classId: ID
  }

  input UpdateTeacherInput {
    id: ID!
    name: String
    subjectId: ID
    classIds: [ID!]
  }

  input UpdateClassInput {
    id: ID!
    name: String
  }

  input UpdateSubjectInput {
    id: ID!
    name: String
  }

  type Mutation {
    createStudent(input: CreateStudentInput!): Student!
    createTeacher(input: CreateTeacherInput!): Teacher!
    createClassRoom(input: CreateClassInput!): ClassRoom!
    createSubject(input: CreateSubjectInput!): Subject!

    updateStudent(input: UpdateStudentInput!): Student!
    deleteStudent(id: ID!): Boolean!

    updateTeacher(input: UpdateTeacherInput!): Teacher!
    deleteTeacher(id: ID!): Boolean!

    updateClassRoom(input: UpdateClassInput!): ClassRoom!
    deleteClassRoom(id: ID!): Boolean!

    updateSubject(input: UpdateSubjectInput!): Subject!
    deleteSubject(id: ID!): Boolean!
  }

  type Query {
    students: [Student!]!
    teachers: [Teacher!]!
    subjects: [Subject!]!
    classes: [ClassRoom!]!
  }

`;
