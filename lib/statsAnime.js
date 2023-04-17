import { seriesStatus, userStatusMap } from "@/utils/constants"
import { camelize } from "@/utils/malService"

class StatsAnime {
  constructor(animeDTO) {
    this.averageEpisodeDuration = animeDTO.average_episode_duration
    this.endDate = animeDTO.end_date
    this.id = animeDTO.id
    if (animeDTO.my_list_status) {
      this.episodesWatched = animeDTO.my_list_status.num_episodes_watched
      this.isRewatching = animeDTO.my_list_status.is_rewatching
      this.userScore = animeDTO.my_list_status.score
      this.watchStartDate = animeDTO.my_list_status.start_date
      this.userStatus = userStatusMap[animeDTO.my_list_status.status]
    } else {
      this.episodesWatched = undefined
      this.isRewatching = undefined
      this.userScore = undefined
      this.watchStartDate = undefined
      this.userStatus = undefined
    }
    this.totalEpisodes = animeDTO.num_episodes
    this.startDate = animeDTO.start_date
    this.status = seriesStatus[animeDTO.status]
    if (!animeDTO.start_season) {
      this.startSeason = "Unknown"
      this.startSeasonYear = ""
    } else {
      this.startSeason = camelize(animeDTO.start_season.season)
      this.startSeasonYear = animeDTO.start_season.year
    }

    this.title = animeDTO.title
  }

  incrementWatchedEpisodes() {
    this.episodesWatched += 1
  }

  decrementWatchedEpisodes() {
    this.episodesWatched -= 1
  }

  setUserStatus(userStatus) {
    if (userStatus) {
      this.userStatus = userStatusMap[userStatus]
    }
  }
}

export default StatsAnime
