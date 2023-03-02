import {useContext, useEffect, useRef, useState} from "react"
import {Body} from "./styles"
import {parseLessonType, TimerStage} from "../../types"
import React from "react"
import {getExerciseDuration, getExerciseFlip, onTimerVideoUpdate} from "../../../utils/replays";
import {ReplayLogsControllerContext} from "../../ReplayLogsControllerProvider";

const VideoPlayer = () => {
  const {
    isPlaying,
    currentResource,
    nextResource,
    currentStage,
    replayPlaying,
    currentTimer,
  } = useContext(ReplayLogsControllerContext)

  const videoPlayer = useRef<HTMLVideoElement>()
  const [, setVideoTimeout] = useState()

  useEffect(() => {
    if (!videoPlayer.current) {
      return
    }

    if (currentTimer) {
      if (replayPlaying) {
        onTimerVideoUpdate(videoPlayer.current, currentTimer, setVideoTimeout, {
          exerciseDuration: currentResource ? getExerciseDuration(currentResource) : 1,
          type: parseLessonType(currentResource?.ondemandLesson?.lessonType ?? "Repetition")
        })
      } else {
        videoPlayer.current.pause()
      }
    } else {
      if (isPlaying && replayPlaying) {
        videoPlayer.current.play().catch(err => {
          // console.error(err)
        })
      } else {
        videoPlayer.current.pause()
      }
    }
  }, [isPlaying, currentResource, currentTimer, replayPlaying])

  const getCurrentLesson = () => {
    return currentStage === TimerStage.PLAYING_EXERCISE
      ? currentResource?.ondemandLesson
      : nextResource?.ondemandLesson
  }

  return (
    <Body>
      {currentStage !== TimerStage.PREPARING_STAGE &&
      ((currentStage === TimerStage.PLAYING_EXERCISE && currentResource) ||
        (currentStage === TimerStage.PLAYING_REST && nextResource)) ? (
        <video
          autoPlay
          className={getExerciseFlip(getCurrentLesson()) ? "flipped" : ""}
          key={currentTimer ? currentTimer.stage : null}
          loop
          muted
          poster={getCurrentLesson()?.lessonVideoGif}
          // @ts-ignore
          ref={videoPlayer}
          src={getCurrentLesson()?.lessonVideoUrl}
          style={{
            transform: `rotateX: ${getExerciseFlip(getCurrentLesson()) ? "180deg" : "0deg"}`,
          }}
        ></video>
      ) : (
        <div />
      )}
    </Body>
  )
}

export default VideoPlayer
