import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ServicePageDuck, { EmptyCustomFilter } from './PageDuck'
import {
  Button,
  Card,
  Justify,
  Table,
  Text,
  Dropdown,
  List,
  FormItem,
  Form,
  FormText,
  Copy,
  TagSearchBox,
  notification,
  Bubble,
} from 'tea-component'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import getColumns, { getSourcePolairisIp } from './getColumns'
import { selectable, expandable, filterable } from 'tea-component/lib/table/addons'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import csvColumns from './csvColumns'
import { HEALTH_STATUS, HEALTH_STATUS_MAP, ISOLATE_STATUS_MAP, ISOLATE_STATUS, HEALTH_CHECK_METHOD_MAP } from './types'
import { checkGlobalRegistry, isReadOnly, showAllLabels } from '../../utils'
import MetadataSelectPanel from '@src/polaris/common/components/MetadataSelectPanel'
import { replaceTags } from '@src/polaris/configuration/utils'
import { disableDeleteTip } from '../../getColumns'

insertCSS(
  'service-detail-instance',
  `
.justify-search{
  margin-right:20px;
  margin-top:40px;
}
.justify-button{
  vertical-align: bottom;
}

`,
)
insertCSS(
  'service-detail-input',
  `
  .input-style > .tea-input{
    width:200px;   
    text-align:left;
  }
  .input-style  {
    width:200px;
  }
  .tea-dropdown.input-style .tea-text-weak{
    color:black !important;
  }
`,
)

export const HealthStatusOptions = [
  {
    text: '全部',
    value: '__all__',
    key: '__all__',
    name: '全部',
  },
  {
    text: HEALTH_STATUS_MAP[HEALTH_STATUS.HEALTH].text,
    value: String(HEALTH_STATUS.HEALTH),
    key: String(HEALTH_STATUS.HEALTH),
    name: HEALTH_STATUS_MAP[HEALTH_STATUS.HEALTH].text,
  },
  {
    text: HEALTH_STATUS_MAP[HEALTH_STATUS.ABNORMAL].text,
    value: String(HEALTH_STATUS.ABNORMAL),
    key: String(HEALTH_STATUS.ABNORMAL),
    name: HEALTH_STATUS_MAP[HEALTH_STATUS.ABNORMAL].text,
  },
]

export const IsolateStatusOptions = [
  {
    text: '全部',
    value: '__all__',
    name: '全部',
    key: '__all__',
  },
  {
    text: ISOLATE_STATUS_MAP[ISOLATE_STATUS.ISOLATE].text,
    value: String(ISOLATE_STATUS.ISOLATE),
    name: ISOLATE_STATUS_MAP[ISOLATE_STATUS.ISOLATE].text,
    key: String(ISOLATE_STATUS.ISOLATE),
  },
  {
    text: ISOLATE_STATUS_MAP[ISOLATE_STATUS.UNISOLATED].text,
    value: String(ISOLATE_STATUS.UNISOLATED),
    name: ISOLATE_STATUS_MAP[ISOLATE_STATUS.UNISOLATED].text,
    key: String(ISOLATE_STATUS.UNISOLATED),
  },
]

export const HostTagKey = 'host'
export const MetadataTagKey = 'metadata'
export const HealthyTagKey = 'healthy'
export const IsolateTagKey = 'isolate'

export const DefaultHostTagAttribute = {
  type: 'input',
  key: HostTagKey,
  name: '实例IP',
}

