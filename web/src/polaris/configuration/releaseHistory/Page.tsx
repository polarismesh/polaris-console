import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import ConfigFileGroupDuck from './PageDuck'
import getColumns from './getColumns'
import { Justify, Table, Button, Card, TagSearchBox, Select } from 'tea-component'
import { filterable } from 'tea-component/lib/table/addons'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import { replaceTags } from '../utils'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'

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
  const { configFileGroupList } = duck.selector(store)
  return [
    {
      type: 'single',
      key: GroupNameTagKey,
      name: '分组名',
      values: configFileGroupList,
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
  changeTags: v => dispatch(creators.changeTags(v)),
  setCustomFilters: v => dispatch(creators.setCustomFilters(v)),
  setNamespace: v => dispatch(creators.setNamespace(v)),
}))
export default function ServicePage(props: DuckCmpProps<ConfigFileGroupDuck>) {
  const { duck, store, dispatch } = props
  const { selector } = duck
  const columns = getColumns(props)
  const handlers = getHandlers(props)
  const { tags, customFilters, namespaceList, configFileGroupList, namespace } = selector(store)
  const namespaceOptions = namespaceList.map(item => ({ text: item.name, value: item.name }))
  namespaceOptions.unshift({ text: '全部命名空间', value: '' })
  return (
    <>
      <Table.ActionPanel>
        <Justify
          right={
            <>
              <Select
                searchable
                type={'simulate'}
                options={namespaceOptions}
                value={namespace}
                appearance={'button'}
                onChange={value => {
                  handlers.setNamespace(value)
                }}
                style={{ width: '120px' }}
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
            filterable({
              type: 'single',
              column: 'group',
              searchable: true,
              value: customFilters.group,
              onChange: value => {
                const replacedTags = replaceTags(GroupNameTagKey, value, tags, configFileGroupList, {
                  type: 'single',
                  key: GroupNameTagKey,
                  name: '分组',
                  values: configFileGroupList,
                })
                handlers.changeTags(replacedTags)
              },
              all: {
                text: '全部',
                value: '',
              },
              // 选项列表
              options: configFileGroupList.map(item => ({ text: item.name, value: item.name })),
            }),
          ]}
          columns={columns}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </>
  )
}
