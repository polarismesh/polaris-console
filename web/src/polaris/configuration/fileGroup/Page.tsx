import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import ConfigFileGroupDuck from './PageDuck'
import getColumns from './getColumns'
import { Justify, Table, Button, Card, TagSearchBox, Select, Form, FormItem, FormText } from 'tea-component'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import { expandable, filterable } from 'tea-component/lib/table/addons'
import { ConfigFileGroup } from './types'
import { showAllLabels } from '@src/polaris/service/utils'

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
function getTagAttributes() {
  return [
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
  exportConfig: v => dispatch(creators.exportConfig(v)),
  importConfig: v => dispatch(creators.importConfig(v)),
  changeTags: v => dispatch(creators.changeTags(v)),
  setNamespace: v => dispatch(creators.setNamespace(v)),
}))
export default function ServicePage(props: DuckCmpProps<ConfigFileGroupDuck>) {
  const { duck, store, dispatch } = props
  const { selector } = duck
  const columns = getColumns(props)
  const [expandedKeys, setExpandedKeys] = React.useState([])
  const handlers = getHandlers(props)
  const { namespaceList, namespace } = selector(store)
  const namespaceOptions = namespaceList.map(item => ({ text: item.name, value: item.name }))
  namespaceOptions.unshift({ text: '全部命名空间', value: '' })
  return (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              <Button type={'primary'} onClick={handlers.create}>
                {'新建'}
              </Button>
              <Button onClick={handlers.importConfig}>导入</Button>

              <Button onClick={handlers.exportConfig}>导出</Button>
              {/* <Button type={'primary'} onClick={() => handlers.remove(selection)} disabled={selection?.length === 0}>
                {'删除'}
              </Button> */}
            </>
          }
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
              column: 'namespace',
              value: namespace,
              onChange: value => {
                handlers.setNamespace(value)
              },
              all: {
                text: '全部',
                value: '',
              },
              // 选项列表
              options: namespaceList.map(item => ({ text: item.name, value: item.name })),
            }),
            expandable({
              // 已经展开的产品
              expandedKeys,
              // 发生展开行为时，回调更新展开键值
              onExpandedKeysChange: keys => setExpandedKeys(keys),
              render: (record: ConfigFileGroup) => {
                const labelList = record.metadata
                return (
                  <Form>
                    <FormItem label={'标签'}>
                      <FormText>
                        {labelList
                          .slice(0, 5)
                          .map(item => `${item.key}:${item.value || '-'}`)
                          .join(' ; ') || '-'}
                        {labelList.length > 5 && '...'}
                        {labelList.length > 5 && (
                          <Button onClick={() => showAllLabels(record.metadata)} type='link'>
                            {'展示全部'}
                          </Button>
                        )}
                      </FormText>
                    </FormItem>
                    <FormItem label={'备注'}>
                      <FormText>{record.comment || '-'}</FormText>
                    </FormItem>
                  </Form>
                )
              },
            }),
          ]}
          columns={columns}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </>
  )
}
