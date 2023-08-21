import { TRPCError } from "@trpc/server";
import {
  type ContextTRPC,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { google } from "googleapis";
import { env } from "~/env.mjs";
import { getTodayMidnight, getTomorrowMidnight } from "../helpers/date";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.NEXTAUTH_URL
);

/**
 * @returns the user refreshToken used to make oauth calls to google api
 */
const getUserRefreshToken = async (ctx: ContextTRPC) => {
  if (!ctx.session) {
    throw new TRPCError({
      message: "User not logged in.",
      code: "UNAUTHORIZED",
    });
  }

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

  const { refresh_token: refreshToken } = accounts.accounts[0];

  return refreshToken;
};

/**
 * if the refresh_token has not been set, gets it and sets it
 */
const setUserRefreshToken = async (ctx: ContextTRPC) => {
  if (!oauth2Client.credentials.refresh_token) {
    const refreshToken = await getUserRefreshToken(ctx);

    oauth2Client.setCredentials({ refresh_token: refreshToken });
  }
};

export const googleCalendarRouter = createTRPCRouter({
  getEventsToday: protectedProcedure.query(async ({ ctx }) => {
    await setUserRefreshToken(ctx);

    const calendar = await google.calendar("v3").events.list({
      auth: oauth2Client,
      calendarId: "primary",
      timeMin: getTodayMidnight(),
      timeMax: getTomorrowMidnight(),
    });

    return calendar;
  }),

  getCalendarIds: protectedProcedure.query(async ({ ctx }) => {
    await setUserRefreshToken(ctx);

    const res = await google.calendar("v3").calendarList.list({
      auth: oauth2Client,
    });

    if (res.status != 200) {
      throw new TRPCError({
        message: "Error fetching calendar ids",
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    if (!res.data.items) {
      return [];
    }

    return res.data.items.map((item) => ({
      id: item.id,
      summary: item.summary,
      timeZone: item.timeZone,
      colour: item.colorId,
      primary: item.primary,
      description: item.description,
    }));
  }),
});
