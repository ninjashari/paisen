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
        const user = await findUser(credentials.username)

        // Check if user exists
        if (!user) {
          return undefined
        }

        //Validate password
        const isPasswordMatch = await isPasswordValid(
          credentials.password,
          user.password
        )

        if (!isPasswordMatch) {
          return undefined
        }
        return {
          name: user.name,
          username: user.username,
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
