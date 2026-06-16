import Layout from "./layout"
import TopNav from "./top-nav"

/**
 * Authenticated app shell: glass top-nav + ambient mesh + centered content.
 *
 * Props:
 * - title: <title> + page heading
 * - subtitle: optional muted line under the heading
 * - actions: optional node rendered on the right of the heading row
 * - children: page content
 */
const AppShell = ({ title, subtitle, actions, children }) => {
  return (
    <Layout titleName={title}>
      <div className="relative min-h-screen">
        {/* ambient backdrop */}
        <div className="bg-mesh pointer-events-none fixed inset-0 -z-10 opacity-60" />
        <TopNav />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
          {(title || actions) && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                {title && (
                  <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </Layout>
  )
}

export default AppShell
