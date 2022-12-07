import BasicLayout from '../common/components/BaseLayout'
import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ServicePageDuck, { EmptyCustomFilter } from './PageDuck'
import { Button, Card, Justify, Table, TagSearchBox, Input, Segment } from 'tea-component'
import GridPageGrid from '../common/duckComponents/GridPageGrid'
import GridPagePagination from '../common/duckComponents/GridPagePagination'
import getColumns from './getColumns'
import { filterable } from 'tea-component/lib/table/addons'
import insertCSS from '../common/helpers/insertCSS'
import { replaceTags } from '../configuration/utils'
import { NamespaceTagKey } from '../service/Page'
import { RangePicker } from 'tea-component/lib/datepicker/RangePicker'
import moment from 'moment'

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

export const ResourceNameTag = 'resource_name'
export const DefaultAuditTagAttribute = {
  type: 'input',
  key: ResourceNameTag,
  name: '资源名称',
}
export const OperationTypeList = [
  { text: '创建', value: 'create' },
  { text: '更新', value: 'update' },
  { text: '删除', value: 'delete' },
]
export const OperationTypeMap = OperationTypeList.reduce((prev, curr) => {
  return (curr[prev.value] = prev.text)
}, {} as any)
function getTagAttributes(props: DuckCmpProps<ServicePageDuck>) {
  const { duck, store } = props
  const { namespaceList, customFilters, resourceTypeList } = duck.selector(store)
  return [
    {
      type: 'single',
      key: NamespaceTagKey,
      name: '命名空间',
      values: namespaceList,
    },
    {
      type: 'input',
      key: ResourceNameTag,
      name: '资源名称',
    },

    {
      type: 'single',
      key: 'resource_type',
      name: '资源类型',
      values: resourceTypeList,
    },
    {
      type: 'single',
      key: 'operation_type',
      name: '操作类型',
      values: OperationTypeList,
    },
    {
      type: 'render',
      key: 'operation_detail',
      name: '操作细节',
      render: ({ onSelect }) => {
        return (
          <Card>
            <Card.Body>
              <Input.TextArea
                value={customFilters.operation_detail}
                onChange={(v) => onSelect(v)}
                rows={6}
              ></Input.TextArea>
            </Card.Body>
          </Card>
        )
      },
    },
    {
      type: 'input',
      key: 'operator',
      name: '操作人',
    },
  ]
}
export default function ServicePage(props: DuckCmpProps<ServicePageDuck>) {
  const { duck, store, dispatch } = props
  const { creators, selector } = duck
  const handlers = React.useMemo(
    () => ({
      reload: () => dispatch(creators.reload()),
      setCustomFilters: (filters) => dispatch(creators.setCustomFilters(filters)),
      clear: () => dispatch(creators.setCustomFilters(EmptyCustomFilter)),
      changeTags: (payload) => dispatch(creators.changeTags(payload)),
      setFilterTime: (payload) => dispatch(creators.setFilterTime(payload)),
    }),
    [],
  )
  const columns = React.useMemo(() => getColumns(props), [])
  const { customFilters, namespaceList, tags } = selector(store)
  const [timePickerIndex, setTimePickerIndex] = React.useState('7')
  return (
    <BasicLayout title={'服务列表'} store={store} selectors={duck.selectors} header={<></>}>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              <Segment
                options={[
                  {
                    text: '近7天',
                    value: '7',
                  },
                  {
                    text: '近30天',
                    value: '30',
                  },
                ]}
                value={timePickerIndex}
                onChange={(v) => {
                  setTimePickerIndex(v)
                  handlers.setFilterTime([moment().subtract(Number(v), 'd'), moment()])
                }}
              ></Segment>
              <RangePicker
                showTime
                onChange={(value) => {
                  setTimePickerIndex('-1')
                  handlers.setFilterTime(value)
                }}
              />
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
                onChange={(value) => handlers.changeTags(value)}
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
            filterable({
              type: 'single',
              column: 'namespace',
              value: customFilters.namespace,
              searchable: true,
              onChange: (value) => {
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
