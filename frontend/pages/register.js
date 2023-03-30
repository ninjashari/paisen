import RegisterForm from "@/components/register-form"
import Head from "next/head"

function Register() {
  return (
    <>
      <Head>
        <title>Paisen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <RegisterForm />
    </>
  )
}

export default Register
