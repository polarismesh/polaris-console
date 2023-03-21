import { Trans, useTranslation } from 'react-i18next'
import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import CustomRouteDuck from './PageDuck'
import BasicLayout from '@src/polaris/common/components/BaseLayout'
import { Card, Table, Justify, Button, TagSearchBox } from 'tea-component'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import { filterable, sortable } from 'tea-component/lib/table/addons'
import { StatusOptions } from '../../accessLimiting/types'
import getColumns from './getColumns'

export enum TagSearchType {
  RuleName = 'name',
  SourceNamespace = 'source_namespace',
  SourceService = 'source_service',
  DestNamespace = 'destination_namespace',
  DestService = 'destination_service',
}

function getTagAttributes() {
  const { t } = useTranslation()

  return [
    {
      type: 'input',
      key: TagSearchType.RuleName,
      name: t('规则名'),
    },
    {
      type: 'input',
      key: TagSearchType.SourceNamespace,
      name: t('主调命名空间'),
    },
    {
      type: 'input',
      key: TagSearchType.SourceService,
      name: t('主调服务'),
    },
    {
      type: 'input',
      key: TagSearchType.DestNamespace,
      name: t('被调命名空间'),
    },
    {
      type: 'input',
      key: TagSearchType.DestService,
      name: t('被调服务'),
    },
  ]
}

export default purify(function CustomRoutePage(props: DuckCmpProps<CustomRouteDuck>) {
  const { t } = useTranslation()

  const { duck, store, dispatch } = props
  const { selector, creators } = duck
  const { loadData, status, sort } = selector(store)
  const columns = getColumns(duck, store)
  const handlers = React.useMemo(
    () => ({
      changeNamespace: namespace => dispatch(creators.changeNamespace(namespace)),
      changeService: service => dispatch(creators.changeService(service)),
      changeStatus: status => dispatch(creators.changeStatus(status)),
      changeName: name => dispatch(creators.changeName(name)),
      changeTags: tags => dispatch(creators.changeTags(tags)),
      jumpToCreateRulePage: () => dispatch(creators.create()),
      setSort: sort => dispatch(creators.setSort(sort)),
    }),
    [],
  )

  return (
    <BasicLayout
      title={t('自定义路由')}
      store={store}
      selectors={duck.selectors}
      header={<></>}
      type={!!loadData ? 'fregment' : 'page'}
    >
      <Table.ActionPanel>
        <Justify
          left={
            <Button type='primary' onClick={handlers.jumpToCreateRulePage}>
              <Trans>新建路由规则</Trans>
            </Button>
          }
          right={
            <>
              <TagSearchBox
                attributes={getTagAttributes() as any}
                style={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  width: '400px',
                }}
                onChange={value => handlers.changeTags(value)}
                tips={t('请选择条件进行过滤')}
                hideHelp={true}
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
                text: t('全部'),
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
