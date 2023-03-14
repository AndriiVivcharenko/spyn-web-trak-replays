import React, {createContext, useEffect, useState} from "react"
import {TimerStage} from "./types"
import {OndemandState, ReplayModel, TrakReplayEvent} from "../models"

export interface ReplayLogsTrim {
    startIndex: number,
    endIndex: number
}

export interface ReplayLogsContextType {
    entry?: ReplayModel,
    trim: ReplayLogsTrim | undefined
}

export const ReplayLogsContext = createContext<ReplayLogsContextType>({
    entry: undefined,
    trim: undefined
})

const ReplayLogsProvider = (props: {
    children: any
    replay: ReplayModel
}) => {


    const [entry, setEntry] = useState<ReplayModel>()
    const [trim, setTrim] = useState<ReplayLogsTrim>();

    useEffect(() => {
        if (!entry || trim) {
            return;
        }


        const start = props.replay.replay_start ?? Date.parse(entry.logs[0].currentTimestamp);
        const end = props.replay.replay_end ?? Date.parse(entry.logs[entry.logs.length - 1].currentTimestamp);

        if (start && end) {

            let startIndex = 0;
            let endIndex = entry.logs.length - 1;

            for (let i = 0; i < entry.logs.length; i++) {
                const currentLog = entry.logs[i];
                if (Date.parse(currentLog.currentTimestamp) >= start) {
                    startIndex = i;
                    break;
                }
            }

            for (let i = entry.logs.length - 1; i >= 0; i--) {
                const currentLog = entry.logs[i];
                if (Date.parse(currentLog.currentTimestamp) <= end) {
                    endIndex = i;
                    break;
                }
            }

            setTrim({
                startIndex: startIndex,
                endIndex: endIndex
            })
        } else {
            setTrim({
                startIndex: 0,
                endIndex: entry.logs.length - 1
            })
        }


    }, [trim, entry])

    useEffect(() => {
        if (!entry) {

            const copy: ReplayModel = structuredClone(props.replay)

            let logs = copy.logs
                .filter((e) => e)
                .sort((e, b) => Date.parse(e.currentTimestamp) - Date.parse(b.currentTimestamp))

            const replayEventList = [
                TrakReplayEvent.videoPlay,
                TrakReplayEvent.videoSkipped,
                TrakReplayEvent.videoPause,
                TrakReplayEvent.restPlay,
                TrakReplayEvent.restSkipped,
                TrakReplayEvent.restPause
            ]

            // only retain log elements between the last recording start and end
            let lastRecordingStart = 0
            let lastRecordingEnd = logs.length - 1
            for (let i = logs.length - 1; i >= 0; i--) {
                const logEntryClone: OndemandState = JSON.parse(JSON.stringify(logs[i]))
                if (logEntryClone.ondemandEvents.includes(TrakReplayEvent.recordingEnded)) {
                    lastRecordingEnd = i
                }
                if (logEntryClone.ondemandEvents.includes(TrakReplayEvent.recordingStarted)) {
                    lastRecordingStart = i
                    break
                }
            }
            if (lastRecordingStart > 0 || lastRecordingEnd < logs.length - 1) {
                copy.logs = logs.slice(lastRecordingStart, lastRecordingEnd + 1)
                logs = copy.logs
            }

            console.log(logs)

            // console.log(copy.logs.map((e) => {
            //   return {
            //     time: e.timer?.time,
            //     remainExercise: e.currentResource?.remainExercise,
            //     remainRecovery: e.currentResource?.remainRecovery,
            //     timestamp: e.currentTimestamp,
            //     resource: e.currentResource?.ondemandLesson?.lessonName,
            //     events: e.ondemandEvents
            //   }
            // }))

            for (let i = 0; i < logs.length - 1; i++) {

                const timestampsDiff = Date.parse(logs[i + 1].currentTimestamp) - Date.parse(logs[i].currentTimestamp)

                // consolidate entries registered at the same timestamp
                if (timestampsDiff < 250) {

                    // console.log(i)
                    // console.log("Same timestamp log entries: " + timestampsDiff / 1000)

                    const logEntry: OndemandState = JSON.parse(JSON.stringify(logs[i]))
                    const nextLogEntry: OndemandState = JSON.parse(JSON.stringify(logs[i + 1]))

                    const syncTimerWithExerciseConditionally = () => {
                        if (logEntry.timer?.time === 0 && (logEntry.timer?.totalTime === 0 || !logEntry.timer?.totalTime)) {

                            console.log("Current Timer: ", logEntry.timer);
                            console.log("Current resource: ", logEntry.currentResource);
                            for (let j = i; j < logs.length; j++) {
                                const element = logs[j];
                                if (element.timer?.time !== 0) {
                                    logEntry.timer = element.timer;
                                    logEntry.currentResource = element.currentResource;
                                    break;
                                }
                            }
                            console.log("Index: ", i);
                            console.log("New Timer: ", logEntry.timer);
                            console.log("New resource: ", logEntry.currentResource)

                        }
                    }

                    if (nextLogEntry.timer &&
                        (nextLogEntry.timer.stage === TimerStage.PLAYING_EXERCISE || nextLogEntry.timer.stage === TimerStage.PLAYING_REST)) {
                        logEntry.timer = nextLogEntry.timer
                        logEntry.currentResource = nextLogEntry.currentResource
                        if (logEntry.currentResource && nextLogEntry.currentResource) {
                            logEntry.currentResource.remainRecovery = nextLogEntry.currentResource.remainRecovery
                            logEntry.currentResource.remainExercise = nextLogEntry.currentResource.remainExercise
                        }
                        syncTimerWithExerciseConditionally();
                        // if(nextLogEntry.timer?.time)
                    } else if (!nextLogEntry.timer
                        && nextLogEntry.ondemandEvents.some(item => replayEventList.includes(item))) {
                        logEntry.currentResource = nextLogEntry.currentResource;
                        if (logEntry.currentResource && nextLogEntry.currentResource) {
                            logEntry.currentResource.remainRecovery = nextLogEntry.currentResource.remainRecovery
                            logEntry.currentResource.remainExercise = nextLogEntry.currentResource.remainExercise
                        }
                        syncTimerWithExerciseConditionally();
                    }

                    logEntry.ondemandEvents = [
                        ...new Set([
                            ...logEntry.ondemandEvents,
                            ...nextLogEntry.ondemandEvents
                        ])
                    ]

                    logs[i] = logEntry
                    logs[i + 1] = logEntry

                } else if (timestampsDiff > 2000) {

                    // console.log(i)
                    // console.log("Possible additional log entries: " + timestampsDiff / 1000)

                    const additionalLogs: OndemandState[] = [JSON.parse(JSON.stringify(logs[i]))]

                    let currentPlay: TrakReplayEvent | undefined = undefined
                    for (let j = 1; j <= Math.floor(timestampsDiff / 1000); j++) {
                        const logEntryClone: OndemandState = JSON.parse(JSON.stringify(additionalLogs[j - 1]))

                        if (logEntryClone.ondemandEvents.includes(TrakReplayEvent.videoPlay)) {
                            currentPlay = TrakReplayEvent.videoPlay
                        } else if (logEntryClone.ondemandEvents.includes(TrakReplayEvent.restPlay)) {
                            currentPlay = TrakReplayEvent.restPlay
                        }

                        logEntryClone.currentTimestamp = (new Date(Date.parse(logEntryClone.currentTimestamp) + 1000)).toISOString()
                        logEntryClone.ondemandEvents = logEntryClone.ondemandEvents.filter((e) => ![
                            ...replayEventList,
                            TrakReplayEvent.trakStarted,
                            TrakReplayEvent.recordingStarted,
                            TrakReplayEvent.recordingEnded,
                            TrakReplayEvent.chromeTabRecordingStarted,
                            TrakReplayEvent.chromeTabRecordingEnded
                        ].includes(e))
                        if (logEntryClone.timer && logEntryClone.timer.time > 0) {
                            logEntryClone.timer.time -= 1
                            logEntryClone.timer.startAt += 1000
                        }
                        if (logEntryClone.currentResource) {

                            if (currentPlay === TrakReplayEvent.videoPlay) {
                                logEntryClone.currentResource.remainRecovery = 0
                            } else if (currentPlay === TrakReplayEvent.restPlay) {
                                logEntryClone.currentResource.remainExercise = 0
                            }

                            if (logEntryClone.currentResource.remainRecovery &&
                                logEntryClone.currentResource.remainRecovery > 0) {
                                logEntryClone.currentResource.remainRecovery -= 1
                            }
                            if (logEntryClone.currentResource.remainExercise &&
                                logEntryClone.currentResource.remainExercise > 0) {
                                logEntryClone.currentResource.remainExercise -= 1
                            }
                        }

                        additionalLogs.push(logEntryClone)
                    }

                    copy.logs = [
                        ...logs.slice(0, i + 1),
                        ...additionalLogs,
                        ...logs.slice(i + 1)
                    ]

                    logs = copy.logs
                    i += additionalLogs.length

                }

            }

            for (let i = 0; i < logs.length - 1; i++) {

                const log = logs[i];
                if (log.timer && log.currentTimestamp) {
                    log.timer.currentTimestamp = Date.parse(log.currentTimestamp);
                    log.timer.time -= ((log.timer.currentTimestamp - log.timer.startAt) / 1000);
                }

                if (Date.parse(logs[i + 1].currentTimestamp) < Date.parse(logs[i].currentTimestamp)) {
                    logs[i + 1].currentTimestamp = new Date(Date.parse(logs[i].currentTimestamp) + 250).toISOString()
                }
            }

            // console.log(copy.logs.map((e) => {
            //   return {
            //     time: e.timer?.time,
            //     remainExercise: e.currentResource?.remainExercise,
            //     remainRecovery: e.currentResource?.remainRecovery,
            //     timestamp: e.currentTimestamp,
            //     resource: e.currentResource?.ondemandLesson?.lessonName,
            //     events: e.ondemandEvents
            //   }
            // }))


            console.log(copy.logs)
            setEntry(copy)
        }
    }, [entry])

    return (entry ?
            <ReplayLogsContext.Provider value={{entry, trim}}>{props.children}</ReplayLogsContext.Provider> : null
    )
}

export default ReplayLogsProvider
