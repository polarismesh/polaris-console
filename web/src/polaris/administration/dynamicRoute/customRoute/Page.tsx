import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import AccessLimitingDuck from './PageDuck'
import BasicLayout from '@src/polaris/common/components/BaseLayout'
import { Card, Table, Justify, Button, SearchBox } from 'tea-component'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import { filterable, sortable } from 'tea-component/lib/table/addons'
import { StatusOptions } from '../../accessLimiting/types'

export default purify(function AccessLimitingPage(props: DuckCmpProps<AccessLimitingDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators } = duck
  const { loadData, fullColumns: columns, status, sort } = selector(store)

  const handlers = React.useMemo(
    () => ({
      changeNamespace: namespace => dispatch(creators.changeNamespace(namespace)),
      changeService: service => dispatch(creators.changeService(service)),
      changeStatus: status => dispatch(creators.changeStatus(status)),
      changeName: name => dispatch(creators.changeName(name)),
      jumpToCreateRulePage: () => dispatch(creators.create()),
      setSort: sort => dispatch(creators.setSort(sort)),
    }),
    [],
  )

  return (
    <BasicLayout
      title={'自定义路由'}
      store={store}
      selectors={duck.selectors}
      header={<></>}
      type={!!loadData ? 'fregment' : 'page'}
    >
      <Table.ActionPanel>
        <Justify
          left={
            <Button type='primary' onClick={handlers.jumpToCreateRulePage}>
              新建路由规则
            </Button>
          }
          right={
            <>
              <SearchBox
                placeholder='请输入规则名过滤'
                onSearch={value => handlers.changeName(value)}
                onClear={() => handlers.changeName('')}
              />
            </>
          }
        />
      </Table.ActionPanel>
      <Card>
        <GridPageGrid
          duck={duck}
          dispatch={dispatch}
          store={store}
          columns={!!loadData ? columns.filter(item => item.key !== 'namespace' && item.key !== 'service') : columns}
          addons={[
            filterable({
              type: 'single',
              column: 'enable',
              value: status,
              onChange: value => handlers.changeStatus(value),
              all: {
                value: '',
                text: '全部',
              },
              options: StatusOptions,
            }),
            sortable({
              columns: ['priority'],
              value: sort,
              onChange: value => handlers.setSort(value.length ? value : []),
            }),
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </BasicLayout>
  )
})
