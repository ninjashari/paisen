import Link from "next/link"

const Breadcrumb = ({ firstPage, secondPage, title }) => {
  return (
    <div className="pagetitle">
      <h1>{title}</h1>
      <nav>
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <Link href="/">
              <i class="bi bi-house-door"></i>
            </Link>
          </li>

          {firstPage && secondPage ? (
            <>
              <li class="breadcrumb-item">{firstPage}</li>
              <li class="breadcrumb-item active">{secondPage}</li>
            </>
          ) : firstPage ? (
            <li class="breadcrumb-item active">{firstPage}</li>
          ) : (
            ""
          )}
        </ol>
      </nav>
    </div>
  )
}

export default Breadcrumb
