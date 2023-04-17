import Link from "next/link"

const Logo = () => {
  return (
    <div className="d-flex align-items-center justify-content-between">
      <Link href="/" className="logo d-flex align-items-center">
        <img src="/img/logo.png" alt="" />
        <span className="d-none d-lg-block">Paisen</span>
      </Link>
      <i className="bi bi-list toggle-sidebar-btn"></i>
    </div>
  )
}

export default Logo
