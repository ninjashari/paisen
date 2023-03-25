import Link from "next/link"

export default function ErrorPage() {
  return (
    <div className="container">
      <section className="section error-404 min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <h1>404</h1>
        <h2>The page you are looking for doesn't exist.</h2>
        <Link className="btn" href="/">
          Back to home
        </Link>
        <img
          src="/assets/img/not-found.svg"
          className="img-fluid"
          alt="Page Not Found"
        />
      </section>
    </div>
  )
}
