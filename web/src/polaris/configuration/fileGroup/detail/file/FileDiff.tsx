import React from 'react'
import { MonacoEditor, Row, Col } from 'tea-component'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

const { DiffEditor } = MonacoEditor
interface Props {
  original: string
  now: string
  format: string
}
export default function FileDiff(props: Props) {
  const { original, now, format } = props
  return (
    <section>
      <Row style={{ margin: '10px 0px' }}>
        <Col>当前发布</Col>
        <Col>历史发布</Col>
      </Row>
      <DiffEditor monaco={monaco} height={400} language={format} original={original} value={now} />
    </section>
  )
}
