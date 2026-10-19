// OAuth scopes requested from Google at sign-up and when reconnecting.
// calendar.events:   create meetings / send invites (events.insert)
// calendar.freebusy: booking page busy-time check (freeBusy.query rejects calendar.events alone)
// userinfo.*:        name and email used for the account
export const GOOGLE_SCOPES =
  "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
