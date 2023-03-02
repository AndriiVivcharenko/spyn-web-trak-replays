import ReplayLogsProvider from "./replay/ReplayLogsProvider"
import ReplayLogsControllerProvider from "./replay/ReplayLogsControllerProvider"
import ReplayLogsPlaylistProvider, {GetVideoPlaylist} from "./replay/ReplayLogsPlaylistProvider"
import React from "react"
import {ReplayModel} from "./models";

const TrakReplayPlayer = (props: {
    replay: ReplayModel,
    children: any,
    buildProgress: (progress: number) => any,
    musicId: string
    videoId: string
    getVideoPlaylist: GetVideoPlaylist
}) => {
    return (<ReplayLogsProvider replay={props.replay}>
        <ReplayLogsPlaylistProvider buildProgress={props.buildProgress} getVideoPlaylist={props.getVideoPlaylist}>
            <ReplayLogsControllerProvider videoId={props.videoId} musicId={props.musicId}>
                {props.children}
            </ReplayLogsControllerProvider>
        </ReplayLogsPlaylistProvider>
    </ReplayLogsProvider>)
}

export {TrakReplayPlayer};
export {useReplayVideoPlayer, useReplayCountdown, TrainerCamera} from "./replay"
export {
    formatMilliseconds,
    formatMillisecondsToReadableDate,
    onTimerVideoUpdate,
    getExerciseFlip,
    getExerciseDuration
} from "./utils"
export {
    ReplayModel,
    OndemandLesson,
    OndemandResource,
    OndemandState,
    Timer,
    TrakReplayEvent,
    OndemandParticipant,
    TrakType,
    TrakPose,
    AgoraRecording,
    AcquireResponse,
    StartRecordingResponse
} from "./models"
export {
    ReplayLogsPlaylistContext, MusicPlaylist, GetVideoPlaylist, GetVideoPlayerListConfig
} from "./replay/ReplayLogsPlaylistProvider"
export {ReplayLogsContext, ReplayLogsContextType} from "./replay//ReplayLogsProvider"
export {ReplayLogsControllerContext} from "./replay/ReplayLogsControllerProvider"