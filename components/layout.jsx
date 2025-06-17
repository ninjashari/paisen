/**
 * Layout Component
 * 
 * This component provides the basic HTML structure and meta tags for all pages.
 * It wraps page content and ensures proper styling and viewport settings.
 * 
 * Features:
 * - Head meta tags configuration
 * - Responsive viewport settings
 * - Children content rendering
 */

import Head from "next/head"

const Layout = ({ titleName, children }) => {
  return (
    <>
      <Head>
        <title>{titleName || "Paisen - MyAnimeList & Jellyfin Integration"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Sync your MyAnimeList with Jellyfin media server" />
      </Head>
      {children}
    </>
  )
}

export default Layout
