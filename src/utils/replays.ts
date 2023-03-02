import {getBlob, getDownloadURL, listAll, ref, StorageReference, uploadString} from "firebase/storage"
import Hls from "hls.js"
import {OndemandResource, Timer} from "../models/ReplayModel"
import {LessonType} from "../replay/types";
import {FirebaseStorage} from "@firebase/storage";
import {MusicPlaylist} from "../replay/ReplayLogsPlaylistProvider";

export const formatMilliseconds = (v) => {
  const seconds = Math.round(v / 1000)

  const minutes = Math.max(0, Math.floor(seconds / 60))

  const secondsRemain = seconds - minutes * 60
  return `${minutes}:${secondsRemain < 10 ? "0" + secondsRemain : secondsRemain}`
}

export const getExerciseFlip = (e) => {

  if (!e) {
    return false
  }

  return e.flipped
}

export const getExerciseDuration = (resource: OndemandResource) => {
  return resource.ondemandLesson?.freeStyleDuration ?? resource.totalExercise ?? 1
}

export const onTimerVideoUpdate = (video, timer: Timer, setVideoTimeout, exerciseConfig?: {
  type?: LessonType
  exerciseDuration: number
}) => {
  if (timer.isPlaying) {
    try {
      video.play().catch((err) => {
        // console.error(err)
      })
    } catch (e) {
      // console.error(e)
    }

    if (video && timer.totalTime && video instanceof HTMLVideoElement && (exerciseConfig?.type === LessonType.freestyle || exerciseConfig?.type === LessonType.repetition))  {
      video.currentTime = (timer.totalTime - timer.time) % exerciseConfig.exerciseDuration
    }

    setVideoTimeout(prev => {
      clearTimeout(prev)
      return setTimeout(() => {
        if (timer.poses.length > 0) {
          video.currentTime = Math.round(timer.poses[0].timestamp / 1000)
          try {
            video.pause()
          } catch (e) {
            // console.error(e)
          }
        }
      }, timer.poseBuffer)
    })
  } else {
    try {
      video.pause()
    } catch (e) {
      console.error(e)
    }
  }

}

export const formatMillisecondsToReadableDate = (v) => {
  const seconds = Math.round(v / 1000)

  const minutes = Math.max(0, Math.floor(seconds / 60))

  const secondsRemain = seconds - minutes * 60
  return `${minutes}:${secondsRemain < 10 ? "0" + secondsRemain : secondsRemain}`
}

const buildPlaylist = async (config: {
  path: string,
  eventUid: string,
  error?: (e: any) => void,
  storage: FirebaseStorage,
  progress: (progress: {
    current: number,
    total: number
  }) => void,
}) => {

  const ls = await listAll(ref(config.storage, config.path)).catch((e) => {
    if (config.error) {
      config.error(e)
    }
    return null
  })

  let compositePlaylist: StorageReference | null = null

  if (ls) {
    ls.items.forEach((e) => {
      if (e.name.includes("updated_public_composite_playlist.m3u8")) {
        compositePlaylist = e
      }
    })
  }

  if (compositePlaylist) {
    return await getDownloadURL(compositePlaylist)
  } else if (ls) {
    const compositeFiles: {
      url: string,
      name: string
    }[] = []

    const compositePromises: Promise<any>[] = []
    for (let i = 0; i < ls.items.length; i++) {
      const e = ls.items[i]
      console.log(e.name)
      if (e.name.includes(`_${config.eventUid}.m3u8`)) {
        compositePlaylist = e
      } else if (e.name.includes(".ts")) {
        compositePromises.push(getDownloadURL(e).then((url) => {
          console.log(url)
          compositeFiles.push({
            url: url,
            name: e.name
          })
          config.progress({
            current: compositeFiles.length,
            total: ls.items.length
          })

        }))
      }
    }

    await Promise.all(compositePromises)

    console.log("Getting public urls for playlist files")
    console.log(compositePlaylist)
    console.log(config)

    if (compositePlaylist != null) {
      console.log("Start playlist update")
      const playlist = await (await getBlob(compositePlaylist)).text()
      const lines = playlist.match(/[^\r\n]+/g)

      const updatedLines: string[] = []

      console.log(`Updating composite playlist from web: ${config.path}`)

      if (lines) {
        lines.forEach((line) => {
          let updatedLine = line
          if (compositeFiles.find((e) => e.name === line)) {
            try {
              const tempFile = compositeFiles[compositeFiles.findIndex((e) => e.name === line)]
              updatedLine = tempFile.url
              console.log(updatedLine)
            } catch (e) {
              console.error(e)
            }
          }
          updatedLines.push(updatedLine)
        })
      }

      const updatedContent = updatedLines.join("\n")
      const updatedContentRef = ref(config.storage, `${config.path}/updated_public_composite_playlist.m3u8`)
      await uploadString(updatedContentRef, updatedContent).catch((e) => {
        if (config.error) {
          config.error(e)
        }
      })
      return await getDownloadURL(updatedContentRef)
    }

    return null
  }
  return null
}

export const getVideoPlaylist = async (config: {
  eventUid: string,
  resource: string,
  musicResources: number[],
  storage: FirebaseStorage,
  success: (videoUrl: string, musicUrls: MusicPlaylist[]) => void,
  error?: (e: any) => void,
  progress: (progress: {
    current: number,
    total: number
  }) => void
}) => {

  console.log(config)

  const path = `traks/recordings/${config.eventUid}/${config.resource}`

  const videoUrl: string | undefined = await buildPlaylist({
    path: path,
    progress: config.progress,
    error: config.error,
    storage: config.storage,
    eventUid: config.eventUid
  }).catch(() => {
    return undefined
  }).then((e) => {
    if (typeof e === "string") {
      return e
    }
    return undefined
  })

  if (!videoUrl) {
    if (config.error) {
      config.error(null)
      return
    }
  }

  if (config.musicResources.length === 0) {
    config.success(videoUrl!, [])
  } else {
    config.success(videoUrl!, (await Promise.all(config.musicResources.map(async (e) => {

      const url = await buildPlaylist({
        path: `${path}/chromeTab/${e}`,
        error: config.error,
        storage: config.storage,
        progress: config.progress,
        eventUid: config.eventUid
      })

      const hls = new Hls({
        autoStartLoad: true,
        appendErrorMaxRetry: 99999,
      })


      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log("MUSIC HLS ERROR ", event, data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // try to recover network error
              console.log("fatal network error encountered, try to recover")
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("fatal media error encountered, try to recover")
              hls.recoverMediaError()
              break
            default:
              // cannot recover
              hls.destroy()
              break
          }
        }
      })

      if (url) {
        hls.loadSource(url)
      }
      hls.once(Hls.Events.MANIFEST_LOADED, () => {
        console.log("HLS MANIFEST LOADED, START SOURCE LOAD ", url)
        hls.startLoad()
      })
      hls.on(Hls.Events.MEDIA_DETACHED, event => {
        console.log("HLS MEDIA DETACHED ", url)
      })
      hls.on(Hls.Events.MEDIA_ATTACHED, event => {
        console.log("HLS MEDIA ATTACHED ", url)
      })

      const playlist: MusicPlaylist = {
        url: url ?? "",
        resource: e,
        hls: hls
      }
      return playlist
    }))).filter((e) => e.url.length > 0))

  }

}

