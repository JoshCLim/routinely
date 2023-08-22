import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const getTaskListsRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.taskList.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        title: "asc",
      },
    });
  }),
  byId: protectedProcedure
    .input(z.object({ listId: z.string().or(z.null()) }))
    .query(async ({ ctx, input }) => {
      if (!input.listId) {
        return {
          id: null,
          title: "Unassigned",
          colour: "#aaa",
        };
      }
      return await ctx.prisma.taskList.findFirst({
        where: {
          id: input.listId,
          userId: ctx.session.user.id,
        },
      });
    }),
});

export const taskListsRouter = createTRPCRouter({
  getTaskList: getTaskListsRouter,
  createTaskList: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        colour: z.string().startsWith("#").min(7).max(7),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.taskList.create({
        data: {
          title: input.title,
          userId: ctx.session.user.id,
          colour: input.colour,
        },
      });
    }),
});
