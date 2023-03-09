import React, {createContext, useCallback, useContext, useEffect, useState} from "react"
import {ReplayLogsContext, ReplayLogsContextType} from "./ReplayLogsProvider"
import {CallMode, TimerStage} from "./types"
import {AgoraRecording, OndemandParticipant, OndemandResource, OndemandState, Timer, TrakReplayEvent} from "../models"
import {syncVideoElementTime} from "../utils/replays";

interface ReplayState {
    timer: any,
    state: boolean
}

interface ReplayLogsControllerContextType {
    trakStarted: boolean,
    trainerCameraOn: boolean,
    trainerMicOn: boolean,
    isPlaying: boolean,
    callMode: CallMode,
    trainerUid: number | undefined,
    currentParticipants: OndemandParticipant[] | undefined,
    currentResource: OndemandResource | undefined,
    nextResource: OndemandResource | undefined,
    currentMusicResource: AgoraRecording | undefined,
    currentStage: TimerStage,
    seekToLog: any,
    currentLogsIndex: number | undefined,
    replayPlaying: boolean,
    switchReplayState: any,
    remainExercise: number | undefined,
    remainRecovery: number | undefined,
    currentTimer: Timer | undefined,
    lastRecordingIndex: number,
    setReplayPlaying: any,
    logs: OndemandState[],
    takeover: boolean,
    syncTrainerVideo: () => void,
    syncChromeTabMusic: () => void,
    currentTimestamp: number | undefined
}

export const ReplayLogsControllerContext = createContext<ReplayLogsControllerContextType>({
    currentLogsIndex: 0,
    currentParticipants: undefined,
    currentResource: undefined,
    nextResource: undefined,
    remainExercise: undefined,
    remainRecovery: undefined,
    currentMusicResource: undefined,
    trainerUid: undefined,
    trakStarted: false,
    trainerCameraOn: false,
    trainerMicOn: false,
    isPlaying: false,
    logs: [],
    takeover: false,
    callMode: CallMode.broadcast,
    currentStage: TimerStage.PREPARING_STAGE,
    seekToLog: () => {
        return null
    },
    replayPlaying: false,
    switchReplayState: () => {
        return null
    },
    setReplayPlaying: (value: boolean) => {
        return null
    },
    currentTimer: undefined,
    lastRecordingIndex: 0,
    syncChromeTabMusic: () => {
    },
    syncTrainerVideo: () => {
    },
    currentTimestamp: undefined
})

let lastTimeoutStarted = 0
export let timeoutElapsed = 0

