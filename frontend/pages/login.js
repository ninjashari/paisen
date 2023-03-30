import LoginForm from "@/components/login-form"
import Head from "next/head"

function Login() {
  return (
    <>
      <Head>
        <title>Paisen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <LoginForm />
    </>
  )
}

export default Login
