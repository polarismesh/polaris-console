import React, { useEffect } from 'react'
import { MonacoEditor, Row, Col, Icon } from 'tea-component'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import insertCSS from '@src/polaris/common/helpers/insertCSS'

import { debounce } from '../../../utils'

const { DiffEditor } = MonacoEditor
interface Props {
  original: string
  now: string
  format: string
  originTitle?: React.ReactNode
  nowTitle?: React.ReactNode
}

insertCSS(
  'monaco-section-file-diff',
  `
  .monaco-file-diff-full-screen-icon {
    position: absolute;
    right: -2px;
    top: 8px;
    z-index: 9999;
  }
`,
)

export default function FileDiff(props: Props) {
  const { original, now, format, originTitle = '历史发布', nowTitle = '当前发布' } = props
  const editorRef = React.useRef<{ editor: any }>(null)
  const [isFullScreen, setFullScreen] = React.useState(false)
  const [hasRecordSize, setHasRecordSize] = React.useState(false)

  const [editorRect, setEditorRect] = React.useState({ width: 0, height: 400 })
  const [dialogRect, setDialogRect] = React.useState({ width: '', height: '', maxHeight: '' })

  function handleFullScreen() {
    setFullScreen(!isFullScreen)
    if (!editorRef.current) {
      return
    }
    const dialogs = document.getElementsByClassName('tea-dialog__inner')
    const dialog = dialogs[0] as HTMLDivElement
    const dialogHeader = document.getElementsByClassName('tea-dialog__header')
    const dialogFooter = document.getElementsByClassName('tea-dialog__footer')

    if (!hasRecordSize) {
      const editorOriginRect: DOMRect = editorRef.current.editor._domElement.getBoundingClientRect()
      const dialogStyles = getComputedStyle(dialog, null)
      setEditorRect({ width: editorOriginRect.width, height: editorOriginRect.height })
      setDialogRect({
        width: dialogStyles.width,
        height: dialogStyles.height,
        maxHeight: dialogStyles.maxHeight,
      })
      setHasRecordSize(true)
    }
    if (isFullScreen) {
      editorRef.current.editor.layout({
        height: editorRect.height,
        width: editorRect.width,
      })
    } else {
      editorRef.current.editor.layout({
        height: document.body.clientHeight - 120,
        width: document.body.clientWidth,
      })
    }

    dialog.style.width = isFullScreen ? dialogRect.width : '100%'
    dialog.style.height = isFullScreen ? dialogRect.height : '100%'
    dialog.style.maxHeight = isFullScreen ? dialogRect.maxHeight : '100%'

    const header = dialogHeader[0] as HTMLElement
    header.style.display = isFullScreen ? 'block' : 'none'
    const footer = dialogFooter[0] as HTMLElement
    footer.style.display = isFullScreen ? 'block' : 'none'
  }

  const onResize = () => {
    if (isFullScreen) {
      editorRef.current.editor.layout({
        height: document.body.clientHeight - 120,
        width: document.body.clientWidth,
      })
    }
  }
  const onResizeHandler = debounce(onResize.bind(this), 300)

  useEffect(() => {
    window.addEventListener('resize', onResizeHandler)
    return () => {
      window.removeEventListener('resize', onResizeHandler)
    }
  }, [isFullScreen])

  return (
    <section className='monaco-section-file-diff'>
      <Row style={{ margin: '10px 0px' }}>
        <Col span={12} style={{ paddingLeft: '0px' }}>
          {originTitle}
        </Col>
        <Col span={12}>{nowTitle}</Col>

        <Col style={{ position: 'relative' }}>
          <Icon
            className='monaco-file-diff-full-screen-icon'
            type={isFullScreen ? 'fullscreenquit' : 'fullscreen'}
            size='l'
            onClick={handleFullScreen}
          />
        </Col>
      </Row>
      <DiffEditor
        ref={editorRef}
        monaco={monaco}
        height={editorRect.height}
        language={format}
        original={original}
        value={now}
        options={{ ignoreTrimWhitespace: false }}
      />
    </section>
  )
}
