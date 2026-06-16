import Logo from "./logo"

/**
 * Centered brand mark used at the top of the auth-card shell.
 */
const FormLogo = () => {
  return (
    <div className="mb-7 flex justify-center">
      <Logo className="text-2xl [&_span:first-child]:size-11 [&_svg]:size-6" />
    </div>
  )
}

export default FormLogo
