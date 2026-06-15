import { Loader2 } from "lucide-react"

const Loader = () => {
  return (
    <div className="flex w-full items-center justify-center py-24">
      <Loader2 className="text-primary size-8 animate-spin" />
    </div>
  )
}

export default Loader
