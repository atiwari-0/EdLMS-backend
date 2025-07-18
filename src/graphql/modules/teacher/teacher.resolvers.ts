import type { GraphQLContext } from "../../../types/context";

export const teacherResolvers = {
  Query: {
    getTeacherProfile: async (
      _: any,
      { id }: { id: string },
      { prisma }: GraphQLContext
    ) => {
      return prisma.teacherProfile.findUnique({
        where: { id },
        include: {
          user: true,
          subject: true,
          classes: true,
          courses: {
            include: {
              subject: true,
              sessions: true,
              notes: true,
            },
          },
        },
      });
    },

    getTeacherCourses: async (
      _: any,
      { teacherId }: { teacherId: string },
      { prisma }: GraphQLContext
    ) => {
      return prisma.course.findMany({
        where: { teacherId },
        include: {
          subject: true,
          sessions: true,
          notes: true,
        },
      });
    },

    getCourseSessions: async (
      _: any,
      { courseId }: { courseId: string },
      { prisma }: GraphQLContext
    ) => {
      return prisma.session.findMany({
        where: { courseId },
      });
    },
  },

  Mutation: {
    createCourse: async (
      _: any,
      {
        title,
        description,
        subjectId,
        teacherId,
      }: {
        title: string;
        description: string;
        subjectId: string;
        teacherId: string;
      },
      { prisma }: GraphQLContext
    ) => {
      return prisma.course.create({
        data: {
          title,
          description,
          subjectId,
          teacherId,
        },
      });
    },

    uploadNote: async (
      _: any,
      {
        courseId,
        title,
        fileUrl,
      }: { courseId: string; title: string; fileUrl: string },
      { prisma }: GraphQLContext
    ) => {
      return prisma.note.create({
        data: {
          courseId,
          title,
          fileUrl,
        },
      });
    },

    scheduleSession: async (
      _: any,
      {
        courseId,
        classId,
        title,
        startTime,
        endTime,
        link,
      }: {
        courseId: string;
        classId: string;
        title: string;
        startTime: string;
        endTime: string;
        link: string;
      },
      { prisma }: GraphQLContext
    ) => {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) throw new Error("Course not found");

      return prisma.session.create({
        data: {
          title,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          link,
          isLive: false,
          courseId,
          classId,
        },
      });
    },
  },
};
