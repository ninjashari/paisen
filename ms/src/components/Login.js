import React, { Component } from "react";

class Login extends Component {
  state = {};
  render() {
    return (
      <div class="row justify-content-center align-items-center g-2">
        <div class="col"></div>
        <div class="col">
          <form>
            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">
                Email address
              </label>
              <input
                type="email"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />
              <div id="emailHelp" class="form-text">
                We'll never share your email with anyone else.
              </div>
            </div>
            <button type="submit" class="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
        <div class="col"></div>
      </div>
    );
  }
}

export default Login;
