import styled from "styled-components"

export const Body = styled.div`
  min-width: 133px;
  max-width: 260px;
  min-height: 100px;
  max-height: 144px;
  position: relative;

  video {
    width: 100%;
    height: 100%;
    //border: 1px solid white;
    //border-radius: 8px;
  }

`

export const DevicesStatusOverlay = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: end;
  gap: 8px;
  padding: 4px;
  z-index: 3;
`
