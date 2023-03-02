import styled from "styled-components"
import {accents, steel} from "../../styles/variables"

export const Body = styled.div`
  max-height: 100%;
  //min-height: 100%;
  max-width: 100%;
  //max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${steel.background};
  padding: 48px 48px;
  position: relative;
  overflow: hidden;

  .row {
    display: flex;
    flex-direction: row;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 32px;
    justify-content: start;
    align-items: center;
  }

  .sections {
    position: absolute;
    bottom: 0;
    opacity: 0.3;
    overflow-y: hidden;
    width: 100%;

    transition: opacity 300ms;

    :hover {
      opacity: 1;
    }
  }

  .section {
    background: ${steel.surface};
    color: ${accents.cyan};
    padding: 8px 16px;
    border-radius: 16px;
    font-size: 24px;

    cursor: pointer;
  }
`
