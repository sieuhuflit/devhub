// @flow

import React from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'
import styled from 'styled-components/native'

import Icon from '../../libs/icon'
import { contentPadding, radius as defaultRadius } from '../../styles/variables'

export const Button = styled.TouchableOpacity`
  height: ${({ horizontal }) => (horizontal ? 44 : 58)}px;
  background-color: ${({ theme }) => theme.invert().base02};
  border-color: ${({ theme }) => theme.base02};
  border-radius: ${({ radius }) => radius}px;
  border-width: ${StyleSheet.hairlineWidth}px;
`

export const Content = styled.View`
  flex: 1;
  flex-direction: row;
`

export const IconWrapper = styled.View`
  align-items: center;
  justify-content: center;
  padding-horizontal: ${contentPadding}px;
  border-width: 0px;
  border-right-width: ${StyleSheet.hairlineWidth}px;
  border-color: ${({ theme }) => theme.base04};
`

export const ButtonIcon = styled(Icon)`
  font-size: 20px;
  color: ${({ muted, theme }) =>
    muted ? theme.invert().base05 : theme.invert().base04};
`

export const TextWrapper = styled.View`
  flex: 1;
  padding-horizontal: ${contentPadding}px;
  align-items: ${({ horizontal }) => (horizontal ? 'center' : 'flex-start')};
  justify-content: center;
  ${({ horizontal }) => horizontal && 'flex-direction: row;'}
`

export const Text = styled.Text`
  line-height: 18px;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  color: ${({ muted, theme }) =>
    muted ? theme.invert().base05 : theme.invert().base04};
`

type Props = {
  leftIcon?: string,
  horizontal?: boolean,
  loading?: boolean,
  radius?: number,
  rightIcon?: string,
  title?: string,
  subtitle?: string,
  subtitleProps?: Object,
  textProps?: Object,
}

const GithubButton = ({
  leftIcon,
  horizontal,
  loading,
  title,
  radius,
  rightIcon,
  subtitle,
  subtitleProps = {},
  textProps = {},
  ...props
}: Props) =>
  <Button activeOpacity={1} horizontal={horizontal} radius={radius} {...props}>
    <Content>
      {leftIcon &&
        <IconWrapper>
          <ButtonIcon name={leftIcon} />
        </IconWrapper>}

      <TextWrapper horizontal={horizontal}>
        {!!title && <Text {...textProps}>{title}</Text>}
        {!!subtitle && <Text muted {...subtitleProps}>{subtitle}</Text>}
      </TextWrapper>

      {(rightIcon || loading) &&
        <IconWrapper>
          {loading
            ? <ActivityIndicator />
            : <ButtonIcon name={rightIcon} muted />}
        </IconWrapper>}
    </Content>
  </Button>

GithubButton.defaultProps = {
  leftIcon: 'mark-github',
  horizontal: false,
  loading: false,
  radius: defaultRadius,
  rightIcon: '',
  title: '',
  subtitle: '',
  subtitleProps: undefined,
  textProps: undefined,
}

export default GithubButton