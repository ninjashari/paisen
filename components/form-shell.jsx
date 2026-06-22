import ThemeToggle from "./theme-toggle"
import FormLogo from "./form-logo"

/**
 * Centered, full-height frosted-card shell shared by the auth/token forms.
 * Renders the brand mark, an ambient mesh backdrop, and a floating accent.
 */
const FormShell = ({ children }) => {
  return (
    <main className="bg-mesh relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Floating ambient accent */}
      <div
        aria-hidden="true"
        className="bg-brand animate-float pointer-events-none absolute -top-24 right-[-10%] size-72 rounded-full opacity-20 blur-3xl"
      />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        <FormLogo />
        {children}
      </div>
    </main>
  )
}

export default FormShell
