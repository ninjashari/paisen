import React from "react"

const Progressbar = (props) => {
  return (
    <div class="progress">
      <div
        className="progress-bar"
        role="progressbar"
        style={{width: props.fillPercentage}}
        aria-valuenow="25"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
  )
}

export default Progressbar
