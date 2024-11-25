import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import ServiceAliasDuck from './PageDuck'
import getColumns from './getColumns'
import { Table, Card, Justify, Button, TagSearchBox, Bubble } from 'tea-component'
import FieldManagerButton from '../common/duckComponents/FieldManager'
import GridPageGrid from '../common/duckComponents/GridPageGrid'
import { selectable, filterable } from 'tea-component/lib/table/addons'
import { replaceTags } from '../configuration/utils'
import GridPagePagination from '../common/duckComponents/GridPagePagination'
import { useFieldManager } from '../common/components/UseFieldManager'
import BasicLayout from '../common/components/BaseLayout'
import { disableDeleteTip } from '../service/getColumns'
import { checkGlobalRegistry } from '../service/utils'
const getHandlers = memorize(({ creators }: ServiceAliasDuck, dispatch) => ({
  reload: () => dispatch(creators.reload()),
  create: () => dispatch(creators.create()),
  edit: payload => dispatch(creators.edit(payload)),
  remove: payload => dispatch(creators.remove(payload)),
  setSelection: payload => dispatch(creators.setSelection(payload)),
  setExpandedKeys: payload => dispatch(creators.setExpandedKeys(payload)),
  changeTags: payload => dispatch(creators.changeTags(payload)),
}))
const alias_namespaceTagKey = 'alias_namespace'
function getTagAttributes(props: DuckCmpProps<ServiceAliasDuck>) {
  const { duck, store } = props
  const { namespaceList } = duck.selector(store)
  return [
    {
      type: 'single',
      key: alias_namespaceTagKey,
      name: '命名空间',
      values: namespaceList,
    },
    {
      type: 'input',
      key: 'service',
      name: '指向服务',
    },
  ]
}
export default function ServiceAliasPage(props: DuckCmpProps<ServiceAliasDuck>) {
  const { duck, store, dispatch } = props
  const { selector } = duck
  const handlers = getHandlers(props)
  const { composedId } = selector(store)
  const columns = React.useMemo(() => getColumns(props), [composedId])
  const { selection, namespaceList, tags, customFilters } = selector(store)
  const { filterColumns, reload: reloadColumns, fullColumns, key } = useFieldManager(
    columns,
    'tse_service_alias_custom_columns',
  )
  return (
    <BasicLayout title={'服务别名'} store={store} selectors={duck.selectors} header={<></>}>
      <Table.ActionPanel>
        <Card>
          <Card.Body title={'服务别名'} style={{ marginBottom: '20px' }}>
            服务别名可以看作是服务的映射，访问服务别名等同于访问服务，允许多个服务别名指向同一个服务
          </Card.Body>
        </Card>
        <Justify
          left={
            <>
              <Button type='primary' onClick={handlers.create}>
                {'新建别名'}
              </Button>
              <Button onClick={() => handlers.remove(selection)} disabled={selection?.length === 0}>
                {'删除'}
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
              <FieldManagerButton fields={fullColumns} onChange={reloadColumns} cacheKey={key}></FieldManagerButton>
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
          columns={filterColumns}
          addons={[
            selectable({
              all: true,
              value: selection,
              onChange: handlers.setSelection,
              rowSelectable: (rowKey, { record }) => record.editable && !checkGlobalRegistry(record),
              render: (element, { record }) => {
                const hasGlobalRegistry = checkGlobalRegistry(record)
                if (!record.editable || hasGlobalRegistry) {
                  return (
                    <Bubble content={!record.editable ? '无权限' : hasGlobalRegistry ? disableDeleteTip : '编辑'}>
                      {element}
                    </Bubble>
                  )
                }
                return <>{element}</>
              },
            }),
            filterable({
              type: 'single',
              column: 'alias_namespace',
              searchable: true,
              value: customFilters.alias_namespace,
              onChange: value => {
                const replacedTags = replaceTags(alias_namespaceTagKey, value, tags, namespaceList, {
                  type: 'single',
                  key: alias_namespaceTagKey,
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
