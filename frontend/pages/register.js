import Layout from "@/components/layout"
import RegisterForm from "@/components/register-form"

function Register() {
  const userForm = {
    name: "",
    username: "",
    password: "",
  }
  return (
    <>
      <Layout titleName="Register" />
      <RegisterForm userForm={userForm} />
    </>
  )
}

export default Register
