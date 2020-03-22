export interface Urlable {
  url: string
  print: string
}

export interface OgInfo {
  shortname: string
  fullname: string
  address: string
  telefon?: Urlable
  website: Urlable
}

export interface OgInfos {
  [ags: string]: OgInfo
}

export interface OgProperties {
  Name: string
  AGS: string
  hasOG: boolean
  OGname: string | null
  ogAgsIds: string[]
}