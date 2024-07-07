import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

export const authConfig = {

    //This means that when NextAuth.js redirects to the sign-in page when trying to access the protected api, it will use the route specified in signIn.
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // NextAuth Middleware gets called for every endpoint
    authorized({auth, request: {nextUrl}}){
        const isLoggedIn = !! auth?.user //!!: a double negation operator. It converts a truthy or falsy value to a boolean

        const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
        if(isOnDashboard){
            if(isLoggedIn) return true;
            return false;
        }
        else if(isLoggedIn){
            return Response.redirect(new URL('/dashboard', nextUrl))
        }
        return true;

    },
  },
  providers: []
} satisfies NextAuthConfig;