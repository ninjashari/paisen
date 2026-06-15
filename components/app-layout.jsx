import { useState } from "react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import Breadcrumb from "./breadcrumb"
import Header from "./header"
import Layout from "./layout"
import Logo from "./logo"
import Sidebar, { SidebarNav } from "./sidebar"

/**
 * Application shell: fixed sidebar (desktop) + drawer (mobile), sticky header,
 * and a centered content area. Pages render their content as children.
 *
 * Props:
 * - title: page <title>
 * - breadcrumb: { title, firstPage?, secondPage? }
 * - search: { isLoading, malAccessToken, setSearchData } to show header search
 */
const AppLayout = ({ title, breadcrumb, search = {}, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Layout titleName={title}>
      <div className="bg-background min-h-screen">
        <Sidebar />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="bg-sidebar w-72 p-0">
            <SheetHeader className="h-16 justify-center border-b">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Logo onClick={() => setMobileOpen(false)} />
            </SheetHeader>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="lg:pl-64">
          <Header onMenuClick={() => setMobileOpen(true)} {...search} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
            {breadcrumb && <Breadcrumb {...breadcrumb} />}
            {children}
          </main>
        </div>
      </div>
    </Layout>
  )
}

export default AppLayout
