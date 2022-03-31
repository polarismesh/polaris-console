import * as React from 'react'
import { purify } from 'saga-duck'
import { Card, Input, Button } from 'tea-component'
import { KeyValuePair } from '@src/polaris/configuration/fileGroup/types'

interface Props {
  metadata: KeyValuePair[]
  onOk: Function
  tagKeyOnly?: boolean
}
export default purify(function(props: Props) {
  const { metadata: originMetadata, onOk = () => {}, tagKeyOnly = false } = props
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
              style={{ marginRight: '20px', width: '150px', marginTop: '10px' }}
            ></Input>
            {!tagKeyOnly && (
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
                style={{ marginRight: '20px', width: '150px', marginTop: '10px' }}
              ></Input>
            )}
          </section>
        ))}
        <Button
          type={'primary'}
          onClick={() => {
            onOk(metadata.map(item => ({ ...item, name: `${item.key}${item.value ? ':' + item.value : ''}` })))
          }}
          style={{ marginTop: '20px' }}
          disabled={!metadata?.[0]?.key || (!tagKeyOnly && !metadata?.[0]?.value)}
          tooltip={!metadata?.[0]?.key || (!tagKeyOnly && !metadata?.[0]?.value) ? '请输入完整键值对' : ''}
        >
          {'确认'}
        </Button>
      </Card.Body>
    </Card>
  )
})
