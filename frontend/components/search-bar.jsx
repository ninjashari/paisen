import MalApi from "@/lib/malApi"
import { fields } from "@/utils/constants"
import { useRouter } from "next/router"
import { useState } from "react"

const Searchbar = ({ isLoading, malAccessToken, setSearchData }) => {
  const router = useRouter()
  const [inputSearchString, setInputSearchString] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    isLoading(true)
    setInputSearchString(e.target.query.value)

    if (inputSearchString) {
      if (malAccessToken) {
        const malApi = new MalApi(malAccessToken)

        const resp = await malApi.getSearchAnimeList(inputSearchString, fields)
        if (200 === resp.status) {
          let dataList = resp.data.data
          let nameList = []

          dataList.forEach((dataItem) => {
            nameList.push(dataItem.node)
          })
          setSearchData(nameList)
          isLoading(false)
        } else {
          alert("Couldn't fetch user anime list")
        }
      } else {
        alert("Couldn't get acces token. Please authorise!!")
        router.replace("/")
      }
    } else {
      router.replace("/")
    }
  }

  return (
    <div className="search-bar">
      <form
        className="search-form d-flex align-items-center"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="query"
          placeholder="Search"
          title="Enter search keyword"
          onChange={(e) => setInputSearchString(e.target.value)}
          value={inputSearchString}
        />
        <button type="submit" title="Search">
          <i className="bi bi-search"></i>
        </button>
      </form>
    </div>
  )
}

export default Searchbar
