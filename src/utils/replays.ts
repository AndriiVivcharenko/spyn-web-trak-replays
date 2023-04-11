import {OndemandResource, ReplayModel, Timer, TrakReplayEvent} from "../models"
import {LessonType} from "../replay/types";
import {timeoutElapsed} from "../replay/ReplayLogsControllerProvider";

export const syncVideoElementTime = (config: {
    entry: ReplayModel,
    index: number,
    video: HTMLVideoElement,
    event: TrakReplayEvent,
    closestToCurrent: boolean,
    diffTrigger: number,
    elementType: string
}) => {

    const {entry, index} = config;

    let i = -1

    if (config.closestToCurrent) {
        for (let j = index; j > 0; j--) {
            if (entry.logs[j].ondemandEvents.includes(config.event)) {
                i = j
                break
            }
        }
    } else {
        i = entry.logs.findIndex((e) => e.ondemandEvents.includes(config.event))
    }


    console.log("logs: ", entry.logs)

    console.log("Prev: ", entry.logs[i === -1 ? 0 : i]);
    console.log("Curr: ", entry.logs[index])

    const prevTime: number = Date.parse(entry.logs[i === -1 ? 0 : i].currentTimestamp) / 1000
    const currTime = Date.parse(entry.logs[index].currentTimestamp) / 1000

    console.log(`(${currTime} - ${prevTime}) = `, (currTime - prevTime))
    const secondsElapsed = (currTime - prevTime)

    console.log(`${secondsElapsed} + (${timeoutElapsed} / 1000) + 0.25 = `, secondsElapsed + (timeoutElapsed / 1000) + 0.25)

    const newTime = secondsElapsed + (timeoutElapsed / 1000) + 0.25;
    if (Math.abs(config.video.currentTime - newTime) >= config.diffTrigger) {
        console.log("diff trigger", config.diffTrigger);
        console.log(`synchronize ${config.elementType} element`, config.video.currentTime);
        config.video.currentTime = newTime;
    }

}


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
            (exerciseConfig?.type === LessonType.freestyle)) {
            console.log("timer: ", timer)
            console.log("video duration: ", video.duration)
            console.log("exercise duration: ", exerciseConfig.exerciseDuration)
            const newTime = (timer.totalTime - timer.time) % video.duration;
            console.log("NEW TIME: ", newTime);
            if (Math.abs(newTime - video.currentTime) > 0.67) {
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

