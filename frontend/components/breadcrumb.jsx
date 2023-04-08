import Link from "next/link"

const Breadcrumb = ({ firstPage, secondPage, title }) => {
  return (
    <div className="pagetitle">
      <h1>{title}</h1>
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">
              <i className="bi bi-house-door"></i>
            </Link>
          </li>

          {firstPage && secondPage ? (
            <>
              <li className="breadcrumb-item">{firstPage}</li>
              <li className="breadcrumb-item active">{secondPage}</li>
            </>
          ) : firstPage ? (
            <li className="breadcrumb-item active">{firstPage}</li>
          ) : (
            ""
          )}
        </ol>
      </nav>
    </div>
  )
}

export default Breadcrumb
