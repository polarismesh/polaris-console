import BasicLayout from '../common/components/BaseLayout'
import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ServicePageDuck, { EmptyCustomFilter } from './PageDuck'
import { Button, Card, Justify, Table, FormItem, Form, FormText, TagSearchBox, Bubble } from 'tea-component'
import GridPageGrid from '../common/duckComponents/GridPageGrid'
import GridPagePagination from '../common/duckComponents/GridPagePagination'
import getColumns, { disableDeleteTip } from './getColumns'
import { selectable, expandable, filterable } from 'tea-component/lib/table/addons'
import insertCSS from '../common/helpers/insertCSS'
import csvColumns from './csvColumns'
import { enableNearbyString } from './operation/CreateDuck'
import { checkGlobalRegistry, isReadOnly, showAllLabels } from './utils'
import MetadataSelectPanel from '../common/components/MetadataSelectPanel'
import { replaceTags } from '../configuration/utils'
import { useServerConfig } from '../common/util/serverConfig'

insertCSS(
  'service',
  `
.justify-search{
  margin-right:20px
}
.justify-button{
  vertical-align: bottom
}
`,
)

export const DefaultServiceTagAttribute = {
  type: 'input',
  key: 'serviceName',
  name: '服务名',
}
export const NamespaceTagKey = 'namespace'
export const ServiceNameTagKey = 'serviceName'
export const MetadataTagKey = 'serviceTag'
export const HideEmptyServiceTagKey = 'hideEmptyService'

