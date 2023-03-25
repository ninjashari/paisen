import React from "react"

const Progressbar = (props) => {
  return (
    <div className="progress" style={{ marginTop: "0.4rem" }}>
      <div
        className="progress-bar"
        role="progressbar"
        style={{ width: props.fillPercentage }}
        aria-valuenow="25"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
  )
}

export default Progressbar
