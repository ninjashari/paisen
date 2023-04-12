import { ratingUtil, seriesStatus, seriesType } from "@/utils/constants"
import { camelize } from "@/utils/malService"

class Anime {
  constructor(
    alternativeTitles,
    averageEpisodeDuration,
    endDate,
    genres,
    id,
    mainPicture,
    meanScore,
    mediaType,
    myListStatus,
    totalEpisodes,
    rating,
    source,
    startDate,
    startSeason,
    status,
    synopsis,
    title
  ) {
    this.alternativeTitlesEn = alternativeTitles.en
    this.alternativeTitlesJa = alternativeTitles.ja
    this.alternativeTitlesSynonyms = alternativeTitles.synonyms
    this.averageEpisodeDuration = averageEpisodeDuration
    this.endDate = endDate
    this.genres = genres
    this.image = mainPicture.large
    this.meanScore = meanScore
    this.mediaType = seriesType[mediaType]
    this.id = id
    this.episodesWatched = myListStatus.num_episodes_watched
    this.isRewatching = myListStatus.is_rewatching
    this.userScore = myListStatus.score
    this.watchStartDate = myListStatus.start_date
    this.userStatus = myListStatus.status
    this.totalEpisodes = totalEpisodes
    this.rating = ratingUtil[rating]
    this.source = camelize(source)
    this.startDate = startDate
    this.status = seriesStatus[status]
    if (!startSeason) {
      this.startSeason = "Unknown"
      this.startSeasonYear = ""
    } else {
      this.startSeason = camelize(startSeason.season)
      this.startSeasonYear = startSeason.year
    }

    this.synopsis = synopsis
    this.title = title
  }

  incrementWatchedEpisodes() {
    this.episodesWatched += 1
  }

  decrementWatchedEpisodes() {
    this.episodesWatched -= 1
  }
}

export default Anime
