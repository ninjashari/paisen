import { findUser } from "@/lib/dbUtil"
import { isPasswordValid } from "@/utils/hash"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import User from "@/models/User"
import dbConnect from "@/lib/dbConnect"

export const authOptions = {
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null
          }

          const user = await findUser(credentials.username)

          // Check if user exists
          if (!user) {
            return null
          }

          //Validate password
          const isPasswordMatch = await isPasswordValid(
            credentials.password,
            user.password
          )

          if (!isPasswordMatch) {
            return null
          }
          return {
            name: user.name,
            username: user.username,
          }
        } catch (err) {
          // A thrown error here (e.g. the database is unreachable) would
          // otherwise be silently reported as "invalid credentials". Log the
          // real cause and surface a distinct message to the client.
          console.error("[next-auth] authorize() failed:", err)
          throw new Error(
            "Authentication service unavailable. Please try again later."
          )
        }
      },
    }),
  ],

  secret: process.env.SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user
      }
      if (token.user?.username) {
        await dbConnect()
        const dbUser = await User.findOne({ username: token.user.username })
        if (dbUser && dbUser.accessToken) {
          token.malAccessToken = dbUser.accessToken
        }
      }
      return token
    },
    session: async ({ session, token }) => {
      session.user = token.user
      session.malAccessToken = token.malAccessToken
      return session
    },
  },
}

export default NextAuth(authOptions)
