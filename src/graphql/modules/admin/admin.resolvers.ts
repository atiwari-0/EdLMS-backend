import type { GraphQLContext } from "../../../types/context";
import bcrypt from 'bcrypt';

const generateCredentials = (name: string, role: "STUDENT" | "TEACHER") => {
  const formattedName = name.trim().toLowerCase().replace(/\s+/g, '');
  const email = `${formattedName}@edlms.com`;
  const password = `${role.toLowerCase()}.${formattedName}`;
  return { email, password };
};

export const adminResolvers = {
  Mutation: {
    createStudent: async (
      _: unknown,
      { input }: any,
      { prisma, user }: GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");

      const { name, classId } = input;
      const { email, password } = generateCredentials(name, "STUDENT");
      const hashed = await bcrypt.hash(password,10);

      const createdUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: "STUDENT",
          studentProfile: {
            create: {
              classId,
            },
          },
        },
        include: {
          studentProfile: true,
        },
      });
      if (!createdUser.studentProfile) {
        throw new Error("Student profile creation failed");
      }
      return prisma.studentProfile.findUnique({
        where: { id: createdUser.studentProfile.id },
        include: { user: true, class: true },
      });

    },

    createTeacher: async (
      _: unknown,
      { input }: any,
      { prisma, user }: GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");

      const { name, subjectId, classIds } = input;
      const { email, password } = generateCredentials(name, "TEACHER");
      const hashed = await bcrypt.hash(password,10);

      const createdUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: "TEACHER",
          teacherProfile: {
            create: {
              subjectId,
              classes: {
                connect: classIds.map((id: string) => ({ id })),
              },
            },
          },
        },
        include: {
          teacherProfile: true,
        },
      });
      if (!createdUser.teacherProfile) {
        throw new Error("Teacher profile creation failed");
      }
      return prisma.teacherProfile.findUnique({
        where: { id: createdUser.teacherProfile.id },
        include: { user: true, subject: true, classes: true },
      });
    },

    createClassRoom: async (
      _: unknown,
      { input }: any,
      { prisma, user }: GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");

      return await prisma.classRoom.create({
        data: {
          name: input.name,
        },
      });
    },

    createSubject: async (
      _: unknown,
      { input }: any,
      { prisma, user }: GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");

      return await prisma.subject.create({
        data: {
          name: input.name,
        },
      });
    },
  },
  Query: {
    students: async (_: any, __: any, { prisma }: GraphQLContext) => {
      return prisma.studentProfile.findMany({
        include: {
          user: true,
          class: true,
        },
      });
    },
    teachers: async (_: any, __: any, { prisma }: GraphQLContext) => {
      return prisma.teacherProfile.findMany({
        include: {
          user: true,
          subject: true,
          classes: true,
        },
      });
    },
    subjects: async (_: any, __: any, { prisma }: GraphQLContext) => {
      return prisma.subject.findMany();
    },
    classes: async (_: any, __: any, { prisma }: GraphQLContext) => {
      return prisma.classRoom.findMany();
    },
  },

};
