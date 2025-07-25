export const studentTypeDefs = `
  enum Role {
    ADMIN
    TEACHER
    STUDENT
  }

  enum AttendanceStatus {
    PRESENT
    ABSENT
    LATE
  }

  enum PaymentStatus {
    PENDING
    PROCESSING
    PAID
  }

  enum DoubtStatus {
    OPEN
    RESPONDED
    RESOLVED
  }

  enum SessionStatus {
    SCHEDULED
    ONGOING
    COMPLETED
    CANCELLED
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  type ClassRoom {
    id: ID!
    name: String!
  }

  type Subject {
    id: ID!
    name: String!
  }

  type Session {
    id: ID!
    title: String!
    startTime: String!
    endTime: String!
    isLive: Boolean!
    link: String!
    status: SessionStatus!
    course: Course!
  }

  type Attendance {
    id: ID!
    session: Session!
    status: AttendanceStatus!
  }

  type Payment {
    id: ID!
    amount: Float!
    dueDate: String!
    status: PaymentStatus!
    paidAt: String
  }

  type Doubt {
    id: ID!
    title: String!
    content: String!
    status: DoubtStatus!
    createdAt: String!
    subject: Subject!
  }

  type Note {
    id: ID!
    title: String!
    fileUrl: String!
    uploadedAt: String!
  }

  type Teacher {
    id: ID!
    user: User!
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    subject: Subject!
    teacher: Teacher!
    sessions: [Session!]!
    notes: [Note!]!
  }

  type StudentProfile {
    id: ID!
    user: User!
    class: ClassRoom!
    attendances: [Attendance!]!
    payments: [Payment!]!
    doubts: [Doubt!]!
  }

  type Query {
    getStudentProfile(id: ID!): StudentProfile
    getStudentSubjects(studentId: ID!): [Subject!]!
    getStudentCoursesBySubject(studentId: ID!, subjectId: ID!): [Course!]!
    getCourseNotes(courseId: ID!): [Note!]!
    getStudentSessions(studentId: ID!): [Session!]!
    getStudentAttendance(studentId: ID!): [Attendance!]!
    getStudentPayments(studentId: ID!): [Payment!]!
    getLiveSessions(studentId: ID!): [Session!]!
  }

  type Mutation {
    askDoubt(studentId: ID!, subjectId: ID!, title: String!, content: String!): Doubt!
    payForPayment(paymentId: ID!): Payment!
  }
`;
