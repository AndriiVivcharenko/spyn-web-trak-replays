import VideoPlayer from "./VideoPlayer"
import Countdown from "./Countdown"
import TrainerCamera from "./TrainerCamera"
import {Body} from "./styles"
import React from "react";

export const TrakReplayPageBody = ({event}) => {

  return (<Body style={{
    visibility: event && event.event_type?.includes("video") ? "visible" : "hidden",
    maxHeight: event && event.event_type?.includes("video") ? null : "1px",
    padding: event && event.event_type?.includes("video") ? "48px 48px" : "0"
  }}>
    <div className={"row"} style={{
      justifyContent: "center",
      gap: 24,
    }}>
      <VideoPlayer/>
      <div className={"column"} style={{
        position: "relative"
      }}>
        {event && event.event_type?.includes("video") ? <Countdown/> :
          null}
        <TrainerCamera visible={event && event.event_type?.includes("video")}/>
      </div>

    </div>

  </Body>)
}
