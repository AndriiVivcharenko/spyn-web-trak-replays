import {Body, ContainerTitle2} from "./styles"
import {LessonType, TimerStage} from "../../../types"
import React from "react"

const Title = ({stage, reps, type, border, background}: {
  stage: TimerStage
  reps: number
  type: LessonType
  border: string
  background: string
}) => {
  function getElement() {
    return <>
      {stage === TimerStage.PREPARING_STAGE ? "Starting Soon" : null}
      {stage === TimerStage.PLAYING_EXERCISE ?
        `${type === LessonType.pose ? "Hold" :
          type === LessonType.freestyle ? "FreeStyle" :
            type === LessonType.repetition ? `${reps} Reps` : ""}` : null}
      {stage === TimerStage.PLAYING_REST ? "Recover" : null}
      {stage === TimerStage.DONE ? "Done" : null}
    </>
  }

  return (<Body style={{
    background: background,
    border: border
  }}>
    <ContainerTitle2 style={{
      color: "black"
    }}>{getElement()}</ContainerTitle2>
  </Body>)
}

export default Title
