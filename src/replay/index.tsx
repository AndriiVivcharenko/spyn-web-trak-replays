import ReplayLogsProvider from "./ReplayLogsProvider"
import ReplayLogsControllerProvider from "./ReplayLogsControllerProvider"
import ReplayLogsPlaylistProvider from "./ReplayLogsPlaylistProvider"
import React from "react"
import {ReplayModel} from "../models/ReplayModel";
import {FirebaseStorage} from "@firebase/storage";

const TrakReplayPlayer = (props: {
  replay: ReplayModel,
  children: any,
  buildProgress: (progress: number) => any,
  storage: FirebaseStorage
}) => {
  return (<ReplayLogsProvider replay={props.replay}>
    <ReplayLogsPlaylistProvider buildProgress={props.buildProgress} storage={props.storage}>
      <ReplayLogsControllerProvider>
        {props.children}
      </ReplayLogsControllerProvider>
    </ReplayLogsPlaylistProvider>
  </ReplayLogsProvider>)
}

export default TrakReplayPlayer;
