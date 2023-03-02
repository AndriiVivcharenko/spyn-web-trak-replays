import styled from "styled-components"

export const CameraBody = styled.div`
  width: 40%;
  max-width: 40%;
  height: calc(100% - 144px);
  max-height: calc(100% - 144px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  video {
    width: 90%;
    height: 90%;
  }
`
