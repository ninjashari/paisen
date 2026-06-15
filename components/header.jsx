import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import Logo from "./logo"
import Profilenav from "./profile-nav"
import Searchbar from "./search-bar"
import ThemeToggle from "./theme-toggle"

const Header = ({ onMenuClick, isLoading, malAccessToken, setSearchData }) => {
  const showSearch = typeof setSearchData === "function"

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="lg:hidden">
        <Logo />
      </div>

      {showSearch ? (
        <div className="flex-1">
          <Searchbar
            isLoading={isLoading}
            malAccessToken={malAccessToken}
            setSearchData={setSearchData}
          />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <ThemeToggle />
      <Profilenav />
    </header>
  )
}

export default Header
