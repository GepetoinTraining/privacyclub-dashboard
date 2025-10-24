// This file configures 'iron-session' for managing staff login state.
// It creates an encrypted cookie to store session data.

import { getIronSession, IronSessionData } from "iron-session";
import { cookies } from "next/headers";
import { StaffSession } from "./types";

// Define the shape of the session data
export type SessionData = IronSessionData & {
  staff?: StaffSession;
};

// Configure the session
export const sessionOptions = {
  password: process.env.AUTH_SECRET as string, // Must set in .env.local
  cookieName: "privacyclub_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
};

// Helper function to get the current session from a server component or route
export async function getSession() {
  const session = await getIronSession<SessionData>(
    cookies(),
    sessionOptions
  );
  return session;
}
