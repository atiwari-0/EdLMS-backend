export const teacherTypeDefs = `
  enum SessionStatus {
    SCHEDULED
    ONGOING
    COMPLETED
    CANCELLED
  }

  type TeacherProfile {
    id: ID!
    user: User!
    subject: Subject!
    classes: [ClassRoom!]!
    courses: [Course!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  enum Role {
    ADMIN
    TEACHER
    STUDENT
  }

  type Subject {
    id: ID!
    name: String!
  }

  type ClassRoom {
    id: ID!
    name: String!
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    subject: Subject!
    sessions: [Session!]!
    notes: [Note!]!
  }

  type Session {
    id: ID!
    title: String!
    startTime: String!
    endTime: String!
    isLive: Boolean!
    link: String!
    status: SessionStatus!
  }

  enum DoubtStatus {
    OPEN
    RESPONDED
    RESOLVED
  }

  type Doubt {
    id: ID!
    title: String!
    content: String!
    status: DoubtStatus!
    createdAt: String!
    subject: Subject!
    student: StudentProfile!
  }

  enum AttendanceStatus {
    PRESENT
    ABSENT
    LATE
  }

  type Attendance {
    id: ID!
    session: Session!
    student: StudentProfile!
    status: AttendanceStatus!
  }

  type Note {
    id: ID!
    title: String!
    fileUrl: String!
    uploadedAt: String!
  }

type Query {
  getTeacherProfile(id: ID!): TeacherProfile  
  getTeacherCourses(teacherId: ID!): [Course!]!
  getTeacherCourseSessions(courseId: ID!): [Session!]!
  getTeacherDoubts(teacherId: ID!): [Doubt!]!
  getTeacherCourseNotes(courseId: ID!): [Note!]!
}

type Mutation {
  createCourse(title: String!, description: String!, subjectId: ID!, teacherId: ID!): Course!
  uploadNote(courseId: ID!, title: String!, fileUrl: String!): Note!
  scheduleSession(courseId: ID!, classId: ID!, title: String!, startTime: String!, endTime: String!, link: String!): Session!
  markAttendance(sessionId: ID!, studentId: ID!, status: AttendanceStatus!): Attendance!
  respondToDoubt(doubtId: ID!, status: DoubtStatus!): Doubt!
}

`;
