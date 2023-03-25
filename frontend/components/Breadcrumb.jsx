import Link from "next/link"
import React from "react"

const Breadcrumb = (props) => {
  return (
    <div className="pagetitle">
      <h1>{props.name}</h1>
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item actibe">
            <Link href="/">{props.name}</Link>
          </li>
        </ol>
      </nav>
    </div>
  )
}

export default Breadcrumb
