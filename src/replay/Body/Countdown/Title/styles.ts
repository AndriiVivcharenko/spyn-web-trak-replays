import styled from 'styled-components'
import * as palette from '../../../../styles/variables'
import {title1} from "../../../../styles/variables";

export const Body = styled.div`
  ${title1};
  border-radius: 16px;
  border: 4px solid ${accents.limeGreen};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
  min-width: 144px;
  height: 56px;
  text-align: center;
  overflow: hidden;
  line-height: 100%;
`

export const ContainerTitle2 = styled.p`
  ${palette.title1};
  font-size: 42px;
`

export const ContainerTitle1 = styled.p`
  ${palette.title1};
  font-size: 42px;
`
