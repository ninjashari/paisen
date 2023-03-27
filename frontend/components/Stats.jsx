import BarChart from "./BarChart"

const Stats = () => {
  return (
    <div className="row">
      <div className="col-10">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Watchlist Statistics</h5>

            {/* Default Accordion */}
            <div className="accordion" id="accordionExample">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                  >
                    Anime List
                  </button>
                </h2>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse show"
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td>Anime count</td>
                          <td>632</td>
                        </tr>
                        <tr>
                          <td>Episode count</td>
                          <td>9254</td>
                        </tr>
                        <tr>
                          <td>Time spent watching</td>
                          <td>148 days 11 hours 38 minutes</td>
                        </tr>
                        <tr>
                          <td>Time to complete</td>
                          <td>21 days 17 hours 18 minutes</td>
                        </tr>
                        <tr>
                          <td>Mean score</td>
                          <td>632</td>
                        </tr>
                        <tr>
                          <td>Score deviation</td>
                          <td>1.07</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingTwo">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo"
                  >
                    Score Distribution
                  </button>
                </h2>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingTwo"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <BarChart />
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingThree">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseThree"
                    aria-expanded="false"
                    aria-controls="collapseThree"
                  >
                    Local Database
                  </button>
                </h2>
                <div
                  id="collapseThree"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingThree"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td>Anime count</td>
                          <td>12831</td>
                        </tr>
                        <tr>
                          <td>Image files</td>
                          <td>10534 (279.6 MiB)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats
