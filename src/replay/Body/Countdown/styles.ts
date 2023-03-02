import styled from "styled-components"
import {heading3, steel, title1} from "../../../../styles/variables"

export const Column = styled.div`
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
`

export const Body = styled.div`
  z-index: 2;
  width: 300px;
  height: 90px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`


export const Time = styled.p`
  ${title1};
  font-size: 40px;
  width: 116px;
  min-width: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 60px;
  line-height: 100%;
  padding: 16px 24px;
  border-radius: 16px;
  border-width: 4px;
  z-index: 1;
  transform: translate(0, -12px);
`

export const Subtitle = styled.p`
  ${heading3};
  font-size: 14px;
  background: ${steel.surface};
  padding: 4px;
  border-radius: 8px;
  transform: translate(0, -18px);
  z-index: 2;

`
