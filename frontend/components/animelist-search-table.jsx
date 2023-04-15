import { useEffect } from "react"

const SearchTable = ({ searchData }) => {
  useEffect(() => {
    console.log("searchData :: ", searchData)
  }, [])
  return (
    <div className="card">
      <div className="card-body">
        <table className="table">
          <thead style={{ textAlign: "center" }}>
            <tr>
              <th scope="col">Anime Title</th>
              {/* <th scope="col">Progress</th>
                  <th scope="col">Score</th>
                  <th scope="col">Type</th>
                  <th scope="col">Season</th> */}
            </tr>
          </thead>
          <tbody>
            {searchData?.map((searchItem) => (
              <tr key={searchItem?.id}>
                <td className="col-3">{searchItem.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SearchTable
