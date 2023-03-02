import React, {useContext, useEffect, useRef, useState} from "react"
import {ReplayLogsPlaylistContext} from "../../ReplayLogsPlaylistProvider"
import Hls from "hls.js"
import {ReplayLogsControllerContext} from "../../ReplayLogsControllerProvider"

const TrainerCamera = ({musicId, videoId}: {
  musicId: string
  videoId: string
}) => {

  const {
    playlistUrl,
    musicPlaylists
  } = useContext(ReplayLogsPlaylistContext)
  const {
    replayPlaying,
    currentMusicResource
  } = useContext(ReplayLogsControllerContext)

  const trainerCameraPlayer = useRef<HTMLVideoElement>()
  const musicPlayer = useRef<HTMLVideoElement>()

  const [hls, setHls] = useState < Hls | undefined > (undefined)
  const [musicHls, setMusicHls] = useState < {
    hls: Hls | undefined,
    id: number | undefined
  } > ({
    hls: undefined,
    id: undefined
  })

  useEffect(() => {
    if(currentMusicResource && (!musicHls.hls || currentMusicResource.timestamp !== musicHls.id) && musicPlaylists) {
      setMusicHls(() => {

        const playlist = musicPlaylists.find((e) => e.resource === currentMusicResource.timestamp)

        if (Hls.isSupported()) {
          if(musicPlayer.current) {
            playlist?.hls.detachMedia()
            playlist?.hls.attachMedia(musicPlayer.current)
          }

          const sync = () => {
            if(musicPlayer.current) {
              musicPlayer.current.play().catch((err) => {
                console.error(err)
              })
            }
          }

          playlist?.hls.once(Hls.Events.ERROR, () => {
            sync()
          })

          playlist?.hls.once(Hls.Events.MEDIA_ATTACHED, event => {
            sync()
          })

        } else if(musicPlayer.current && playlist) {
            musicPlayer.current.src = playlist?.url ?? ""
        }

        return {
          hls: hls,
          id: currentMusicResource.timestamp
        }
      })
    }else if(!currentMusicResource && musicHls.hls) {
      musicHls.hls.detachMedia()
      setMusicHls({
        hls: undefined,
        id: undefined
      })
    }

  }, [currentMusicResource, musicPlaylists])

  useEffect(() => {
    if (!hls && playlistUrl) {
      setHls(() => {
        const hls = new Hls()

        if (Hls.isSupported()) {

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log("video and hls.js are now bound together !")
          })
          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            console.log(
              "manifest loaded, found " + data.levels.length + " quality level"
            )

            if(trainerCameraPlayer.current) {
              trainerCameraPlayer.current.play().catch((err) => {
                // console.error(err)
              })
            }
          })
          hls.on(Hls.Events.MEDIA_DETACHED, event => {
            if(trainerCameraPlayer.current) {
              hls.attachMedia(trainerCameraPlayer.current)
            }
          })

          hls.loadSource(playlistUrl)
          if(trainerCameraPlayer.current) {
            hls.attachMedia(trainerCameraPlayer.current)
          }

        } else if(trainerCameraPlayer.current) {
          trainerCameraPlayer.current.src = playlistUrl
        }

        return hls
      })
    }
  }, [hls, playlistUrl])


  const onCanPlay = () => {
    if (trainerCameraPlayer.current && replayPlaying) {
      try {
        trainerCameraPlayer.current.play().catch((err) => {
          // console.error(err)
        })
      } catch (e) {
        console.error(e)
      }
    } else if (trainerCameraPlayer.current && !replayPlaying) {
      trainerCameraPlayer.current.pause()
    }
  }

  const onMusicCanPlay = () => {
    if(musicPlayer.current && replayPlaying) {
      try {
        musicPlayer.current.play().catch(() => {})
      } catch(e) {
        console.error(e)
      }
    } else if(musicPlayer.current && !replayPlaying) {
      musicPlayer.current.pause()
    }
  }

  useEffect(() => {
    if (!trainerCameraPlayer.current) {
      return
    }
    try {
      if (replayPlaying) {
        trainerCameraPlayer.current.play().catch((err) => {
          // console.error(err)
        })
        musicPlayer.current?.play()?.catch(() => {
          return null
        })
      } else {
        trainerCameraPlayer.current.pause()
        musicPlayer.current?.pause()
      }

    } catch (e) {
      // console.error(e)
    }
  }, [replayPlaying])


  // @ts-ignore
  return (<>
    {playlistUrl ? <video autoPlay={false} data-setup='{}' id={videoId}
      // @ts-ignore
      onCanPlay={onCanPlay} preload="auto" ref={trainerCameraPlayer}>
    </video> : null}
    <video autoPlay={false} data-setup="{}" id={musicId} onCanPlay={onMusicCanPlay} preload="auto"
            // @ts-ignore
           ref={musicPlayer}
          // @ts-ignore
           style={{
      width: 0,
      height: 0
    }}/>

  </>)
}

export default TrainerCamera
