import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    token?: string;
    afterLoginRedirect?: string;
  }
}
