import Link from "next/link"
import { ChevronRight, House } from "lucide-react"

const Breadcrumb = ({ firstPage, secondPage, title }) => {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        {title}
      </h1>
      <nav className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-sm">
        <Link href="/" className="hover:text-foreground transition-colors">
          <House className="size-4" />
        </Link>
        {firstPage && (
          <>
            <ChevronRight className="size-3.5" />
            <span className={secondPage ? "" : "text-foreground font-medium"}>
              {firstPage}
            </span>
          </>
        )}
        {secondPage && (
          <>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground font-medium">{secondPage}</span>
          </>
        )}
      </nav>
    </div>
  )
}

export default Breadcrumb
