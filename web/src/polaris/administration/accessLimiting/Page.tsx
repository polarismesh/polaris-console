import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import AccessLimitingDuck from './PageDuck'
import BasicLayout from '@src/polaris/common/components/BaseLayout'
import { Card, Table, Justify, Button, SearchBox } from 'tea-component'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import { filterable } from 'tea-component/lib/table/addons'
import { StatusOptions } from './types'
import { t } from 'i18next';

export default purify(function AccessLimitingPage(props: DuckCmpProps<AccessLimitingDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators } = duck
  const { loadData, fullColumns: columns, namespaceList, namespace, serviceList, service, status } = selector(store)

  // 如果用户选择了某个namespace，服务的列表就要根据选择的这个namespace进行过滤
  const filteredServiceList = namespace
    ? serviceList && serviceList.filter((item: any) => item.namespace === namespace)
    : serviceList

  const handlers = React.useMemo(
    () => ({
      changeNamespace: namespace => dispatch(creators.changeNamespace(namespace)),
      changeService: service => dispatch(creators.changeService(service)),
      changeStatus: status => dispatch(creators.changeStatus(status)),
      changeName: name => dispatch(creators.changeName(name)),
      jumpToCreateRulePage: () => dispatch(creators.create()),
    }),
    [],
  )

  return (
    <BasicLayout
      title={t('访问限流')}
      store={store}
      selectors={duck.selectors}
      header={<></>}
      type={!!loadData ? 'fregment' : 'page'}
    >
      <Table.ActionPanel>
        <Justify
          left={
            <Button type='primary' onClick={handlers.jumpToCreateRulePage}>
              {t('新建限流规则')}
            </Button>
          }
          right={
            <>
              <SearchBox
                placeholder={t('请输入规则名过滤')}
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
              column: 'namespace',
              value: namespace,
              onChange: value => {
                handlers.changeNamespace(value)
                handlers.changeService('')
              },
              all: {
                value: '',
                text: t('全部'),
              },
              options: namespaceList,
            }),
            filterable({
              type: 'single',
              column: 'service',
              value: service,
              onChange: value => handlers.changeService(value),
              all: {
                value: '',
                text: t('全部'),
              },
              options: filteredServiceList,
            }),
            filterable({
              type: 'single',
              column: 'disable',
              value: status,
              onChange: value => handlers.changeStatus(value),
              all: {
                value: '',
                text: t('全部'),
              },
              options: StatusOptions,
            }),
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </BasicLayout>
  )
})
