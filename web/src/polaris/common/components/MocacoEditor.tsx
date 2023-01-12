import * as React from 'react'
import {
  MonacoEditor as CodeEditor,
  MonacoEditorProps as CodeEditorProps,
  Status,
  useClassNames,
  Icon,
} from 'tea-component'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { setDiagnosticsOptions } from 'monaco-yaml'

import insertCSS from '../helpers/insertCSS'


setDiagnosticsOptions({
  enableSchemaRequest: true,
  hover: true,
  completion: true,
  validate: true,
  format: true,
  schemas: [],
})

insertCSS(
  'monaco-section',
  `
  .monaco-section-full-screen {
    position: fixed !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9998;
  }
  .monaco-section .app-tsf-alert__info{
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .monaco-full-screen-icon {
    position: absolute;
    right: 16px;
    top: 16px;
    z-index: 1 
  }
`,
)

type MonacoEditorProps = Omit<CodeEditorProps, 'monaco'>

export default function MonacoEditor({ style, ...props }: MonacoEditorProps) {
  const editorRef = React.useRef<{ editor: any }>(null)
  const [isFullScreen, setFullScreen] = React.useState(false)
  const [rect, setRect] = React.useState({ width: 0, height: 0 })

  const { defaultValue } = props
  const options = props.options as any
  React.useEffect(() => {
    if (editorRef.current) {
      if (options) editorRef.current.editor.updateOptions(options)
      if (defaultValue || defaultValue === '') {
        editorRef.current.editor.setValue(defaultValue)
      }
    }
  }, [defaultValue, options?.readOnly])

  const { FontSizeReset } = useClassNames()

  function handleEscKey(evt: React.KeyboardEvent<HTMLElement>) {
    if (evt.code === 'Escape' && isFullScreen) {
      editorRef.current.editor.layout({
        height: rect.height,
        width: rect.width,
      })
      setFullScreen(false)
    }
  }

  function handleFullScreen() {
    setFullScreen(!isFullScreen)
    if (editorRef.current) {
      if (isFullScreen) {
        editorRef.current.editor.layout({
          height: rect.height,
          width: rect.width,
        })
      } else {
        const originRect: DOMRect = editorRef.current.editor._domElement.getBoundingClientRect()
        setRect({ width: originRect.width, height: originRect.height })
        editorRef.current.editor.layout({
          height: document.body.clientHeight,
          width: document.body.clientWidth,
        })
      }
    }
  }

  return monaco ? (
    <section
      className={`monaco-section ${isFullScreen && 'monaco-section-full-screen'}`}
      style={{ ...style, height: props.height, width: props.width, position: 'relative' }}
      onKeyUp={handleEscKey}
    >
      <Icon
        className='monaco-full-screen-icon'
        type={isFullScreen ? 'fullscreenquit' : 'fullscreen'}
        size='l'
        onClick={handleFullScreen}
      />
      <CodeEditor monaco={monaco} {...props} ref={editorRef} />
    </section>
  ) : (
    <Status
      icon='loading'
      size={'l'}
      description={
        <>
          <Icon type='loading' />
          &nbsp;{'编辑器正在加载中...'}
        </>
      }
      className={FontSizeReset}
      style={{
        maxWidth: 'none',
        ...style,
        height: props.height,
        width: props.width,
      }}
    />
  )
}
