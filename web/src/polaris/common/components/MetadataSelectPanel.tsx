import * as React from 'react'
import { purify } from 'saga-duck'
import { Card, Input, Button } from 'tea-component'

interface Props {
  metadata: { key: string; value: string }[]
  onOk: Function
}
export default purify(function(props: Props) {
  const { metadata: originMetadata, onOk = () => {} } = props
  const [metadata, setMetadata] = React.useState(originMetadata)
  return (
    <Card>
      <Card.Body>
        {metadata.map((x, recordIndex) => (
          <section key={recordIndex}>
            <Input
              placeholder={'请输入标签键'}
              value={x.key}
              onChange={value => {
                const newMetadata = [...metadata]
                const kv = metadata[recordIndex]
                newMetadata.splice(recordIndex, 1, {
                  key: value,
                  value: kv.value,
                })
                setMetadata(newMetadata)
              }}
              size={'m'}
              style={{ marginRight: '20px', width: '150px' }}
            ></Input>
            <Input
              size={'m'}
              placeholder={'请输入标签值'}
              value={x.value}
              onChange={value => {
                const newMetadata = [...metadata]
                const kv = metadata[recordIndex]
                newMetadata.splice(recordIndex, 1, {
                  key: kv.key,
                  value: value,
                })
                setMetadata(newMetadata)
              }}
              style={{ marginRight: '20px', width: '150px' }}
            ></Input>
          </section>
        ))}
        <Button
          type={'primary'}
          onClick={() => {
            onOk(metadata.map(item => ({ ...item, name: `${item.key}:${item.value}` })))
          }}
          style={{ marginTop: '20px' }}
          disabled={!metadata?.[0]?.key || !metadata?.[0]?.value}
          tooltip={!metadata?.[0]?.key || !metadata?.[0]?.value ? '请输入完整键值对' : ''}
        >
          {'确认'}
        </Button>
      </Card.Body>
    </Card>
  )
})
