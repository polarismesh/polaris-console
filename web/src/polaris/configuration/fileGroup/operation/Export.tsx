import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'

import React, { useState } from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import { Form, Select, Segment, Table } from 'tea-component'
import { selectable } from 'tea-component/lib/table/addons'
import ExportDuck from './ExportDuck'

const segmentOptions = [
  {
    value: '*',
    text: '全部导出',
  },
  {
    value: 'partial',
    text: '导出选中配置分组',
  },
]

const ExportForm = purify(function ExportForm(props: DuckCmpProps<ExportDuck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selectors,
  } = duck
  const formApi = form.getAPI(store, dispatch)
  const { namespace, groups, exportType } = formApi.getFields(['namespace', 'groups', 'exportType'])

  const options = selectors.options(store)
  console.log(options)

  const exportTypeValue = exportType.getValue()
  return (
    <>
      <Form>
        <FormField field={namespace} label='命名空间' required>
          <Select
            value={namespace.getValue()}
            options={options?.namespaceList ?? []}
            onChange={value => namespace.setValue(value)}
            type={'simulate'}
            appearance={'button'}
            size='l'
          ></Select>
        </FormField>
        <FormField field={groups} label='文件'>
          <Segment options={segmentOptions} value={exportTypeValue} onChange={value => exportType.setValue(value)} />
          {exportTypeValue === 'partial' && <ConfigFileGroupTable duck={duck} dispatch={dispatch} store={store} />}
        </FormField>
      </Form>
    </>
  )
})

// {
//   "id": "280",
//   "name": "polaris-config-example",
//   "namespace": "default",
//   "comment": "",
//   "createTime": "2023-03-27 00:00:07",
//   "createBy": "polaris",
//   "modifyTime": "2023-03-27 00:00:07",
//   "modifyBy": "polaris",
//   "fileCount": "2",
//   "user_ids": [],
//   "group_ids": [],
//   "remove_user_ids": [],
//   "remove_group_ids": [],
//   "editable": true,
//   "owner": "polaris"
// }

const ConfigFileGroupTable = purify(function ConfigFileGroupTable(props: DuckCmpProps<ExportDuck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selectors,
  } = duck

  const formApi = form.getAPI(store, dispatch)
  const { groups } = formApi.getFields(['groups'])
  const options = selectors.options(store)

  // 当前选中的消息
  const [selectedKeys, setSelectedKeys] = useState([])
  const addons = [
    selectable({
      value: selectedKeys,
      onChange: (value, context) => {
        console.log(value, context)
        setSelectedKeys(value)
      },
    }),
  ]

  return (
    <Table
      bordered
      style={{ marginTop: '16px' }}
      recordKey='id'
      records={options?.configFileGroupList || []}
      columns={[
        {
          key: 'name',
          header: '名称',
        },
        {
          key: 'fileCount',
          header: '配置文件数',
        },
        {
          key: 'createTime',
          header: '创建时间',
        },
      ]}
      addons={addons}
    />
  )
})

export default function Export(props: DuckCmpProps<ExportDuck>) {
  const { duck, store, dispatch } = props
  const { selectors } = duck
  const visible = selectors.visible(store)
  if (!visible) {
    return <noscript />
  }
  const data = selectors.data(store)

  return (
    <Dialog duck={duck} store={store} dispatch={dispatch} size='l' title='导出'>
      <ExportForm duck={duck} store={store} dispatch={dispatch} />
    </Dialog>
  )
}
