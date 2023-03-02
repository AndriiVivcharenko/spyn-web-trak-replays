import {Column, Time, Subtitle} from "./styles"
import React, {useEffect, useState} from "react"
import Title from "./Title"
import {useContext} from "react"
import {ReplayLogsControllerContext} from "../../ReplayLogsControllerProvider"
import {TimerStage} from "../../types"
import { useTheme } from "styled-components"
import { formatMilliseconds } from "../../../utils/replays"

const emptyBeeps = {
  "1": false,
  "2": false,
  "3": false
}

let timerEnabled = true

const Countdown = () => {

  const themeMode = useTheme();

  const [playedBeeps, setPlayedBeeps] = useState(emptyBeeps)

  const [leftTime, setLeftTime] = useState<number>(0)
  const [stateInterval, setStateInterval] = useState<any>()
  const [lastPlayingStartedAt, setLastPlayingStartedAt] = useState()

  const {
    isPlaying,
    currentResource,
    currentStage,
    remainExercise,
    remainRecovery,
    replayPlaying,
    currentTimer
  } = useContext(ReplayLogsControllerContext)

  const runTimer = () => {
    setLastPlayingStartedAt(currentTimer.startAt)
    setLeftTime(() => (currentTimer.time * 1000) + currentTimer.poseBuffer)
    setStateInterval((prev: any) => {
      clearInterval(prev)
      return setInterval(() => {
        if(!timerEnabled) {
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

    if(!currentTimer) {
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

  return (<Column>
    <Title border={`${currentStage !== TimerStage.PREPARING_STAGE ?
      // [3, 2, 1].includes(leftTime ? Math.round(leftTime / 1000) : 0) ? palette.RED:
      currentStage === TimerStage.PLAYING_REST ? themeMode.accents.orange2 :
      themeMode.accents.repTime : themeMode.steel.light} solid 2px`}
           reps={currentResource ?
             currentResource.repetitions ? currentResource.repetitions : 10
             : 0}
           stage={currentStage}
           type={currentResource ? currentResource.ondemandLesson?.lessonType : undefined}
     background={currentStage === TimerStage.PLAYING_REST ? themeMode.accents.orange2 : themeMode.accents.accent01}/>

    <Time style={{
      border: `${currentStage !== TimerStage.PREPARING_STAGE ?
        // [3, 2, 1].includes(leftTime ? Math.round(leftTime / 1000) : 0) ? palette.RED:
        currentStage === TimerStage.PLAYING_REST ? themeMode.accents.orange2 :
        themeMode.accents.repTime : themeMode.steel.light} solid 4px`,
    }}>
      {formatMilliseconds(
        currentTimer ? Math.max(0, Math.min(currentTimer.time * 1000, leftTime ? leftTime : 0)) :
          Math.max(0, leftTime ? leftTime : 0)
      )}
    </Time>

    <Subtitle>
      Recorded
    </Subtitle>

    {/*</Body>*/}
  </Column>)
}

export default Countdown