function getTagAttributes(props: DuckCmpProps<ServicePageDuck>) {
  const { duck, store } = props
  const { namespaceList, customFilters } = duck.selector(store)
  return [
    {
      type: 'single',
      key: NamespaceTagKey,
      name: '命名空间',
      values: namespaceList,
    },
    {
      type: 'input',
      key: ServiceNameTagKey,
      name: '服务名',
    },
    {
      type: 'input',
      key: 'department',
      name: '部门',
    },
    {
      type: 'input',
      key: 'business',
      name: '业务',
    },
    {
      type: 'input',
      key: 'instanceIp',
      name: '实例IP',
    },
    {
      type: 'render',
      key: MetadataTagKey,
      name: '标签',
      render: ({ onSelect }) => {
        return (
          <MetadataSelectPanel
            metadata={[customFilters.serviceTag] || []}
            onOk={newMetadata => {
              onSelect(newMetadata)
            }}
          ></MetadataSelectPanel>
        )
      },
    },
    // {
    //   type: 'single',
    //   key: HideEmptyServiceTagKey,
    //   name: '隐藏空服务',
    //   values: [
    //     {
    //       name: '是',
    //       value: true,
    //     },
    //     {
    //       name: '否',
    //       value: false,
    //     },
    //   ],
    //   reusable: false,
    // },
  ]
}
export default function ServicePage(props: DuckCmpProps<ServicePageDuck>) {
  const { duck, store, dispatch } = props
  const { creators, selector } = duck
  const handlers = React.useMemo(
    () => ({
      reload: () => dispatch(creators.reload()),
      export: () => dispatch(creators.export(csvColumns, 'service-list')),
      search: () => dispatch(creators.search('')),
      setCustomFilters: filters => dispatch(creators.setCustomFilters(filters)),
      clear: () => dispatch(creators.setCustomFilters(EmptyCustomFilter)),
      create: () => dispatch(creators.create()),
      select: payload => dispatch(creators.setSelection(payload)),
      remove: payload => dispatch(creators.remove(payload)),
      setExpandedKeys: payload => dispatch(creators.setExpandedKeys(payload)),
      changeTags: payload => dispatch(creators.changeTags(payload)),
      setSyncToGlobalRegistry: payload => dispatch(creators.setSyncToGlobalRegistry(payload)),
    }),
    [],
  )
  const columns = React.useMemo(() => getColumns(props), [])
  const {
    customFilters,
    selection,
    namespaceList,
    expandedKeys,
    tags,
    sync_to_global_registry,
    grid: { list },
  } = selector(store)
  const multiRegConfig = useServerConfig('multiregistries')
  const multiRegConfigEnabled = multiRegConfig?.open
  return (
    <BasicLayout title={'服务列表'} store={store} selectors={duck.selectors} header={<></>}>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              <Button type={'primary'} onClick={handlers.create}>
                新建
              </Button>
              <Button
                onClick={() => handlers.remove(selection.map(id => list.find(service => id === service.id)))}
                disabled={selection.length === 0}
              >
                删除
              </Button>
            </>
          }
          right={
            <>
              <TagSearchBox
                attributes={getTagAttributes(props) as any}
                style={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  width: '400px',
                }}
                value={tags}
                onChange={value => handlers.changeTags(value)}
                tips={'请选择条件进行过滤'}
                hideHelp={true}
              />
              <Button type={'icon'} icon={'refresh'} onClick={handlers.reload}></Button>
            </>
          }
        />
      </Table.ActionPanel>
      <Card>
        <GridPageGrid
          duck={duck}
          dispatch={dispatch}
          store={store}
          columns={columns.filter(item => {
            if (item.key === 'sync_to_global_registry') {
              return multiRegConfigEnabled
            }
            return true
          })}
          addons={[
            filterable({
              type: 'single',
              column: 'sync_to_global_registry',
              searchable: true,
              value: sync_to_global_registry,
              onChange: value => handlers.setSyncToGlobalRegistry(value),
              all: {
                value: '',
                text: '全部',
              },
              options: [
                { text: '开启', value: 'true' },
                { text: '关闭', value: 'false' },
              ],
            }),
            selectable({
              all: true,
              value: selection,
              onChange: handlers.select,
              rowSelectable: (rowKey, { record }) =>
                !isReadOnly(record.namespace) && record.editable && !checkGlobalRegistry(record),
              render: (element, { record }) => {
                if (isReadOnly(record.namespace) || !record.editable || checkGlobalRegistry(record)) {
                  return (
                    <Bubble
                      content={
                        isReadOnly(record.namespace)
                          ? '该命名空间为只读的'
                          : !record.editable
                          ? '无权限'
                          : checkGlobalRegistry(record)
                          ? disableDeleteTip
                          : '编辑'
                      }
                    >
                      {element}
                    </Bubble>
                  )
                }
                return <>{element}</>
              },
            }),
            expandable({
              // 已经展开的产品
              expandedKeys,
              // 发生展开行为时，回调更新展开键值
              onExpandedKeysChange: keys => handlers.setExpandedKeys(keys),
              render: record => {
                const labelList = Object.keys(record.metadata || {})
                return (
                  <Form>
                    <FormItem label='服务标签'>
                      <FormText>
                        {labelList
                          .slice(0, 5)
                          .map(item => `${item}:${record.metadata[item]}`)
                          .join(' ; ' || '-')}
                        {labelList.length > 5 && '...'}
                        {labelList.length > 5 && (
                          <Button onClick={() => showAllLabels(record.metadata)} type='link'>
                            展示全部
                          </Button>
                        )}
                      </FormText>
                    </FormItem>
                    <FormItem label='描述'>
                      <FormText>{record.comment || '-'}</FormText>
                    </FormItem>
                    <FormItem label='就近访问'>
                      <FormText>{record.metadata?.[enableNearbyString] ? '开启' : '关闭'}</FormText>
                    </FormItem>
                  </Form>
                )
              },
            }),
            filterable({
              type: 'single',
              column: 'namespace',
              value: customFilters.namespace,
              searchable: true,
              onChange: value => {
                const replacedTags = replaceTags(NamespaceTagKey, value, tags, namespaceList, {
                  type: 'single',
                  key: NamespaceTagKey,
                  name: '命名空间',
                  values: namespaceList,
                })
                handlers.changeTags(replacedTags)
              },
              all: {
                text: '全部',
                value: '',
              },
              // 选项列表
              options: namespaceList,
            }),
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </BasicLayout>
  )
}
