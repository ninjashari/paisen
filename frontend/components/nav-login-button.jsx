import { useRouter } from "next/router"

const NavLoginButton = (props) => {
    const router = useRouter()

  const handleClick = (event) => {
    event.preventDefault()

    router.push("/login")
  }
  return (
    <button type="button" className="btn btn-primary" onClick={handleClick}>
      {props.text}
    </button>
  )
}

export default NavLoginButton
