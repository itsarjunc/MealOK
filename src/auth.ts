import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcrypt-ts';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = authSchema.safeParse(credentials);
        if (!parsed.success) return null;
        
        const { email, password } = parsed.data;
        
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user || !user.isActive) return null;
        
        const isMatch = await compare(password, user.passwordHash);
        if (!isMatch) return null;
        
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
          householdId: String(user.householdId),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.householdId = user.householdId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.householdId = token.householdId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