function getTagAttributes(props: DuckCmpProps<ServicePageDuck>) {
  const { duck, store } = props
  const { customFilters } = duck.selector(store)
  return [
    {
      type: 'input',
      key: HostTagKey,
      name: '实例IP',
    },
    {
      type: 'input',
      key: 'protocol',
      name: '协议',
    },
    {
      type: 'input',
      key: 'version',
      name: '版本',
    },
    {
      type: 'single',
      key: HealthyTagKey,
      name: '健康状态',
      values: HealthStatusOptions,
    },
    {
      type: 'single',
      key: IsolateTagKey,
      name: '隔离状态',
      values: IsolateStatusOptions,
    },
    {
      type: 'render',
      key: MetadataTagKey,
      name: '标签',
      render: ({ onSelect }) => {
        return (
          <MetadataSelectPanel
            metadata={[customFilters.metadata] || []}
            onOk={newMetadata => {
              onSelect(newMetadata)
            }}
          ></MetadataSelectPanel>
        )
      },
    },
  ]
}
export default function ServiceInstancePage(props: DuckCmpProps<ServicePageDuck>) {
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
      modifyWeight: payload => dispatch(creators.modifyWeight(payload)),
      modifyHealthStatus: payload => dispatch(creators.modifyHealthStatus(payload)),
      modifyIsolateStatus: payload => dispatch(creators.modifyIsolateStatus(payload)),
      changeTags: payload => dispatch(creators.changeTags(payload)),
    }),
    [],
  )
  const columns = getColumns(props)
  const {
    customFilters,
    selection,
    expandedKeys,
    grid: { list },
    data: { namespace, editable, deleteable },
    tags,
  } = selector(store)

  return (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              <Button
                type={'primary'}
                onClick={handlers.create}
                disabled={isReadOnly(namespace) || !editable}
                tooltip={isReadOnly(namespace) ? '该命名空间为只读的' : !editable ? '无写权限' : '编辑'}
              >
                新建
              </Button>
              <Button
                onClick={() => handlers.remove(selection)}
                disabled={selection.length === 0 || !editable}
                tooltip={selection?.length === 0 ? '请选择实例' : !editable ? '无写权限' : ''}
              >
                删除
              </Button>
              <Dropdown
                clickClose={false}
                style={{ marginRight: 10 }}
                button={
                  <Button
                    disabled={selection?.length === 0 || deleteable === false}
                    tooltip={selection?.length === 0 ? '请选择实例' : deleteable === false ? '无写权限' : ''}
                  >
                    其他操作
                  </Button>
                }
                appearance='pure'
              >
                {close => (
                  <List type='option'>
                    {selection?.length === 0 ? (
                      <List.Item disabled={selection?.length === 0} tooltip={selection?.length === 0 && '请选择实例'}>
                        复制IP
                      </List.Item>
                    ) : (
                      <Copy
                        text={selection
                          .map(id => {
                            const item = list.find(item => id === item.id)
                            return `${item?.host}`
                          })
                          .join('\n')}
                        onCopy={(text, context) => {
                          if (context.result) notification.success({ description: '复制成功' })
                          else {
                            notification.error({ description: '复制失败' })
                          }
                        }}
                      >
                        <List.Item
                          onClick={() => {
                            close()
                          }}
                          disabled={selection?.length === 0}
                          tooltip={selection?.length === 0 && '请选择实例'}
                        >
                          复制IP
                        </List.Item>
                      </Copy>
                    )}
                    <List.Item
                      onClick={() => {
                        handlers.modifyWeight(selection)
                        close()
                      }}
                      disabled={selection?.length === 0}
                      tooltip={selection?.length === 0 && '请选择实例'}
                    >
                      修改权重
                    </List.Item>
                    <List.Item
                      onClick={() => {
                        handlers.modifyHealthStatus(selection)
                        close()
                      }}
                      disabled={selection?.length === 0}
                      tooltip={selection?.length === 0 && '请选择实例'}
                    >
                      修改健康状态
                    </List.Item>
                    <List.Item
                      onClick={() => {
                        handlers.modifyIsolateStatus(selection)
                        close()
                      }}
                      disabled={selection?.length === 0}
                      tooltip={selection?.length === 0 && '请选择实例'}
                    >
                      修改隔离状态
                    </List.Item>
                  </List>
                )}
              </Dropdown>
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
          columns={columns}
          addons={[
            selectable({
              all: true,
              value: selection,
              onChange: handlers.select,
              rowSelectable: (rowKey, { record }) => !isReadOnly(namespace) && editable && !checkGlobalRegistry(record),
              render: (element, { record }) => {
                if (isReadOnly(namespace) || !editable || checkGlobalRegistry(record)) {
                  return (
                    <Bubble
                      content={
                        isReadOnly(namespace)
                          ? '该命名空间为只读的'
                          : !editable
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
            filterable({
              type: 'single',
              column: 'healthy',
              value: customFilters.healthy,
              onChange: value => {
                const replacedTags = replaceTags(HealthyTagKey, value, tags, HealthStatusOptions, {
                  type: 'single',
                  key: 'healthy',
                  name: '健康状态',
                  values: HealthStatusOptions,
                })
                handlers.changeTags(replacedTags)
              },

              // 选项列表
              options: HealthStatusOptions,
            }),
            filterable({
              type: 'single',
              column: 'sourceIp',
              value: customFilters.sourceIp,
              all: {
                text: '全部',
                value: '',
              },
              onChange: value => {
                handlers.setCustomFilters({ ...customFilters, sourceIp: value })
              },
              options: [
                ...new Set(list.map(item => getSourcePolairisIp(item) as string).filter(item => item)),
              ].map(item => ({ text: item, value: item })),
            }),
            filterable({
              type: 'single',
              column: 'isolate',
              value: customFilters.isolate,
              onChange: value => {
                const replacedTags = replaceTags(IsolateTagKey, value, tags, IsolateStatusOptions, {
                  type: 'single',
                  key: 'isolate',
                  name: '隔离状态',
                  values: IsolateStatusOptions,
                })
                handlers.changeTags(replacedTags)
              },

              options: IsolateStatusOptions,
            }),
            expandable({
              // 已经展开的产品
              expandedKeys,
              // 发生展开行为时，回调更新展开键值
              onExpandedKeysChange: keys => handlers.setExpandedKeys(keys),
              render: record => {
                const labelList = Object.keys(record.metadata || {})
                return (
                  <>
                    <Form>
                      <FormItem label='实例ID'>
                        <FormText>
                          <Text tooltip={record.id}>{record.id}</Text>
                        </FormText>
                      </FormItem>
                      <FormItem label='健康检查'>
                        <FormText>{record.enableHealthCheck ? '开启' : '关闭'}</FormText>
                      </FormItem>
                      {record.enableHealthCheck && (
                        <FormItem label='健康检查方式'>
                          <FormText>
                            检查方式：
                            {HEALTH_CHECK_METHOD_MAP[record.healthCheck?.type].text}; TTL：
                            {`${record.healthCheck?.heartbeat?.ttl}秒`}
                          </FormText>
                        </FormItem>
                      )}
                      <FormItem label='实例标签'>
                        <FormText>
                          {labelList
                            .slice(0, 6)
                            .map(item => `${item}:${record.metadata[item]}`)
                            .join(' ; ') || '-'}
                          {labelList.length > 5 && '...'}
                          {labelList.length > 5 && (
                            <Button onClick={() => showAllLabels(record.metadata)} style={{ padding: '0px 5px' }}>
                              展示全部
                            </Button>
                          )}
                        </FormText>
                      </FormItem>
                    </Form>
                  </>
                )
              },
            }),
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </>
  )
}
