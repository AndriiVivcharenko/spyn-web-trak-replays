# spyn-trak-replays

## Usage

```tsx
<TrakReplayPlayer 
    buildProgress={(progress) => <ProgressSpin progress={progress}/>}
    getVideoPlaylist={config => getVideoPlaylist(config)}
    musicId={MUSIC_VIDEO_ID}
    replay={props.replay}
    videoId={TRAINER_CAMERA_VIDEO_ID}>
    
    <ReplayPlayerUi/>
    
</TrakReplayPlayer>
```

