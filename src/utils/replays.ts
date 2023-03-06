import {OndemandResource, Timer} from "../models"
import {LessonType} from "../replay/types";

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


    if (video && timer.totalTime &&
        video instanceof HTMLVideoElement && !isNaN(video.duration) && video.duration &&
        (exerciseConfig?.type === LessonType.freestyle))  {
      console.log("timer: ", timer)
      console.log("video duration: ", video.duration)
      console.log("exercise duration: ", exerciseConfig.exerciseDuration)
      const newTime = (timer.totalTime - timer.time) % video.duration;
      console.log("NEW TIME: ", newTime);
      if(Math.abs(newTime - video.currentTime) > 0.67) {
        video.currentTime = (timer.totalTime - timer.time) % video.duration
      }
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

