import React from "react"
import Link from "next/link"

const Logo = () => {
  return (
    <div className="d-flex align-items-center justify-content-between">
      <Link href="/" className="logo d-flex align-items-center">
        <img src="/assets/img/logo.png" alt="" />
        <span className="d-none d-lg-block">Paisen</span>
      </Link>
      <i className="bi bi-list toggle-sidebar-btn" />
    </div>
  )
}

export default Logo
