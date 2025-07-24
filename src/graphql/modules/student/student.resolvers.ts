import type { GraphQLContext } from "../../../types/context";

export const studentResolvers = {
  Query: {
    getStudentProfile: async (_: any, { id }: { id: string }, { prisma }: GraphQLContext) => {
      return prisma.studentProfile.findUnique({
        where: { userId : id },
        include: {
          user: true,
          class: true,
          attendances: { include: { session: true } },
          payments: true,
          doubts: { include: { subject: true } },
        },
      });
    },

    getStudentSubjects: async (
      _: any,
      { studentId }: { studentId: string },
      { prisma }: GraphQLContext
    ) => {
      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          class: {
            include: {
              teachers: {
                include: { subject: true },
              },
            },
          },
        },
      });
      if (!student || !student.class) return [];
      const allSubjects = student.class.teachers.map((teacher) => teacher.subject);
      const uniqueSubjects = Array.from(
        new Map(allSubjects.map((subj) => [subj.id, subj])).values()
      );

      return uniqueSubjects;
    },




    getStudentCoursesBySubject: async (
        _: any,
        { studentId, subjectId }: { studentId: string; subjectId: string },
        { prisma }: GraphQLContext
      ) => {
        const student = await prisma.studentProfile.findUnique({
          where: { id: studentId },
          include: {
            class: {
              include: {
                teachers: true
              }
            }
          }
        });

        if (!student) throw new Error("Student not found");

        const isSubjectLinkedToStudent = student.class.teachers.some(
          (teacher) => teacher.subjectId === subjectId
        );

        if (!isSubjectLinkedToStudent) throw new Error("Subject not linked to student's class");

        return prisma.course.findMany({
          where: {
            subjectId: subjectId
          },
          include: {
            subject: true,
            teacher: { include: { user: true } },
            sessions: true
          }
        });
      },


    getCourseNotes: async (_: any, { courseId }: { courseId: string }, { prisma }: GraphQLContext) => {
      return prisma.note.findMany({
        where: { courseId }
      });
    },

    getStudentCourseSessions: async (_: any, { courseId }: { courseId: string }, { prisma }: GraphQLContext) => {
      return prisma.session.findMany({ where: { courseId } });
    },

    getStudentAttendance: async (_: any, { studentId }: { studentId: string }, { prisma }: GraphQLContext) => {
      return prisma.attendance.findMany({
        where: { studentId },
        include: { session: true },
      });
    },

    getStudentPayments: async (_: any, { studentId }: { studentId: string }, { prisma }: GraphQLContext) => {
      return prisma.payment.findMany({ where: { studentId } });
    },

    getLiveSessions: async (_: any, { studentId }: { studentId: string }, { prisma }: GraphQLContext) => {
      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
      });
      if (!student) throw new Error("Student not found");

      return prisma.session.findMany({
        where: {
          classId: student.classId,
          isLive: true,
        },
      });
    },
  },

  Mutation: {
    askDoubt: async (
      _: any,
      { studentId, subjectId, title, content }: { studentId: string; subjectId: string; title: string; content: string },
      { prisma }: GraphQLContext
    ) => {
      return prisma.doubt.create({
        data: {
          studentId,
          subjectId,
          title,
          content,
          status: "OPEN",
        },
        include: {
            subject: true, 
        },
      });
    },

    payForPayment: async (_: any, { paymentId }: { paymentId: string }, { prisma }: GraphQLContext) => {
      return prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });
    },
  },
};
