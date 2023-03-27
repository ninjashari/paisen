import Progressbar from "./progress-bar"
import ScoreSelect from "./score-select"
import SquareIcon from "./square-icon"

const Table = () => {
  return (
    <div className="card">
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">Anime Title</th>
              <th scope="col">Progress</th>
              <th scope="col">Score</th>
              <th scope="col">Type</th>
              <th scope="col">Season</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                <SquareIcon squareColor="blue" />
              </th>
              <td>Blue Lock</td>
              <td>
                <div className="row">
                  <div className="col-2">
                    <button type="button" className="btn btn-sm">
                      <i className="bi bi-dash"></i>
                    </button>
                  </div>
                  <div className="col">
                    <Progressbar fillPercentage="25%" />
                  </div>
                  <div className="col-2">
                    <button type="button" className="btn btn-sm">
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <ScoreSelect />
              </td>
              <td>TV</td>
              <td>Winter 2023</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
