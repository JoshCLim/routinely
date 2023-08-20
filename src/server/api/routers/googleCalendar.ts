import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { google } from "googleapis";
import { env } from "~/env.mjs";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.NEXTAUTH_URL
);

export const googleCalendarRouter = createTRPCRouter({
  getEvents: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await ctx.prisma.user.findFirst({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        accounts: true,
      },
    });

    if (!accounts || accounts.accounts.length <= 0 || !accounts.accounts[0]) {
      throw new TRPCError({
        message: "no account found for user???",
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    const { refresh_token } = accounts.accounts[0];

    oauth2Client.setCredentials({ refresh_token });

    const calendar = await google.calendar("v3").events.list({
      auth: oauth2Client,
      calendarId: "primary",
    });
    return calendar;
  }),
});
