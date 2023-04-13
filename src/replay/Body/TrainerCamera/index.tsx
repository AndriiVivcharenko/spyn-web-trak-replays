import React from "react"
import {MusicPlaylist} from "../../ReplayLogsPlaylistProvider"
import Hls from "hls.js"
import {AgoraRecording} from "../../../models";

export class TrainerCameraController {
    readonly musicId: string
    readonly videoId: string
    readonly playlistUrl: string
    readonly musicPlaylists: MusicPlaylist[]

    private isInit: boolean = false;

    private videoHls: Hls | undefined;
    private chromeTabHls: Hls | undefined;
    private chromeTabVolume: number;
    private trainerVolume: number;
    private currentMusicResource?: AgoraRecording

    constructor(config: { musicId: string, videoId: string, playlistUrl: string, musicPlaylists: MusicPlaylist[] }) {
        const {musicId, videoId, playlistUrl, musicPlaylists} = config;
        this.musicId = musicId;
        this.videoId = videoId;
        this.playlistUrl = playlistUrl;
        this.musicPlaylists = musicPlaylists;
    }

    setChromeTabVolume(v: number) {
        this.chromeTabVolume = v;
        this.getMusicPlayerConditionally(e => {
            e.volume = this.chromeTabVolume;
        })
    }

    setTrainerVolume(v: number) {
        this.trainerVolume = v;
        this.getVideoPlayerConditionally(e => {
            e.volume = this.trainerVolume;
        })
    }

    private getVideoPlayerConditionally(onTrainerVideoPlayer: (e: HTMLVideoElement) => void) {
        const trainerCameraPlayer = document.getElementById(this.videoId);
        if (trainerCameraPlayer && trainerCameraPlayer instanceof HTMLVideoElement) {
            onTrainerVideoPlayer(trainerCameraPlayer);
        }
    }

    private getMusicPlayerConditionally(onMusicPlayer: (e: HTMLVideoElement) => void) {
        const musicPlayer = document.getElementById(this.musicId);
        if (musicPlayer && musicPlayer instanceof HTMLVideoElement) {
            onMusicPlayer(musicPlayer);
        }
    }

    private getPlayersConditionally(onMusicPlayer: (e: HTMLVideoElement) => void, onTrainerVideoPlayer: (e: HTMLVideoElement) => void) {
        this.getVideoPlayerConditionally(onTrainerVideoPlayer);
        this.getMusicPlayerConditionally(onMusicPlayer);
    }

    attach(config: {
        onceAttachedTrainerVideo?: () => void,
        onceAttachedChromeTabAudio?: () => void
    }) {
        this.getPlayersConditionally(e => {
            this.chromeTabHls?.once(Hls.Events.MEDIA_ATTACHED, () => {
                e.volume = this.chromeTabVolume;
                if (config.onceAttachedChromeTabAudio) {
                    config.onceAttachedChromeTabAudio
                }
            });
            this.chromeTabHls?.attachMedia(e);
        }, e => {
            this.videoHls?.once(Hls.Events.MEDIA_ATTACHED, () => {
                e.volume = this.trainerVolume;
                if (config.onceAttachedTrainerVideo) {
                    config.onceAttachedTrainerVideo();
                }
            })
            this.videoHls?.attachMedia(e);
        })
    }

    play() {
        this.getPlayersConditionally(e => {
            e.play().catch(() => {
            });
        }, e => {
            e.play().catch(() => {
            });
        })
    }

    pause() {
        this.getPlayersConditionally(e => {
            e.pause();
        }, e => {
            e.pause();
        })
    }

    detach() {
        this.videoHls?.media?.pause();
        this.videoHls?.detachMedia();
        this.chromeTabHls?.media?.pause();
        this.chromeTabHls?.detachMedia();
    }

    isInitialized() {
        return this.isInit;
    }

    init() {
        this.isInit = this.initTrainerVideo();
    }

    getTainerVideo() {
        return this.videoHls?.media;
    }

    getChromeVideo() {
        return this.chromeTabHls?.media;
    }

    initChromeTabMusic(resource?: AgoraRecording) {

        if (resource?.timestamp !== this.currentMusicResource?.timestamp) {
            this.currentMusicResource = resource;
            console.log("New chrome tab music resource: ", resource);
        } else {
            return;
        }

        const playlist = this.musicPlaylists.find((e) => e.resource === this.currentMusicResource?.timestamp)

        const musicPlayer = document.getElementById(this.musicId);

        if (!musicPlayer || !(musicPlayer instanceof HTMLVideoElement)) {
            console.log("NO CHROME TAB MUSIC VIDEO ELEMENT")
            return;
        }

        if (Hls.isSupported()) {
            playlist?.hls.detachMedia()
            playlist?.hls.attachMedia(musicPlayer)
            playlist?.hls.loadSource(playlist?.url);

            const sync = () => {
                musicPlayer.volume = this.chromeTabVolume;
                musicPlayer.play().catch((err) => {
                    console.error(err)
                })
            }

            playlist?.hls.once(Hls.Events.ERROR, () => {
                sync()
            })

            playlist?.hls.once(Hls.Events.MEDIA_ATTACHED, event => {
                sync()
            })

            this.chromeTabHls = playlist?.hls;

        } else if (musicPlayer && playlist) {
            musicPlayer.src = playlist?.url ?? ""
        }


    }

    initTrainerVideo() {

        const hls = new Hls()

        const trainerCameraPlayer = document.getElementById(this.videoId);

        if (!trainerCameraPlayer || !(trainerCameraPlayer instanceof HTMLVideoElement)) {
            return false;
        }

        if (Hls.isSupported()) {

            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                console.log("video and hls.js are now bound together !")
            })
            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                console.log(
                    "manifest loaded, found " + data.levels.length + " quality level"
                )

                trainerCameraPlayer.play().catch((err) => {
                    // console.error(err)
                })
            })
            hls.on(Hls.Events.MEDIA_DETACHED, event => {
                hls.attachMedia(trainerCameraPlayer)
            })

            hls.loadSource(this.playlistUrl)
            hls.attachMedia(trainerCameraPlayer);

            this.videoHls = hls;
        } else if (trainerCameraPlayer) {
            trainerCameraPlayer.src = this.playlistUrl
        }

        return true;
    }

    onMusicVideoCanPlay(replayPlaying: boolean) {
        this.getMusicPlayerConditionally((e) => {
            if (replayPlaying) {
                if (this.chromeTabVolume) {
                    e.volume = this.chromeTabVolume;
                }
                e.play().catch(() => {
                })
            } else {
                e.pause()
            }
        })

    }

    onTrainerVideoCanPlay(replayPlaying: boolean) {
        this.getVideoPlayerConditionally((e) => {
            if (replayPlaying) {
                if (this.trainerVolume) {
                    e.volume = this.trainerVolume;
                }
                e.play().catch(() => {
                })
            } else {
                e.pause()
            }
        })

    }
}

const TrainerCamera = (props: {
    musicId: string
    videoId: string
    onTrainerCanPlay: () => void,
    onMusicCanPlay: () => void,
    musicOption: string
}) => {

    // @ts-ignore
    return (<>
        <video autoPlay={false} data-setup='{}' id={props.videoId}
               onCanPlay={props.onTrainerCanPlay} preload="auto">
        </video>
        <video autoPlay={false} data-setup="{}" id={props.musicId} onCanPlay={props.onMusicCanPlay} preload="auto"
               muted={props.musicOption !== "trainersMusic" && props.musicOption !== "lowIntensity"}
               style={{
                   width: 0,
                   height: 0
               }}/>

    </>)
}

export default TrainerCamera
