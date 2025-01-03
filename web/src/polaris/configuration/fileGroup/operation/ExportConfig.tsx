import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'

import React from 'react'
import { DuckCmpProps, memorize, purify } from 'saga-duck'
import { Form, Select, Segment, Table } from 'tea-component'
import { autotip, selectable } from 'tea-component/lib/table/addons'
import ExportConfigDuck from './ExportConfigDuck'

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

const getHandlers = memorize(({ creators }: ExportConfigDuck, dispatch) => ({
  changeNamespace: v => dispatch(creators.changeNamespace(v)),
}))
const ExportConfigForm = purify(function ExportConfigForm(props: DuckCmpProps<ExportConfigDuck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selectors,
  } = duck
  const formApi = form.getAPI(store, dispatch)
  const handlers = getHandlers(props)

  const { namespace, groups, exportType } = formApi.getFields(['namespace', 'groups', 'exportType'])

  const options = selectors.options(store)

  const exportTypeValue = exportType.getValue()
  return (
    <>
      <Form>
        <FormField field={namespace} label='命名空间' required>
          <Select
            searchable
            value={namespace.getValue()}
            options={options?.namespaceList ?? []}
            onChange={value => handlers.changeNamespace(value)}
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

const ConfigFileGroupTable = purify(function ConfigFileGroupTable(props: DuckCmpProps<ExportConfigDuck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selectors,
  } = duck

  const formApi = form.getAPI(store, dispatch)
  const { groups } = formApi.getFields(['groups'])
  const options = selectors.options(store)

  const addons = [
    selectable({
      value: groups.asArray().getValue(),
      onChange: (value: string[]) => {
        groups.setValue(value)
      },
    }),
    autotip({
      emptyText: '暂无分组',
    }),
  ]

  return (
    <Table
      bordered
      style={{ marginTop: '16px' }}
      recordKey='name'
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

export default function ExportConfig(props: DuckCmpProps<ExportConfigDuck>) {
  const { duck, store, dispatch } = props
  const { selectors } = duck
  const visible = selectors.visible(store)
  if (!visible) {
    return <noscript />
  }

  return (
    <Dialog duck={duck} store={store} dispatch={dispatch} size='l' title='导出'>
      <ExportConfigForm duck={duck} store={store} dispatch={dispatch} />
    </Dialog>
  )
}
