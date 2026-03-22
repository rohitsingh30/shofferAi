import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { track } from '@/lib/telemetry';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  events: {
    async signIn({ user, account }) {
      track({ event: 'user_login', category: 'auth', userId: user.id, metadata: { provider: account?.provider || 'credentials' } });
    },
    // Google OAuth bypasses register/route.ts, so Profile isn't created.
    // Ensure every new OAuth user gets an empty Profile (matching credentials flow).
    async createUser({ user }) {
      if (user.id) {
        await prisma.profile.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        });
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.id = user.id;
      } else if (account?.providerAccountId) {
        // Fallback: Auth.js beta may not pass user on re-auth.
        // Resolve the correct userId from the linked OAuth account
        // to prevent stale JWT keeping the previous user's identity.
        const linked = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          select: { userId: true },
        });
        if (linked) {
          console.warn('[auth] jwt: user.id missing on sign-in — resolved from linked account userId=%s', linked.userId);
          token.id = linked.userId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
