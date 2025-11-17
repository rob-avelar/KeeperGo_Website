
import { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { goalkeeperProfile: true }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow credentials login
      if (account?.provider === 'credentials') {
        return true
      }

      // Handle Google OAuth
      if (account?.provider === 'google') {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        // If user exists, update their Google account connection
        if (existingUser) {
          // If user has a role, allow login
          if (existingUser.role) {
            return true
          }
          // If no role, they need to complete registration
          return '/auth/complete-registration?email=' + encodeURIComponent(user.email!)
        }

        // New Google user needs to select role
        return '/auth/complete-registration?email=' + encodeURIComponent(user.email!)
      }

      return true
    },
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.role = user.role
      }

      // Fetch fresh user data if needed
      if (token.sub && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub }
        })
        if (dbUser?.role) {
          token.role = dbUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
      }
      return session
    }
  }
}

export const auth = () => getServerSession(authOptions)
