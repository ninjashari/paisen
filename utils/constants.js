export const fields = {
  animeList: [
    "id",
    "title",
    "main_picture",
    "alternative_titles",
    "start_date",
    "end_date",
    "synopsis",
    "mean",
    "popularity",
    "genres",
    "media_type",
    "status",
    "my_list_status",
    "num_episodes",
    "start_season",
    "broadcast",
    "source",
    "average_episode_duration",
    "rating",
    "studios",
    "score",
    "num_watched_episodes",
    "finish_date",
    "tags",
    "updated_at",
  ],
}

export const statisticsFields = {
  animeList: [
    "id",
    "title",
    "start_date",
    "end_date",
    "status",
    "my_list_status",
    "num_episodes",
    "start_season",
    "average_episode_duration",
    "score",
    "num_watched_episodes",
    "finish_date",
  ],
}

export const scoreList = [
  { score: 0, value: "(0) No Score" },
  { score: 1, value: "(1) Appaing" },
  { score: 2, value: "(2) Horrible" },
  { score: 3, value: "(3) Very Bad" },
  { score: 4, value: "(4) Bad" },
  { score: 5, value: "(5) Average" },
  { score: 6, value: "(6) Fine" },
  { score: 7, value: "(7) Good" },
  { score: 8, value: "(8) Very Good" },
  { score: 9, value: "(9) Great" },
  { score: 10, value: "(10) Masterpiece" },
]

export const seriesStatus = {
  currently_airing: {
    value: "Airing",
    color: "green",
  },
  finished_airing: {
    value: "Finished Airing",
    color: "blue",
  },
  not_yet_aired: {
    value: "Not Yet Aired",
    color: "red",
  },
}

export const seriesType = {
  unknown: "Unknown",
  tv: "TV",
  ova: "OVA",
  movie: "Movie",
  special: "Special",
  ona: "ONA",
  music: "Music",
}

export const ratingUtil = {
  g: "G",
  pg: "PG",
  pg_13: "PG13",
  r: "R17",
  "r+": "R17",
  rx: "R18",
}

export const userListStatus = {
  current: { apiValue: "watching", pageTitle: "Currently Watching" },
  completed: { apiValue: "completed", pageTitle: "Completed" },
  dropped: { apiValue: "dropped", pageTitle: "Dropped" },
  onhold: { apiValue: "on_hold", pageTitle: "On Hold" },
  plantowatch: { apiValue: "plan_to_watch", pageTitle: "Plan To Watch" },
}

export const userStatusList = [
  { apiValue: "watching", pageTitle: "Currently Watching" },
  { apiValue: "completed", pageTitle: "Completed" },
  { apiValue: "dropped", pageTitle: "Dropped" },
  { apiValue: "on_hold", pageTitle: "On Hold" },
  { apiValue: "plan_to_watch", pageTitle: "Plan To Watch" },
]

export const userStatusMap = {
  watching: "Currently Watching",
  completed: "Completed",
  dropped: "Dropped",
  on_hold: "On Hold",
  plan_to_watch: "Plan To Watch",
}

export const userStatusReverseMap = {
  "Currently Watching": "watching",
  Completed: "completed",
  Dropped: "dropped",
  "On Hold": "on_hold",
  "Plan To Watch": "plan_to_watch",
}
