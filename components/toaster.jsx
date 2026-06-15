import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = () => {
  const { resolvedTheme } = useTheme()
  return <Sonner theme={resolvedTheme} richColors position="top-center" />
}

export default Toaster
