import { findUser } from "@/lib/dbUtil"
import { isPasswordValid } from "@/utils/hash"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

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
      user && (token.user = user)
      return token
    },
    session: async ({ session, token }) => {
      session.user = token.user
      return session
    },
  },
}

export default NextAuth(authOptions)
