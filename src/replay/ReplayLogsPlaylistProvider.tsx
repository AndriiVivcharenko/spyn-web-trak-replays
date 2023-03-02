import {createContext, useContext, useEffect, useState} from "react"
import {ReplayLogsContext} from "./ReplayLogsProvider"
import Hls from "hls.js"
import React from "react"

export interface MusicPlaylist {
  resource: number,
  url: string,
  hls: Hls
}

export const ReplayLogsPlaylistContext = createContext<{
  playlistUrl?: string,
  musicPlaylists?: MusicPlaylist[]
}>({
  musicPlaylists: undefined,
  playlistUrl: undefined
})

interface Progress {
  current: number,
  total: number
}
export type GetVideoPlayerListConfig = {
  eventUid: string,
  resource: string,
  musicResources: number[],
  success: (videoUrl: string, musicUrls: MusicPlaylist[]) => void,
  error?: (e: any) => void,
  progress: (progress: {
    current: number,
    total: number
  }) => void
}
export type GetVideoPlaylist = (config: GetVideoPlayerListConfig) => Promise<void>



const ReplayLogsPlaylistProvider = ({children, buildProgress, getVideoPlaylist}: {
  children: any,
  buildProgress: (progress: number) => any,
  getVideoPlaylist: GetVideoPlaylist
}) => {

  const {entry} = useContext(ReplayLogsContext)

  const [playlistUrl, setPlaylistUrl] = useState<string>()
  const [musicPlaylists, setMusicPlaylists] = useState<MusicPlaylist[]>()

  const [progress, setProgress] = useState<Progress>({
    current: 0,
    total: 1
  })

  useEffect(() => {
    console.log("Entry ", entry)
    if (entry) {
      getVideoPlaylist({
        eventUid: entry.event_id,
        resource: entry.resource,
        musicResources: entry.logs
          .filter((e) => e.currentMusic)
          .map((e) => e.currentMusic!.timestamp)
          .filter((value, index, array) => array.indexOf(value) === index),
        success: (videoUrl, musicUrls) => {
          setPlaylistUrl(videoUrl)
          setMusicPlaylists(musicUrls)
        },
        error: (err) => {
          console.error(err)
        },
        progress: (e: Progress) => {
          setProgress(e)
        }
      }).catch((err) => {
        console.error(err)
      })
    }
  }, [entry])

  useEffect(() => {
    console.log("Playlist url: ", playlistUrl)
    console.log("Music playlists: ", musicPlaylists)
  }, [playlistUrl, musicPlaylists])


  return (<ReplayLogsPlaylistContext.Provider value={{playlistUrl, musicPlaylists}}>
    {playlistUrl && musicPlaylists ? children : buildProgress(Math.round((progress.current / progress.total) * 100))}
  </ReplayLogsPlaylistContext.Provider>)
}

export default ReplayLogsPlaylistProvider

