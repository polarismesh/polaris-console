import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import CustomRouteDuck from './PageDuck'
import BasicLayout from '@src/polaris/common/components/BaseLayout'
import { Card, Table, Justify, Button, TagSearchBox, Segment, Switch, Form, FormItem } from 'tea-component'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import { filterable, sortable } from 'tea-component/lib/table/addons'
import { StatusOptions } from '../../accessLimiting/types'
import getColumns from './getColumns'
import { enableNearbyString } from '@src/polaris/service/operation/CreateDuck'
import { FeatureDisplayType, useCheckFeatureValid } from '@src/polaris/common/util/checkFeature'

export enum TagSearchType {
  RuleName = 'name',
  SourceNamespace = 'source_namespace',
  SourceService = 'source_service',
  DestNamespace = 'destination_namespace',
  DestService = 'destination_service',
}

function getTagAttributes() {
  return [
    {
      type: 'input',
      key: TagSearchType.RuleName,
      name: '规则名',
    },
    {
      type: 'input',
      key: TagSearchType.SourceNamespace,
      name: '主调命名空间',
    },
    {
      type: 'input',
      key: TagSearchType.SourceService,
      name: '主调服务',
    },
    {
      type: 'input',
      key: TagSearchType.DestNamespace,
      name: '被调命名空间',
    },
    {
      type: 'input',
      key: TagSearchType.DestService,
      name: '被调服务',
    },
  ]
}

export default purify(function CustomRoutePage(props: DuckCmpProps<CustomRouteDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators } = duck
  const { loadData, status, sort, serviceData } = selector(store)
  const columns = getColumns(duck, store)
  const handlers = React.useMemo(
    () => ({
      changeNamespace: namespace => dispatch(creators.changeNamespace(namespace)),
      changeService: service => dispatch(creators.changeService(service)),
      changeStatus: status => dispatch(creators.changeStatus(status)),
      changeName: name => dispatch(creators.changeName(name)),
      changeTags: tags => dispatch(creators.changeTags(tags)),
      changeNearby: () => dispatch(creators.changeNearby()),
      jumpToCreateRulePage: () => dispatch(creators.create()),
      setSort: sort => dispatch(creators.setSort(sort)),
    }),
    [],
  )
  const inService = !!loadData
  const [showType, setShowType] = React.useState('router')
  const [routerFeature] = useCheckFeatureValid(['router'])
  const isRouterEnable = routerFeature ? routerFeature?.display === FeatureDisplayType.visible : true
  const customRouteComponent = (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <Button type='primary' onClick={handlers.jumpToCreateRulePage}>
              新建路由规则
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
                tips={'请选择条件进行过滤'}
                hideHelp={true}
              />
              <Button
                type={'icon'}
                icon={'refresh'}
                onClick={() => {
                  dispatch(creators.reload())
                }}
              ></Button>
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
    </>
  )
  React.useEffect(() => {
    setShowType(isRouterEnable ? 'router' : '')
  }, [isRouterEnable])
  return (
    <BasicLayout
      title={'自定义路由'}
      store={store}
      selectors={duck.selectors}
      header={<></>}
      type={inService ? 'fregment' : 'page'}
    >
      {inService && (
        <>
          <Segment
            style={{ marginBottom: '20px' }}
            value={showType}
            options={[
              {
                text: '自定义路由',
                value: 'router',
                disabled: !isRouterEnable,
                tooltip: routerFeature?.tip,
              },
              {
                text: '就近路由',
                value: 'router-nearby',
                disabled: !isRouterEnable,
                tooltip: routerFeature?.tip,
              },
            ]}
            onChange={v => {
              setShowType(v)
            }}
          ></Segment>
          {showType === 'router' && customRouteComponent}
          {showType === 'router-nearby' && (
            <Card>
              <Card.Body>
                <Form>
                  <FormItem label={'就近路由'}>
                    <Switch
                      value={serviceData?.metadata?.[enableNearbyString] ? true : false}
                      onChange={() => {
                        handlers.changeNearby()
                      }}
                    ></Switch>
                  </FormItem>
                </Form>
              </Card.Body>
            </Card>
          )}
          {!showType && (
            <Card>
              <Card.Body>暂时不支持路由功能</Card.Body>
            </Card>
          )}
        </>
      )}
      {!inService && customRouteComponent}
    </BasicLayout>
  )
})
