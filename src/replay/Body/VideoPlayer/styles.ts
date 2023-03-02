import styled from "styled-components"

export const Body = styled.div`
  max-height: 100%;
  //min-height: 100%;
  //height: 100%;
  //width: 60%;
  //min-width: 60%;
  max-width: 60%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  video, div {
    width: 100%;
    min-width: 100%;
    max-height: 320px;

  }

  .flipped {
    -moz-transform: rotateY(180deg);
    -o-transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    transform: rotateY(180deg);
  }

  .overlay {
    position: absolute;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    min-width: 100%;
    height: 100%;
    min-height: 100%;
    background: rgba(0, 0, 0, 0.4);
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 500ms;

    :hover {
      opacity: 1;
    }
  }
`
