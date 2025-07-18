import { generateUniqueEmail } from "../../../lib/emailgenerator";
import type { GraphQLContext } from "../../../types/context";
import bcrypt from 'bcrypt';

const generateCredentials = async (name: string, role: "STUDENT" | "TEACHER" , prisma: GraphQLContext["prisma"] ) => {
  const formattedName = name.trim().toLowerCase().replace(/\s+/g, '');
  const email = await generateUniqueEmail(name,prisma);
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
      const { email, password } = await generateCredentials(name, "STUDENT", prisma);
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
              payments: {
                create: {
                  amount: 373000,
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
                  status: "PENDING",
                },
              },
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

    updateStudent: async (
      _ : unknown,
      { input } : any,
      { prisma, user }:GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");
      const { id, name, classId } = input;

      const student = await prisma.studentProfile.update({
        where: { id },
        data: {
          classId,
          user: name ? { update: { name } } : undefined,
        },
        include: { user: true, class: true },
      });

      return student;
    },

    deleteStudent: async (
      _ : unknown,
      { id } : any,
      { prisma, user } : GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");

      const student = await prisma.studentProfile.delete({
        where: { id },
      });

      await prisma.user.delete({ where: { id: student.userId } });

      return true;
    },


    createTeacher: async (
      _: unknown,
      { input }: any,
      { prisma, user }: GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");

      const { name, subjectId, classIds } = input;
      const { email, password } = await generateCredentials(name, "TEACHER",prisma);
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

    updateTeacher: async (
      _ : unknown,
      { input } : any,
      { prisma, user } : GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");
      const { id, name, subjectId, classIds } = input;

      const teacher = await prisma.teacherProfile.update({
        where: { id },
        data: {
          subjectId,
          classes: classIds ? { set: classIds.map((id : any) => ({ id })) } : undefined,
          user: name ? { update: { name } } : undefined,
        },
        include: { user: true, subject: true, classes: true },
      });

      return teacher;
    },

    deleteTeacher: async (
      _ : unknown,
      { id } : any,
      { prisma, user } : GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");

      const teacher = await prisma.teacherProfile.delete({ where: { id } });
      await prisma.user.delete({ where: { id: teacher.userId } });

      return true;
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

    updateClassRoom: async (
      _ : unknown,
      { input } : any,
      { prisma, user } : GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");
      return prisma.classRoom.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    },

    deleteClassRoom: async (
      _ : unknown,
      { id } : any,
      { prisma, user } : GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");
      await prisma.classRoom.delete({ where: { id } });
      return true;
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

    updateSubject: async (
      _ : unknown,
      { input } : any,
      { prisma, user } : GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");
      return prisma.subject.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    },

    deleteSubject: async (
      _ : unknown,
      { id } : any,
      { prisma, user } : GraphQLContext
    ) => {
      if (user?.role !== "ADMIN") throw new Error("Unauthorized");
      await prisma.subject.delete({ where: { id } });
      return true;
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
