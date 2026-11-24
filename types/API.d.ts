declare interface ImageAssetMetadata {
  url: string
  width: number
  height: number
}

declare interface videolistResult {
  items: Item[]
}

declare interface YoutubeVideoInfo{
  id: string
  snippet: Snippet
  contentDetails: ContentDetails
}

declare interface Snippet {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: Thumbnails
  channelTitle: string
  categoryId: string
  liveBroadcastContent: string
  defaultLanguage: string
  defaultAudioLanguage: string
}

declare interface Thumbnails {
  default: ImageAssetMetadata
  medium: ImageAssetMetadata
  high: ImageAssetMetadata
  standard: ImageAssetMetadata
  maxres: ImageAssetMetadata
  qhd: ImageAssetMetadata
}

declare interface ContentDetails {
  duration: string
  dimension: string
  definition: string
  caption: string
  licensedContent: boolean
  contentRating: ContentRating
  projection: string
}

declare interface ContentRating {}
declare interface Channel {
  id: string
  snippet: ChannelSnippet
  statistics: Statistics
}

declare interface ChannelSnippet {
  title: string
  description: string
  customUrl: string
  publishedAt: string
  thumbnails: Avatar
  country: string
}

declare interface Avatar {
  default: ImageAssetMetadata
  medium:  ImageAssetMetadata
  high:    ImageAssetMetadata
}

declare interface Statistics {
  viewCount: string
  subscriberCount: number
  hiddenSubscriberCount: boolean
  videoCount: string
}

type FileType = "video" | "audio"