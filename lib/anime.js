import {
  ratingUtil,
  seriesStatus,
  seriesType,
  userStatusMap,
} from "@/utils/constants"
import { camelize } from "@/utils/malService"

class Anime {
  constructor(animeDTO) {
    // Essential fields (available in optimized data)
    this.id = animeDTO.id
    this.title = animeDTO.title
    this.genres = animeDTO.genres || []
    this.mediaType = seriesType[animeDTO.media_type] || animeDTO.media_type
    this.status = seriesStatus[animeDTO.status]?.value || animeDTO.status
    this.totalEpisodes = animeDTO.num_episodes || 0
    
    // User list status (essential for user interactions)
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

    // Optional fields (may not be available in optimized data)
    this.alternativeTitlesEn = animeDTO.alternative_titles?.en || []
    this.alternativeTitlesJa = animeDTO.alternative_titles?.ja || []
    this.alternativeTitlesSynonyms = animeDTO.alternative_titles?.synonyms || []
    this.averageEpisodeDuration = animeDTO.average_episode_duration
    this.endDate = animeDTO.end_date
    this.imageUrl = animeDTO?.main_picture?.large
    this.meanScore = animeDTO.mean
    this.rating = ratingUtil[animeDTO.rating]
    this.source = camelize(animeDTO.source)
    this.startDate = animeDTO.start_date
    this.synopsis = animeDTO.synopsis
    
    // Start season handling
    if (!animeDTO.start_season) {
      this.startSeason = "Unknown"
      this.startSeasonYear = ""
    } else {
      this.startSeason = camelize(animeDTO.start_season.season)
      this.startSeasonYear = animeDTO.start_season.year
    }
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

export default Anime
