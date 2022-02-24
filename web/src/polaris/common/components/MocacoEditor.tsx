import * as React from 'react'
import {
  MonacoEditor as CodeEditor,
  MonacoEditorProps as CodeEditorProps,
  Status,
  useClassNames,
  Icon,
} from 'tea-component'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import insertCSS from '../helpers/insertCSS'
insertCSS(
  'monaco-section',
  `
.monaco-section .app-tsf-alert__info{
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}`,
)

type MonacoEditorProps = Omit<CodeEditorProps, 'monaco'>

export default function MonacoEditor({ style, ...props }: MonacoEditorProps) {
  const editorRef = React.useRef<{ editor: any }>(null)

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
  return monaco ? (
    <section
      className='monaco-section'
      style={{ ...style, height: props.height, width: props.width, position: 'relative' }}
    >
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
