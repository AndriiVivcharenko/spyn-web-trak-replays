import {LessonType, TimerStage} from "../replay/types";

export interface TrakPose {
  duration: number
  videoTimestamp: number
}

export enum TrakReplayEvent {
  isPreparing = "isPreparing",
  trakStarted = "trakStarted",
  videoPlay = "videoPlay",
  videoPause = "videoPause",
  videoSkipped = "videoSkipped",
  restPlay = "restPlay",
  restPause = "restPause",
  restSkipped = "restSkipped",
  trainerTakeover = "trainerTakeover",
  trainerTakeoverEnd = "trainerTakeoverEnd",
  trainerCameraOn = "trainerCameraOn",
  trainerCameraOff = "trainerCameraOff",
  audio = "audio",
  trainerMicOn = "trainerMicOn",
  trainerMicOff = "trainerMicOff",
  group = "group",
  broadcast = " broadcast",
  trainerDisconnected = "trainerDisconnected",
  trainerConnected = "trainerConnected",
  newLessonLoaded = "newLessonLoaded",
  muteTrainerAudio = "muteTrainerAudio",
  trainerPrivateConversation = "trainerPrivateConversation",
  recordingStarted = "recordingStarted",
  recordingEnded = "recordingEnded",
  chromeTabRecordingStarted = "chromeTabRecordingStarted",
  chromeTabRecordingEnded = "chromeTabRecordingEnded",
  timerUpdated = "timerUpdated",
}

export enum TrakType {
  VIDEO = "Trak-video",
  AUDIO = "Trak-audio",
}

export interface OndemandParticipant {
  agoraUid: number
  timestamp: any
  uid: string
}

export interface OndemandResource {
  totalExercise?: number
  remainExercise?: number
  totalRecovery?: number
  remainRecovery?: number
  trainerVolume?: number
  musicVolume?: number
  repetitions?: number
  ondemandLesson?: OndemandLesson
}

export interface Timer {
  currentTimestamp?: number,
  isPlaying: boolean
  poseBuffer: number
  poses: {
    duration: number
    timestamp: number
  }[]
  stage: TimerStage
  startAt: number
  time: number
  totalTime?: number
}

export interface SpynSong {
  readonly url: string
  readonly artist: string
  readonly release: string
}

export interface MusicSettings {
  readonly channel: any
  readonly enabled: boolean
  readonly spynSong?: SpynSong
}

export interface OndemandState {
  currentTimestamp: any
  ondemandEvents: TrakReplayEvent[]
  currentParticipants?: OndemandParticipant[]
  trainerUid?: number
  currentResource?: OndemandResource
  currentMusic?: AgoraRecording
  currentMusicSettings?: MusicSettings
  timer?: Timer
}

export interface OndemandLesson {
  lessonID: string
  lessonName: string
  lessonType: LessonType
  lessonVideoGif: string
  lessonVideoUrl: string
  thumbNailUrl: string
  videoOS: string
  poseHoldData?: TrakPose[]
  repetitions: number
  freeStyleDuration: number
  poseDuration: number
  flipped: boolean
  equipment: string
  equipment_note?: string
  displayOrientation: number
}

export interface ReplayModel {
  _id: string
  created: string
  event_id: string
  event_name: string
  studio_id: string
  recordingPath: string
  recordingSaved: boolean
  resource: string
  updated: Date
  published: boolean
  replay_start: number | undefined
  replay_end: number | undefined
  title: string | undefined
  delete: boolean | undefined
  description: string | undefined
  musicStation: string | undefined
  memberships: string[] | undefined
  includeInFeatured: boolean | undefined
  logs: OndemandState[]
  coach_name: string
  creator_name: string
  marketplace?: boolean
}

export interface StartRecordingResponse {
  readonly resourceId: string
  readonly sid: string
  readonly id: string
  readonly token: string
}

export interface AcquireResponse {
  readonly resourceId: string
  readonly uid: string
}

export interface AgoraRecording {
  readonly token: string
  readonly channel: string
  readonly userUid: number
  readonly start: StartRecordingResponse
  readonly timestamp: number
  readonly acquie: AcquireResponse

}

export function parseDateFromAny(timestamp: any): number {
  let parsedTimestamp;
  if (typeof timestamp === 'string') {
    // if timestamp is a string, then parse
    parsedTimestamp = Date.parse(timestamp);
  } else if (typeof timestamp === 'number') {
    // return numbers as is
    parsedTimestamp = timestamp;
  } else if (timestamp._seconds) {
    // if firestore timestamp, return ms
    // data structure is { _seconds: 1678135704, _nanoseconds: 495000000 }
    parsedTimestamp = timestamp._seconds * 1000;
  } else {
    throw new TypeError("Timestamp type is unhandled");
  }
  return parsedTimestamp;
}
