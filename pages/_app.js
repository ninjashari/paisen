import "@/css/globals.css"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Inter, Sora } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
})

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div
          className={`${inter.variable} ${display.variable} font-sans min-h-screen bg-background text-foreground antialiased`}
        >
          <Component {...pageProps} />
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}
