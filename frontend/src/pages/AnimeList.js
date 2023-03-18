import React from "react"
import { Dropdown, Table } from "react-bootstrap"
import TabLayout from "../components/layout/TabLayout"

function Animelist() {
  const headings = [
    { name: "" },
    { name: "Anime title" },
    { name: "Progress" },
    { name: "Score" },
    { name: "Type" },
    { name: "Season" },
  ]

  const scoreList = []
  for (var i = 1; i < 10; i++) {
    let scoreVal = { value: i }
    scoreList.push(scoreVal)
  }

  const animeList = [
    {
      name: "Blue Lock",
      watchedEpisdoes: 8,
      totalEpisodes: 12,
      score: 10,
      broadcastType: "TV",
      season: "Winter 2023",
      currentStatus: "green",
    },
    {
      name: "Blue Lock",
      watchedEpisdoes: 18,
      totalEpisodes: 20,
      score: 4,
      broadcastType: "TV",
      season: "Winter 2023",
      currentStatus: "red",
    },
    {
      name: "Blue Lock",
      watchedEpisdoes: 7,
      totalEpisodes: 120,
      score: 7,
      broadcastType: "TV",
      season: "Winter 2023",
      currentStatus: "blue",
    },
  ]

  const onScoreSelect = (selectedScore) => {
    console.log(selectedScore)
  }

  return (
    <div className="row align-items-start" style={{ marginTop: "2rem" }}>
      <div className="col"></div>
      <div className="col-12">
        <TabLayout />

        <Table striped bordered hover>
          <thead>
            <tr>
              {headings.map((heading) => (
                <th scope="col">{heading.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {animeList.map((anime) => (
              <tr>
                <th scope="row">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill={anime.currentStatus}
                    className="bi bi-square-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2z" />
                  </svg>
                </th>
                <td>{anime.name}</td>
                <td>
                  <i className="bi bi-dash-square"></i>
                  <div
                    className="progress"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="progress-bar"
                      style={{
                        width: `${
                          (anime.watchedEpisdoes / anime.totalEpisodes) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <i className="bi bi-plus-square"></i>
                  <div>
                    {anime.watchedEpisdoes}/{anime.totalEpisodes}
                  </div>
                </td>
                <td>
                  <Dropdown onSelect={onScoreSelect}>
                    <Dropdown.Toggle variant="primary" id="dropdown-basic">
                      -
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {scoreList.map((score) => (
                        <Dropdown.Item eventKey={score.value}>
                          {score.value}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
                <td>{anime.broadcastType}</td>
                <td>{anime.season}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="col"></div>
    </div>
  )
}

export default Animelist
