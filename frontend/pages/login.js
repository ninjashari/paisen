import Layout from "@/components/layout"
import LoginForm from "@/components/login-form"
import Head from "next/head"

function Login() {
  return (
    <>
      <Layout titleName="Login" />
      <LoginForm />
    </>
  )
}

export default Login