const ReplayLogsControllerProvider = ({children, videoId, musicId}: {
    children: any,
    videoId: string,
    musicId: string
}) => {

    const {entry} = useContext<ReplayLogsContextType>(ReplayLogsContext)


    // Logs related
    const [trakStarted, setTrakStarted] = useState<boolean>(false)
    const [trainerCameraOn, setTrainerCameraOn] = useState<boolean>(false)
    const [trainerMicOn, setTrainerMicOn] = useState<boolean>(false)
    const [callMode, setCallMode] = useState<CallMode>(CallMode.broadcast)
    const [trainerUid, setTrainerUid] = useState<number>()
    // const [trainerPrivateMode, setTrainerPrivateMode] = useState<number | undefined>()
    const [isPlaying, setIsPlaying] = useState<boolean>(true)
    const [takeover, setTakeover] = useState<boolean>(false)
    const [currentResource, setCurrentResource] = useState<OndemandResource | undefined>()
    const [remainExercise, setRemainExercise] = useState<number | undefined>()
    const [remainRecovery, setRemainRecovery] = useState<number | undefined>()
    const [currentParticipants, setCurrentParticipants] = useState<OndemandParticipant[] | undefined>([])
    const [currentStage, setCurrentStage] = useState<TimerStage>(TimerStage.PREPARING_STAGE)
    const [currentLogsIndex, setCurrentLogsIndex] = useState<number | undefined>()
    const [currentMusicResource, setCurrentMusicResource] = useState<AgoraRecording | undefined>()
    const [nextResource, setNextResource] = useState<OndemandResource | undefined>()
    const [currentTimer, setCurrentTimer] = useState<Timer | undefined>()
    const [currentTimestamp, setCurrentTimestamp] = useState<number | undefined>()

    // Replay control
    const [replayState, setReplayState] = useState<ReplayState>({
        timer: undefined,
        state: true
    })

    const [replayPlaying, setReplayPlaying] = useState<boolean>(true)
    const [lastRecordingIndex, setLastRecordingIndex] = useState<number>(0)

    const switchReplayState = useCallback(
        () => {
            setReplayPlaying((prev) => !prev)
        },
        [],
    )

    const processLogEntry = (index: number, changeTrainerVideoPos?: boolean) => {
        if (!entry || !replayPlaying) {
            return
        }

        setCurrentLogsIndex(index)

        if (changeTrainerVideoPos) {


            const video: HTMLVideoElement | HTMLElement | null = document.getElementById(videoId)
            if (video instanceof HTMLVideoElement) {
                syncVideoElementTime({
                    video: video,
                    entry: entry,
                    index: index,
                    event: TrakReplayEvent.recordingStarted,
                    closestToCurrent: false
                })
            }

            const music: HTMLVideoElement | HTMLElement | null = document.getElementById(musicId)
            if (music instanceof HTMLVideoElement) {
                syncVideoElementTime({
                    entry: entry,
                    index: index,
                    video: music,
                    event: TrakReplayEvent.chromeTabRecordingStarted,
                    closestToCurrent: true
                })
            }
        }

        const newCurrentResource = entry.logs[index].currentResource

        setTrainerUid(entry.logs[index].trainerUid)
        setCurrentResource(newCurrentResource)
        if(entry.logs[index].currentTimestamp) {
            setCurrentTimestamp(Date.parse(entry.logs[index].currentTimestamp))
        }
        setCurrentMusicResource(entry.logs[index].currentMusic)
        if (index + 1 < entry.logs.length) {

            for (let i = index + 1; i < entry.logs.length; i++) {
                const nextResource = entry.logs[i].currentResource
                if (nextResource &&
                    (entry.logs[i].ondemandEvents.includes(TrakReplayEvent.videoPlay) ||
                        (nextResource.ondemandLesson?.lessonID !== newCurrentResource?.ondemandLesson?.lessonID || (nextResource.ondemandLesson?.lessonID === newCurrentResource?.ondemandLesson?.lessonID &&
                            (nextResource.ondemandLesson?.flipped !== newCurrentResource?.ondemandLesson?.flipped ||
                                nextResource.ondemandLesson?.equipment_note !== newCurrentResource?.ondemandLesson?.equipment_note))))) {
                    setNextResource(nextResource)
                    break
                }
            }

        }
        setCurrentParticipants(entry.logs[index].currentParticipants)

        entry.logs[index].ondemandEvents.forEach((e) => {
            switch (e) {
                case TrakReplayEvent.trakStarted:
                    setTrakStarted(true)
                    break
                case TrakReplayEvent.trainerCameraOn:
                    setTrainerCameraOn(true)
                    break
                case TrakReplayEvent.trainerCameraOff:
                    setTrainerCameraOn(false)
                    break
                case TrakReplayEvent.trainerMicOn:
                    setTrainerMicOn(true)
                    break
                case TrakReplayEvent.trainerMicOff:
                    setTrainerMicOn(false)
                    break
                case TrakReplayEvent.broadcast:
                    setCallMode(CallMode.broadcast)
                    break
                case TrakReplayEvent.group:
                    setCallMode(CallMode.group)
                    break
                case TrakReplayEvent.trainerConnected:
                    setTrainerUid(entry.logs[index].trainerUid)
                    break
                case TrakReplayEvent.trainerDisconnected:
                    setTrainerUid(undefined)
                    break
                case TrakReplayEvent.videoPlay:
                    setCurrentStage(TimerStage.PLAYING_EXERCISE)
                    setIsPlaying(true)
                    break
                case TrakReplayEvent.restPlay:
                    setCurrentStage(TimerStage.PLAYING_REST)
                    setIsPlaying(true)
                    break
                case TrakReplayEvent.videoPause:
                case TrakReplayEvent.restPause:
                    setIsPlaying(false)
                    break
                case TrakReplayEvent.timerUpdated:
                    if (entry.logs[index].timer) {
                        setCurrentTimer(entry.logs[index].timer!)
                        setCurrentStage(entry.logs[index].timer!.stage)
                    }
                    break
                default:
                    break
            }
        })

        for (let i = index; i >= 0; i--) {
            const current = entry.logs[i];
            if (current.ondemandEvents.includes(TrakReplayEvent.trainerTakeover)) {
                setTakeover(true);
                break;
            } else if (current.ondemandEvents.includes(TrakReplayEvent.trainerTakeoverEnd)) {
                setTakeover(false);
                break;
            } else if (i == 0) {
                setTakeover(false);
            }
        }

        if (!entry.logs[index].timer) {
            for (let i = index; i > 0; i--) {
                const log = entry.logs[i]
                if (log.ondemandEvents.includes(TrakReplayEvent.restPlay) ||
                    log.ondemandEvents.includes(TrakReplayEvent.restPause)) {
                    setCurrentStage(TimerStage.PLAYING_REST)
                    break
                } else if (log.ondemandEvents.includes(TrakReplayEvent.videoPlay ||
                    log.ondemandEvents.includes(TrakReplayEvent.videoPause))) {
                    setCurrentStage(TimerStage.PLAYING_EXERCISE)
                    break
                } else if (log.ondemandEvents.includes(TrakReplayEvent.isPreparing)) {
                    setCurrentStage(TimerStage.PREPARING_STAGE)
                    break
                }
            }
        }

        if (newCurrentResource && newCurrentResource.remainExercise) {
            setRemainExercise(newCurrentResource.remainExercise)
        }
        if (newCurrentResource && newCurrentResource.remainRecovery) {
            setRemainRecovery(newCurrentResource.remainRecovery)
        }

        if (newCurrentResource) {
            if (!newCurrentResource.remainRecovery ||
                (newCurrentResource.remainExercise &&
                    newCurrentResource.remainRecovery &&
                    newCurrentResource.remainExercise > newCurrentResource.remainRecovery)) {
                setCurrentStage(TimerStage.PLAYING_EXERCISE)
            } else if (!newCurrentResource.remainExercise ||
                (newCurrentResource.remainExercise &&
                    newCurrentResource.remainRecovery &&
                    newCurrentResource.remainRecovery > newCurrentResource.remainExercise)) {
                setCurrentStage(TimerStage.PLAYING_REST)
            }
        }

        if (entry.logs[index].timer) {
            setCurrentTimer(entry.logs[index].timer!)
            setCurrentStage(entry.logs[index].timer!.stage)
        }

        // console.log(`Remain Recovery: ${remainRecovery} Remain Exercise: ${remainExercise}`)

        if (replayState && entry.logs.length > 0 && index + 1 < entry.logs.length - 1) {
            setReplayState((prev: ReplayState) => {
                if (prev) {
                    clearInterval(prev.timer)
                }


                if (!prev.state) {
                    return {
                        state: false,
                        timer: undefined
                    }
                }

                lastTimeoutStarted = Date.now()

                return {
                    state: prev.state,
                    timer: setTimeout(() => {
                        timeoutElapsed = 0
                        processLogEntry(index + 1)
                    }, ((Date.parse(entry.logs[index + 1].currentTimestamp) - Date.parse(entry.logs[index].currentTimestamp)) - timeoutElapsed))
                }
            })
        }
    }

    const seekToLog = useCallback((index, update) => {
        console.log(`Seek to: ${index}`)
        timeoutElapsed = 0
        setReplayState((prev) => {
            clearInterval(prev.timer)
            return {
                state: prev.state,
                timer: undefined
            }
        })
        processLogEntry(index, update)
    }, [
        entry
    ])

    const syncTrainerVideo = useCallback(() => {
        if (!entry) {
            return;
        }
        const video: HTMLVideoElement | HTMLElement | null = document.getElementById(videoId)
        if (!video || !(video instanceof HTMLVideoElement)) {
            return;
        }
        syncVideoElementTime({
            entry: entry,
            index: currentLogsIndex ?? 0,
            video: video,
            event: TrakReplayEvent.recordingStarted,
            closestToCurrent: false
        })
    }, [currentLogsIndex]);

    const syncChromeTabMusic = useCallback(() => {
        if (!entry) {
            return;
        }
        const video: HTMLVideoElement | HTMLElement | null = document.getElementById(musicId)
        if (!video || !(video instanceof HTMLVideoElement)) {
            return;
        }
        syncVideoElementTime({
            entry: entry,
            index: currentLogsIndex ?? 0,
            video: video,
            event: TrakReplayEvent.chromeTabRecordingStarted,
            closestToCurrent: true
        })
    }, [currentLogsIndex]);


    useEffect(() => {
        if (!entry) {
            return
        }
        if (!currentLogsIndex) {
            let lastRecording = 0
            for (let i = entry.logs.length - 1; i >= 0; i--) {
                if (entry.logs[i].ondemandEvents.includes(TrakReplayEvent.recordingStarted)) {
                    lastRecording = i
                    break
                }
            }
            setLastRecordingIndex(lastRecording)
            processLogEntry(lastRecording, true)
        }

    }, [entry, currentLogsIndex])

    useEffect(() => {

        if (currentLogsIndex === null) {
            return
        }

        if (!replayPlaying) {
            setReplayState((prev) => {
                clearInterval(prev.timer)
                timeoutElapsed += Date.now() - lastTimeoutStarted
                return {
                    timer: undefined,
                    state: false
                }
            })
        } else {
            if (currentLogsIndex) {
                setReplayState((prev) => {
                    return {
                        state: true,
                        timer: prev.timer
                    }
                })
                processLogEntry(currentLogsIndex, true)
            }
        }
    }, [replayPlaying])

    return (<ReplayLogsControllerContext.Provider value={{
        trakStarted,
        trainerCameraOn,
        trainerMicOn,
        isPlaying,
        callMode,
        trainerUid,
        currentParticipants,
        currentResource,
        nextResource,
        currentStage,
        seekToLog,
        currentLogsIndex,
        replayPlaying,
        switchReplayState,
        remainExercise,
        remainRecovery,
        currentTimer,
        lastRecordingIndex,
        setReplayPlaying,
        currentMusicResource,
        logs: entry?.logs ?? [],
        takeover,
        syncTrainerVideo,
        syncChromeTabMusic,
        currentTimestamp
    }}>{children}</ReplayLogsControllerContext.Provider>)
}

export default ReplayLogsControllerProvider
