import {CameraBody} from "./styles"
import {createRef, useEffect} from "react"
import React from "react"

const Camera = () => {

    const videoRef = createRef<HTMLVideoElement>();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({audio: false, video: true}).then((e) => {
            if (videoRef.current) {
                videoRef.current.srcObject = e
            }
        })
    }, [videoRef])


    return (<CameraBody>
        <video autoPlay={true} muted={true} playsInline={true} ref={videoRef}/>
    </CameraBody>)
}

export default Camera
