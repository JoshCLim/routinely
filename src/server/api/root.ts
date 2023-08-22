import { createTRPCRouter } from "~/server/api/trpc";
import { googleCalendarRouter } from "./routers/googleCalendar";
import { tasksRouter } from "./routers/tasks";
import { taskListsRouter } from "./routers/taskLists";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  googleCalendar: googleCalendarRouter,
  tasks: tasksRouter,
  taskLists: taskListsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
