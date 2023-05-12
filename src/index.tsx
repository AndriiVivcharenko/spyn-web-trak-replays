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
    getVideoPlaylist: GetVideoPlaylist,
    trim?: boolean
}) => {
    return (<ReplayLogsProvider replay={props.replay}>
        <ReplayLogsPlaylistProvider buildProgress={props.buildProgress} getVideoPlaylist={props.getVideoPlaylist}>
            <ReplayLogsControllerProvider videoId={props.videoId} musicId={props.musicId} trim={props.trim ?? false}>
                {props.children}
            </ReplayLogsControllerProvider>
        </ReplayLogsPlaylistProvider>
    </ReplayLogsProvider>)
}

export {TrakReplayPlayer};
export {useReplayVideoPlayer, useReplayCountdown, TrainerCamera, TrainerCameraController} from "./replay"
export {
    formatMilliseconds,
    formatMillisecondsToReadableDate,
    onTimerVideoUpdate,
    getExerciseFlip,
    getExerciseDuration,
    syncVideoElementTime
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
    StartRecordingResponse,
    MusicSettings,
    SpynSong
} from "./models"
export {
    ReplayLogsPlaylistContext, MusicPlaylist, GetVideoPlaylist, GetVideoPlayerListConfig
} from "./replay/ReplayLogsPlaylistProvider"
export {ReplayLogsContext, ReplayLogsContextType} from "./replay//ReplayLogsProvider"
export {ReplayLogsControllerContext} from "./replay/ReplayLogsControllerProvider"
