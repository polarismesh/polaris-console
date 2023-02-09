import { RouteDestinationArgument } from '@src/polaris/administration/dynamicRoute/customRoute/operations/CreateDuck'
import { RouteLabelMatchType } from '@src/polaris/administration/dynamicRoute/customRoute/types'
import * as React from 'react'
import { purify } from 'saga-duck'
import { Card, Input, Button } from 'tea-component'
import { FieldAPI } from '../ducks/Form'

interface Props {
  labelField: FieldAPI<RouteDestinationArgument>
  onOk: Function
}
export default purify(function(props: Props) {
  const { labelField, onOk = () => {} } = props
  const { key, type, value } = label.getFields(['key', 'type', 'value'])
  return (
    <Card>
      <Card.Body>
        <section>
          <Input
            placeholder={'请输入标签键'}
            value={key.getValue()}
            onChange={value => {
              key.setValue(value)
            }}
            size={'m'}
            style={{ marginRight: '20px', width: '150px', marginTop: '10px' }}
          ></Input>
        </section>
        <Button
          type={'primary'}
          onClick={() => {
            onOk(labels.map(item => ({ ...item, name: `${item.key}${item.value ? ':' + item.value : ''}` })))
          }}
          style={{ marginTop: '20px' }}
          disabled={!labels?.[0]?.key || !labels?.[0]?.value}
          tooltip={!labels?.[0]?.key || !labels?.[0]?.value ? '请输入完整标签' : ''}
        >
          {'确认'}
        </Button>
      </Card.Body>
    </Card>
  )
})
