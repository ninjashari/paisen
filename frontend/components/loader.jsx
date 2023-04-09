import React from "react"

const Loader = () => {
  return (
    <div className="container">
      <section className="section register d-flex flex-column align-items-center justify-content-center mt-10r">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Loader
