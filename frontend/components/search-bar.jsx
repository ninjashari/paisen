import MalApi from "@/lib/malApi"
import { getUserAccessToken } from "@/utils/userService"
import { getSession } from "next-auth/react"
import { useState } from "react"

const Searchbar = ({ isLoading }) => {
  const [inputSearchString, setInputSearchString] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    isLoading(true)
    setInputSearchString(e.target.query.value)
    console.log(inputSearchString)
    if (inputSearchString) {
      const session = await getSession()
      if (session) {
        const accessToken = await getUserAccessToken(session)
        if (accessToken) {
          const malApi = new MalApi(accessToken)

          const resp = await malApi.getSearchAnimeList(inputSearchString)
          if (200 === resp.status) {
            isLoading(false)
            console.log(resp)
          } else {
            alert("Couldn't fetch user anime list")
          }
        } else {
          alert("Couldn't get acces token. Please authorise!!")
          router.replace("/authorise")
        }
      } else {
        router.replace("/")
      }
    } else {
      alert("Search string is inappropriate!!")
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
