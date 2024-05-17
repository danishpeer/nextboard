import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;

// This exports a config object which can be used for routing middleware in Next.js. 
//The matcher property specifies a regex pattern to match routes where authentication should be applied. 
// In this case, it matches all routes except those starting with /api, _next/static, _next/image, and files ending with .png.
 
export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};