import { camelize } from "@/utils/helper"
import Progressbar from "./progress-bar"
import ScoreSelect from "./score-select"
import SquareIcon from "./square-icon"

const Table = ({ animeList }) => {
  return (
    <div className="card">
      <div className="card-body">
        <table className="table">
          <thead style={{ textAlign: "center" }}>
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
            {animeList?.map((anime) => (
              <tr key={anime.node.id}>
                <th scope="row">
                  {/* <SquareIcon squareColor="blue" /> */}

                  {anime?.node?.status === "finished_airing" ? (
                    <SquareIcon squareColor="blue" />
                  ) : anime?.node?.status === "not_yet_aired" ? (
                    <SquareIcon squareColor="red" />
                  ) : (
                    <SquareIcon squareColor="green" />
                  )}
                </th>
                <td style={{ maxWidth: "2rem" }}>{anime.node.title}</td>
                <td>
                  <div className="row">
                    <div className="col-2">
                      <button type="button" className="btn btn-sm">
                        <i className="bi bi-dash"></i>
                      </button>
                    </div>
                    <div className="col">
                      <Progressbar
                        fillPercentage={
                          Math.ceil(
                            (anime.node.my_list_status.num_episodes_watched /
                              anime.node.num_episodes) *
                              100
                          ).toString() + "%"
                        }
                      />
                    </div>
                    <div className="col-2">
                      <button type="button" className="btn btn-sm">
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>
                </td>
                <td className="col-1">
                  <ScoreSelect selectedVal={anime.node.my_list_status.score} />
                </td>
                <td style={{ textAlign: "center" }}>
                  {anime?.node?.media_type.length < 4
                    ? anime?.node?.media_type.toUpperCase()
                    : camelize(anime?.node?.media_type)}
                </td>
                <td style={{ textAlign: "center" }}>
                  {anime?.node?.start_season?.season +
                  anime?.node?.start_season?.year
                    ? camelize(anime?.node?.start_season?.season) +
                      " " +
                      anime?.node?.start_season?.year
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
