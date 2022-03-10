import * as React from 'react'
import { purify } from 'saga-duck'
import { Text, Copy } from 'tea-component'

type CopyableTextProps = {
  text: string
  emptyTip?: string
  isHoverIcon?: boolean
  style?: React.CSSProperties
  copyText?: string
  component?: string | JSX.Element | JSX.Element[]
}

class CopyableText extends React.Component<CopyableTextProps, Readonly<{}>> {
  render() {
    const { text, emptyTip = '-', isHoverIcon = true, style, copyText, component } = this.props
    return (
      <>
        <Text overflow tooltip={text} style={{ maxWidth: 'calc(100% - 16px)', ...style }}>
          {component || text || emptyTip}
        </Text>
        {text && (
          <Text className={isHoverIcon ? 'hover-icon' : ''}>
            <Copy text={copyText || text} />
          </Text>
        )}
      </>
    )
  }
}

export default purify(CopyableText)
