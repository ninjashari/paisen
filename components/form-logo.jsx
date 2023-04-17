import Link from "next/link"

const FormLogo = () => {
  return (
    <div className="d-flex justify-content-center py-4">
      <Link href="/" className="logo d-flex align-items-center w-auto">
        <img src="/img/logo.png" alt="" />
        <span className="d-none d-lg-block">Paisen</span>
      </Link>
    </div>
  )
}

export default FormLogo
