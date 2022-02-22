import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import ConfigFileGroupDuck from './PageDuck'
import getColumns from './getColumns'
import { Justify, Table, Button, Card, TagSearchBox, Select } from 'tea-component'
import { selectable } from 'tea-component/lib/table/addons'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import { replaceTags } from '../utils'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import BasicLayout from '@src/polaris/common/components/BaseLayout'

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
export const NamespaceTagKey = 'namespace'
export const GroupNameTagKey = 'group'
export const FileNameTagKey = 'fileName'
export const DefaultGroupTagAttribute = {
  type: 'input',
  key: GroupNameTagKey,
  name: '分组名',
}
function getTagAttributes(props: DuckCmpProps<ConfigFileGroupDuck>) {
  const { duck, store } = props
  const { namespaceList } = duck.selector(store)
  return [
    {
      type: 'single',
      key: NamespaceTagKey,
      name: '命名空间',
      values: namespaceList,
    },
    {
      type: 'input',
      key: GroupNameTagKey,
      name: '分组名',
    },
    {
      type: 'input',
      key: FileNameTagKey,
      name: '配置文件名',
    },
  ]
}
const getHandlers = memorize(({ creators }: ConfigFileGroupDuck, dispatch) => ({
  reload: () => dispatch(creators.reload()),
  create: () => dispatch(creators.create()),
  select: v => dispatch(creators.select(v)),
  remove: v => dispatch(creators.remove(v)),
  changeTags: v => dispatch(creators.changeTags(v)),
}))
export default function ServicePage(props: DuckCmpProps<ConfigFileGroupDuck>) {
  const { duck, store, dispatch } = props
  const { selector } = duck
  const columns = React.useMemo(() => getColumns(props), [])
  const handlers = getHandlers(props)
  const { selection, tags, customFilters, namespaceList } = selector(store)
  const namespaceOptions = namespaceList.map(item => ({ text: item.name, value: item.name }))
  namespaceOptions.unshift({ text: '全部', value: '' })
  return (
    <BasicLayout title={'配置分组'} store={store} selectors={duck.selectors} header={<></>}>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              <Button type={'primary'} onClick={handlers.create}>
                {'新建'}
              </Button>
              <Button type={'primary'} onClick={() => handlers.remove(selection)} disabled={selection?.length === 0}>
                {'删除'}
              </Button>
            </>
          }
          right={
            <>
              <Select
                type={'simulate'}
                options={namespaceOptions}
                value={customFilters.namespace}
                appearance={'button'}
                onChange={value => {
                  const replacedTags = replaceTags(NamespaceTagKey, value, tags, namespaceList, {
                    type: 'single',
                    key: NamespaceTagKey,
                    name: '命名空间',
                    values: namespaceList,
                  })
                  handlers.changeTags(replacedTags)
                }}
                style={{ margin: '0px 20px' }}
              ></Select>
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
          addons={[
            selectable({
              all: true,
              value: selection,
              onChange: handlers.select,
            }),
            // filterable({
            //   type: 'single',
            //   column: 'namespace',
            //   value: customFilters.namespace,
            //   onChange: value => {
            //     const replacedTags = replaceTags(NamespaceTagKey, value, tags, namespaceList, {
            //       type: 'single',
            //       key: NamespaceTagKey,
            //       name: '命名空间',
            //       values: namespaceList,
            //     })
            //     handlers.changeTags(replacedTags)
            //   },
            //   all: {
            //     text: '全部',
            //     value: '',
            //   },
            //   // 选项列表
            //   options: namespaceList.map(item => ({ text: item.name, value: item.name })),
            // }),
          ]}
          columns={columns}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </BasicLayout>
  )
}
