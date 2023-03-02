import {useContext, useEffect, useState} from "react"
import {parseLessonType, TimerStage} from "../../types"
import {getExerciseDuration, onTimerVideoUpdate} from "../../../utils";
import {ReplayLogsControllerContext} from "../../ReplayLogsControllerProvider";
import {OndemandLesson} from "../../../models";

const useVideoPlayer = (props: {
    videoPlayer: HTMLVideoElement | undefined
}): {
    currentLesson: OndemandLesson | undefined
} => {
    const {
        isPlaying,
        currentResource,
        nextResource,
        currentStage,
        replayPlaying,
        currentTimer,
    } = useContext(ReplayLogsControllerContext)

    const [, setVideoTimeout] = useState()

    useEffect(() => {
        if (!props.videoPlayer) {
            return
        }

        if (currentTimer) {
            if (replayPlaying) {
                onTimerVideoUpdate(props.videoPlayer, currentTimer, setVideoTimeout, {
                    exerciseDuration: currentResource ? getExerciseDuration(currentResource) : 1,
                    type: parseLessonType(currentResource?.ondemandLesson?.lessonType ?? "Repetition")
                })
            } else {
                props.videoPlayer?.pause()
            }
        } else {
            if (isPlaying && replayPlaying) {
                props.videoPlayer.play().catch(err => {
                    // console.error(err)
                })
            } else {
                props.videoPlayer.pause()
            }
        }
    }, [isPlaying, currentResource, currentTimer, replayPlaying])

    const getCurrentLesson = () => {
        return currentStage === TimerStage.PLAYING_EXERCISE
            ? currentResource?.ondemandLesson
            : nextResource?.ondemandLesson
    }

    return {
        currentLesson: getCurrentLesson()
    }
}

export default useVideoPlayer
