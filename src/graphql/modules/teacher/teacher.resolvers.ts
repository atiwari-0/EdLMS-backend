import type { GraphQLContext } from "../../../types/context";
import { AttendanceStatus, DoubtStatus } from "@prisma/client";

export const teacherResolvers = {
  Query: {
    getTeacherProfile: async (
      _: any,
      { id }: { id: string },
      { prisma }: GraphQLContext
    ) => {
      return prisma.teacherProfile.findUnique({
        where: { userId : id },
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

    getTeacherDoubts: async (
      _: any,
      { teacherId } : { teacherId: string },
      { prisma }: GraphQLContext
    ) => {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: teacherId },
        include: { subject: true },
      });
      if (!teacher) throw new Error("Teacher not found");

      return prisma.doubt.findMany({
        where: {
          subjectId: teacher.subjectId,
        },
        include: {
          subject: true,
          student: true,
        },
      });
    },

    getTeacherCourseNotes: async (
      _: any,
      { courseId }: { courseId: string },
      { prisma }: GraphQLContext
    ) => {
      const course = await prisma.course.findUnique({
        where:{ id : courseId}
      })
      if (!course) throw new Error("Course not Found.")
      return prisma.note.findMany({
        where: {
          courseId,
        },
        orderBy: {
          uploadedAt: 'desc',
        },
      });
    },


    getTeacherCourseSessions: async (
      _: any,
      { courseId }: { courseId: string },
      { prisma }: GraphQLContext
    ) => {
      const course = await prisma.course.findUnique({
        where:{ id : courseId}
      })
      if (!course) throw new Error("Course not Found.")
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
          subject: { connect: { id: subjectId } }, 
          teacher: { connect: { id: teacherId } },
        },
        include: {
          subject: true, 
          sessions: true,
          notes: true,
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

    markAttendance: async (
    _: any,
    { sessionId, studentId, status }: { sessionId: string; studentId: string; status: AttendanceStatus },
    { prisma }: GraphQLContext
  ) => {
    const existing = await prisma.attendance.findFirst({
      where: { sessionId, studentId },
    });

    if (existing) {
      return prisma.attendance.update({
        where: { id: existing.id },
        data: { status },
        include: {
          session: true,
          student: { include: { user: true } },
        },
      });
    }

    return prisma.attendance.create({
      data: {
        sessionId,
        studentId,
        status,
      },
      include: {
        session: true,
        student: { include: { user: true } },
      },
    });
  },

  respondToDoubt: async (
    _: any,
    { doubtId, status }: { doubtId: string; status: DoubtStatus },
    { prisma }: GraphQLContext
  ) => {
    return prisma.doubt.update({
      where: { id: doubtId },
      data: { status },
      include: {
        subject: true,
        student: { include: { user: true } },
      },
    });
  },

  },
};
