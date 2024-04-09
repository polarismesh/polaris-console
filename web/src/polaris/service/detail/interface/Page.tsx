import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import ServiceAliasDuck from './PageDuck'
import { Table, Button, Justify, Card, Text, Select } from 'tea-component'
import { autotip, pageable, selectable } from 'tea-component/lib/table/addons'
import getColumns from './getColumns'
import csvColumns from './csvColumns'
const getHandlers = memorize(({ creators }: ServiceAliasDuck, dispatch) => ({
  reload: () => dispatch(creators.reload()),
  create: () => dispatch(creators.create()),
  remove: payload => dispatch(creators.remove(payload)),
  setSelection: payload => dispatch(creators.setSelection(payload)),
  selectContractVersion: payload => dispatch(creators.selectContractVersion(payload)),
  export: (columns, name) => dispatch(creators.export(columns, name)),
  exportJSON: () => dispatch(creators.exportJSON()),
}))
export default function InterfacePage(props: DuckCmpProps<ServiceAliasDuck>) {
  const { duck, store, dispatch } = props
  const { selector } = duck
  const handlers = getHandlers(props)
  const {
    grid: { list },
  } = selector(store)
  const columns = getColumns(props)
  const { selection, selectedVersion, contractVersionList } = selector(store)
  return (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <section style={{ marginBottom: '15px' }}>
              <Text reset theme={'label'} style={{ verticalAlign: 'middle', marginRight: '15px' }}>
                请选择接口版本
              </Text>
              <Select
                searchable
                appearance={'button'}
                onChange={handlers.selectContractVersion}
                value={selectedVersion}
                options={contractVersionList}
                size={'l'}
                matchButtonWidth
              />
            </section>
          }
        ></Justify>
        <Justify
          left={
            <>
              <Button type='primary' onClick={() => handlers.exportJSON()}>
                {'导出'}
              </Button>
              <Button onClick={() => handlers.remove(selection)} disabled={selection?.length === 0}>
                {'批量删除'}
              </Button>
            </>
          }
          right={
            <>
              <Button type={'icon'} icon={'refresh'} onClick={handlers.reload}></Button>
              <Button
                type={'icon'}
                icon={'download'}
                onClick={() =>
                  dispatch(handlers.export(csvColumns, `${selectedVersion.split('=>').join('_')}_interface_list`))
                }
              ></Button>
            </>
          }
        />
      </Table.ActionPanel>
      <Card bordered>
        <Table
          recordKey={'id'}
          records={list}
          columns={columns}
          addons={[
            selectable({
              all: true,
              value: selection,
              onChange: handlers.setSelection,
            }),
            pageable({}),
            autotip({}),
          ]}
        />
      </Card>
    </>
  )
}
