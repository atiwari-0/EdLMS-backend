import type { GraphQLContext } from "../../../types/context";

async function assertStudentAccessByStudentId(prisma: any, user: any, targetStudentId: string) {
  if (!user) throw new Error("Not authenticated");
  if (user.role !== "STUDENT") throw new Error("Not authorized");

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) throw new Error("Student profile not found");

  if (profile.id !== targetStudentId) {
    throw new Error("Forbidden: Cannot access another student's data");
  }
}

export const studentResolvers = {
  Query: {
    getStudentProfile: async (_: any, { id }: { id: string }, { prisma }: GraphQLContext) => {


      return prisma.studentProfile.findUnique({
        where: { userId: id },
        include: {
          user: true,
          class: true,
          attendances: { include: { session: true } },
          payments: true,
          doubts: { include: { subject: true } },
        },
      });
    },

    getStudentSubjects: async (_: any, { studentId }: { studentId: string }, { prisma, user }: GraphQLContext) => {
      await assertStudentAccessByStudentId(prisma, user, studentId);

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
      { prisma, user }: GraphQLContext
    ) => {
      await assertStudentAccessByStudentId(prisma, user, studentId);

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
        where: { subjectId },
        include: {
          subject: true,
          teacher: { include: { user: true } },
          sessions: true
        }
      });
    },

    getCourseNotes: async (_: any, { courseId }: { courseId: string }, { prisma }: GraphQLContext) => {
      return prisma.note.findMany({ where: { courseId } });
    },

    getStudentSessions: async (_: any, { studentId }: { studentId: string }, { prisma, user }: GraphQLContext) => {
      await assertStudentAccessByStudentId(prisma, user, studentId);

      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        select: { classId: true }
      });

      if (!student) throw new Error("Student not found");

      return prisma.session.findMany({
        where: { classId: student.classId },
        include: {
          course: {
            include: {
              subject: true,
              teacher: { include: { user: true } },
              notes: true
            }
          }
        },
        orderBy: { startTime: "asc" }
      });
    },

    getStudentAttendance: async (_: any, { studentId }: { studentId: string }, { prisma, user }: GraphQLContext) => {
      await assertStudentAccessByStudentId(prisma, user, studentId);

      return prisma.attendance.findMany({
        where: { studentId },
        include: { session: true }
      });
    },

    getStudentPayments: async (_: any, { studentId }: { studentId: string }, { prisma, user }: GraphQLContext) => {
      await assertStudentAccessByStudentId(prisma, user, studentId);

      return prisma.payment.findMany({ where: { studentId } });
    },

    getLiveSessions: async (_: any, { studentId }: { studentId: string }, { prisma, user }: GraphQLContext) => {
      await assertStudentAccessByStudentId(prisma, user, studentId);

      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId }
      });

      if (!student) throw new Error("Student not found");

      return prisma.session.findMany({
        where: {
          classId: student.classId,
          isLive: true
        }
      });
    },

    getStudentDoubts: async (_: any, { studentId }: { studentId: string }, { prisma, user }: GraphQLContext) => {
      await assertStudentAccessByStudentId(prisma, user, studentId);

      return prisma.doubt.findMany({
        where: { studentId },
        include: { subject: true },
        orderBy: { createdAt: 'desc' }
      });
    }
  },

  Mutation: {
    askDoubt: async (
      _: any,
      { studentId, subjectId, title, content }: { studentId: string; subjectId: string; title: string; content: string },
      { prisma, user }: GraphQLContext
    ) => {
      await assertStudentAccessByStudentId(prisma, user, studentId);

      return prisma.doubt.create({
        data: {
          studentId,
          subjectId,
          title,
          content,
          status: "OPEN"
        },
        include: { subject: true }
      });
    },

    payForPayment: async (_: any, { paymentId }: { paymentId: string }, { prisma }: GraphQLContext) => {
      return prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidAt: new Date()
        }
      });
    }
  }
};
