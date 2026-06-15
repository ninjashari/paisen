import MalApi from "@/lib/malApi"
import { fields } from "@/utils/constants"
import { Search } from "lucide-react"
import { useRouter } from "next/router"
import { useState } from "react"

import { Input } from "@/components/ui/input"

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
    <form
      className="relative w-full max-w-md"
      onSubmit={handleSubmit}
      role="search"
    >
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="text"
        name="query"
        placeholder="Search anime…"
        title="Enter search keyword"
        onChange={(e) => setInputSearchString(e.target.value)}
        value={inputSearchString}
        className="pl-9"
      />
    </form>
  )
}

export default Searchbar
