import { KeyValuePair } from '@src/polaris/configuration/fileGroup/types'
import React from 'react'
import { Button, Table, FormControl } from 'tea-component'
import Input from '@src/polaris/common/duckComponents/form/Input'
import { FieldAPI } from '../ducks/Form'

export interface ITagTableProps {
  tags: FieldAPI<KeyValuePair[]>
}

export function TagTable(props: ITagTableProps) {
  return (
    <Table
      verticalTop
      records={[...props.tags.asArray()]}
      columns={[
        {
          key: 'tagName',
          header: '标签名',
          width: '250px',
          render: item => {
            const { key } = item.getFields(['key'])
            const validate = key.getTouched() && key.getError()
            return (
              <>
                <FormControl
                  status={validate ? 'error' : null}
                  message={validate ? key.getError() : ''}
                  showStatusIcon={false}
                  style={{ padding: 0, display: 'block' }}
                >
                  <Input size='m' field={key} placeholder='key 最长不超过128个字符' />
                </FormControl>
              </>
            )
          },
        },
        {
          key: 'tagValue',
          header: '标签值',
          render: item => {
            const { value } = item.getFields(['value'])
            const validate = value.getTouched() && value.getError()
            return (
              <>
                <FormControl
                  status={validate ? 'error' : null}
                  message={validate ? value.getError() : ''}
                  showStatusIcon={false}
                  style={{ padding: 0, display: 'block' }}
                >
                  <Input size='m' field={value} placeholder='value 最长不超过4096个字符' />
                </FormControl>
              </>
            )
          },
        },
        {
          key: 'close',
          header: '删除',
          width: '50px',
          render: (item, rowKey, recordIndex) => {
            const index = Number(recordIndex)
            // const length = [...props.tags.asArray()].length
            return (
              <>
                <Button
                  title={'删除'}
                  icon={'close'}
                  onClick={() => props.tags.asArray().remove(index)}
                />
              </>
            )
          },
        },
      ]}
      bordered
      bottomTip={
        <Button
          type='link'
          onClick={() => {
            props.tags.asArray().push({
              key: '',
              value: '',
            })
          }}
        >
          新增
        </Button>
      }
    />
  )
}
