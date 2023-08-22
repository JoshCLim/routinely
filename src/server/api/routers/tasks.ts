import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getTodayMidnight } from "../helpers/date";
import { z } from "zod";

const getTasksRouter = createTRPCRouter({
  byDate: protectedProcedure
    .input(z.object({ date: z.date().optional() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.task.findMany({
        where: {
          userId: ctx.session.user.id,
          due: input.date ?? getTodayMidnight(),
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  byList: protectedProcedure
    .input(z.object({ listId: z.string().or(z.null()) }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.task.findMany({
        where: {
          userId: ctx.session.user.id,
          listId: input.listId,
        },
        orderBy: {
          due: "asc",
        },
      });
    }),
});

export const tasksRouter = createTRPCRouter({
  getTasks: getTasksRouter,

  addTask: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        listId: z.string().optional(),
        date: z.date().optional(),
        importance: z.number().min(0).max(3).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.task.create({
        data: {
          title: input.title,
          userId: ctx.session.user.id,
          listId: input.listId,
          importance: input.importance,
          description: "",
          due: input.date ?? getTodayMidnight(),
        },
      });
    }),

  markTaskComplete: protectedProcedure
    .input(
      z.object({ taskId: z.number(), complete: z.boolean().default(true) })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.task.update({
        where: {
          id: input.taskId,
          userId: ctx.session.user.id,
        },
        data: {
          complete: input.complete,
        },
      });
    }),

  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.task.delete({
        where: { id: input.taskId, userId: ctx.session.user.id },
      });
    }),

  updateTask: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        taskId: z.number(),
        listId: z.string().or(z.null()).optional(),
        importance: z.number().optional(),
        description: z.string().optional(),
        due: z.date().or(z.null()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.task.update({
        where: { id: input.taskId, userId: ctx.session.user.id },
        data: {
          title: input.title,
          listId: input.listId,
          importance: input.importance,
          description: input.description,
          due: input.due,
        },
      });
    }),
});
