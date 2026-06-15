import FormLogo from "./form-logo"

/**
 * Centered, full-height shell used by the auth/token forms.
 */
const FormShell = ({ children }) => {
  return (
    <main className="bg-aurora flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <FormLogo />
        {children}
      </div>
    </main>
  )
}

export default FormShell
