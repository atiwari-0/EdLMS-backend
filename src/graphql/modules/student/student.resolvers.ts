import type { GraphQLContext } from "../../../types/context";

export const studentResolvers = {
  Query: {
    getStudentProfile: async (_: any, { id }: { id: string }, { prisma }: GraphQLContext) => {
      return prisma.studentProfile.findUnique({
        where: { id },
        include: {
          user: true,
          class: true,
          attendances: { include: { session: true } },
          payments: true,
          doubts: { include: { subject: true } },
        },
      });
    },

    getStudentCourses: async (_: any, { studentId }: { studentId: string }, { prisma }: GraphQLContext) => {
      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: { class: true },
      });
      if (!student) throw new Error("Student not found");

      return prisma.course.findMany({
        where: {
          sessions: {
            some: { classId: student.classId },
          },
        },
        include: {
          subject: true,
          sessions: true,
          notes: true,
        },
      });
    },

    getStudentCourseNotes: async (_: any, { courseId }: { courseId: string }, { prisma }: GraphQLContext) => {
      return prisma.note.findMany({ where: { courseId } });
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
