export enum CallMode {
  broadcast = "BROADCAST",
  group = "GROUP"
}

export enum TimerStage {
  PLAYING_EXERCISE,
  PLAYING_REST,
  PREPARING_STAGE,
  DONE
}

export enum LessonType {
  pose = "Pose Holding",
  repetition = "Repetition",
  freestyle = "Free Style"
}

export const parseLessonType = (type: string) => {
  switch (type) {
    case "Pose Holding":
      return LessonType.pose
    case "Repetition":
      return LessonType.repetition
    case "Free Style":
      return LessonType.freestyle
  }
  return LessonType.repetition
}

