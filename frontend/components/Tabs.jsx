import React from "react"

const Tabs = () => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Anime List</h5>
        {/* Bordered Tabs Justified */}

        <ul
          className="nav nav-tabs nav-tabs-bordered d-flex"
          id="borderedTabJustified"
          role="tablist"
        >
          <li className="nav-item flex-fill" role="presentation">
            <button
              className="nav-link w-100 active"
              id="current-tab"
              data-bs-toggle="tab"
              data-bs-target="#bordered-justified-current"
              type="button"
              role="tab"
              aria-controls="current"
              aria-selected="true"
            >
              Currently Watching
            </button>
          </li>
          <li className="nav-item flex-fill" role="presentation">
            <button
              className="nav-link w-100"
              id="completed-tab"
              data-bs-toggle="tab"
              data-bs-target="#bordered-justified-completed"
              type="button"
              role="tab"
              aria-controls="completed"
              aria-selected="false"
            >
              Completed
            </button>
          </li>
          <li className="nav-item flex-fill" role="presentation">
            <button
              className="nav-link w-100"
              id="onhold-tab"
              data-bs-toggle="tab"
              data-bs-target="#bordered-justified-onhold"
              type="button"
              role="tab"
              aria-controls="onhold"
              aria-selected="false"
            >
              On Hold
            </button>
          </li>
          <li className="nav-item flex-fill" role="presentation">
            <button
              className="nav-link w-100"
              id="dropped-tab"
              data-bs-toggle="tab"
              data-bs-target="#bordered-justified-dropped"
              type="button"
              role="tab"
              aria-controls="dropped"
              aria-selected="false"
            >
              Dropped
            </button>
          </li>
          <li className="nav-item flex-fill" role="presentation">
            <button
              className="nav-link w-100"
              id="plantowatch-tab"
              data-bs-toggle="tab"
              data-bs-target="#bordered-justified-plantowatch"
              type="button"
              role="tab"
              aria-controls="plantowatch"
              aria-selected="false"
            >
              Plan to Watch
            </button>
          </li>
        </ul>
        <div className="tab-content pt-2" id="borderedTabJustifiedContent">
          <div
            className="tab-pane fade show active"
            id="bordered-justified-current"
            role="tabpanel"
            aria-labelledby="current-tab"
          >
            current-tab
          </div>
          <div
            className="tab-pane fade"
            id="bordered-justified-completed"
            role="tabpanel"
            aria-labelledby="completed-tab"
          >
            completed-tab
          </div>
          <div
            className="tab-pane fade"
            id="bordered-justified-onhold"
            role="tabpanel"
            aria-labelledby="onhold-tab"
          >
            onhold-tab
          </div>
          <div
            className="tab-pane fade"
            id="bordered-justified-dropped"
            role="tabpanel"
            aria-labelledby="dropped-tab"
          >
            dropped-tab
          </div>
          <div
            className="tab-pane fade"
            id="bordered-justified-plantowatch"
            role="tabpanel"
            aria-labelledby="plantowatch-tab"
          >
            plantowatch-tab
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tabs
