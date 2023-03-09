import {useEffect, useState} from "react"
import {useContext} from "react"
import {ReplayLogsControllerContext} from "../../ReplayLogsControllerProvider"
import {TimerStage} from "../../types"

const emptyBeeps = {
    "1": false,
    "2": false,
    "3": false
}

let timerEnabled = true

const useCountdown = ({playBeeps}: {
    playBeeps: boolean
}): {
    leftTime: number
} => {

    const [playedBeeps, setPlayedBeeps] = useState(emptyBeeps)

    const [leftTime, setLeftTime] = useState<number>(0)
    const [stateInterval, setStateInterval] = useState<any>()
    const [lastPlayingStartedAt, setLastPlayingStartedAt] = useState<number | undefined>()

    const {
        isPlaying,
        currentStage,
        remainExercise,
        remainRecovery,
        replayPlaying,
        currentTimer,
        currentTimestamp
    } = useContext(ReplayLogsControllerContext)

    const runTimer = () => {
        setLastPlayingStartedAt(currentTimer?.startAt)
        setLeftTime(() => ((currentTimer?.time ?? 1) * 1000) + (currentTimer?.poseBuffer ?? 0) - (currentTimer?.isPlaying && currentTimestamp && currentTimer?.startAt ? currentTimestamp - currentTimer!.startAt : 0))
        setStateInterval((prev: any) => {
            clearInterval(prev)
            return setInterval(() => {
                if (!timerEnabled) {
                    return
                }
                setLeftTime((prev) => prev - 100)
            }, 100)
        })
    }


    useEffect(() => {
        if (currentTimer) {
            timerEnabled = replayPlaying
        }
    }, [replayPlaying, currentTimer])

    useEffect(() => {

        if (!currentTimer) {
            return
        }

        if (stateInterval && currentTimer && (!currentTimer.isPlaying)) {
            setStateInterval((prev) => {
                clearInterval(prev)
                return undefined
            })
            if (currentTimer.stage === TimerStage.DONE) {
                setLeftTime(0)
                setPlayedBeeps(emptyBeeps)
            }
        }

        if (stateInterval && currentTimer && currentTimer.startAt !== lastPlayingStartedAt) {
            setStateInterval((prev) => {
                clearInterval(prev)
                return undefined
            })
            setPlayedBeeps(emptyBeeps)
            runTimer()
        }

        if (!stateInterval && currentTimer && !currentTimer.isPlaying && !leftTime) {
            setPlayedBeeps(emptyBeeps)
            setLeftTime(currentTimer.time * 1000)

        }

        if (!stateInterval && currentTimer && currentTimer.isPlaying) {
            runTimer()
        }

        if (!currentTimer) {
            setStateInterval((prev) => {
                clearInterval(prev)
                return undefined
            })
        }

    }, [stateInterval, currentTimer, lastPlayingStartedAt, leftTime])

    useEffect(() => {
        if (currentTimer) {
            return
        }

        if (currentStage === TimerStage.PLAYING_EXERCISE) {
            setLeftTime((remainExercise ?? 1) * 1000)
        } else if (currentStage === TimerStage.PLAYING_REST) {
            setLeftTime((remainRecovery ?? 1) * 1000)
        }


    }, [remainExercise, remainRecovery, currentStage])


    useEffect(() => {
        if (!isPlaying) {
            return
        }
        const time = Math.floor(leftTime / 1000)
        if ((time === 1 && !playedBeeps["1"]) ||
            (time === 2 && !playedBeeps["2"]) ||
            (time === 3 && !playedBeeps["3"])) {
            // TODO: add beeper
            // SingleBeep.play()
            setPlayedBeeps(prevState => {
                const clone = structuredClone(prevState)
                clone[time.toString()] = true
                return clone
            })
        }
    }, [isPlaying, leftTime, playedBeeps])

    return {
        leftTime: leftTime
    }

}

export default useCountdown
