import React from "react"

function Authorize() {
  return (
    <div className="container" style={{ marginTop: "10rem" }}>
      <div className="row align-items-start">
        <div className="col"></div>
        <div className="col-4">
          <form>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="floatingInput"
                placeholder="Username"
                aria-describedby="usernameHelp"
              />
              <label for="floatingInput">Username</label>
              <div
                id="usernameHelp"
                className="form-text text-color-white"
                style={{ color: "white" }}
              >
                Please enter username, not the email address.
              </div>
            </div>
            <button
              className="w-100 btn btn-lg btn-secondary mb-3"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
        <div className="col"></div>
      </div>
    </div>
  )
}

export default Authorize
