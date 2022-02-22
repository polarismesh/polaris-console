import React from 'react'
import { MonacoEditor } from 'tea-component'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

const { DiffEditor } = MonacoEditor
interface Props {
  original: string
  now: string
  format: string
}
export default function FileDiff(props: Props) {
  const { original, now, format } = props
  return <DiffEditor monaco={monaco} height={400} language={format} original={original} value={now} />
}
