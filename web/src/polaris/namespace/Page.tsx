import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import NamespaceDuck from './PageDuck'
import getColumns from './getColumns'
import insertCSS from '../common/helpers/insertCSS'
import { Justify, Table, Button, SearchBox, Card } from 'tea-component'
import GridPageGrid from '../common/duckComponents/GridPageGrid'
import GridPagePagination from '../common/duckComponents/GridPagePagination'
import BasicLayout from '../common/components/BaseLayout'
import { useServerConfig } from '../common/util/serverConfig'
import { filterable } from 'tea-component/lib/table/addons'

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
const getHandlers = memorize(({ creators }: NamespaceDuck, dispatch) => ({
  inputKeyword: keyword => dispatch(creators.inputKeyword(keyword)),
  search: keyword => dispatch(creators.search(keyword)),
  clearKeyword: () => dispatch(creators.inputKeyword('')),
  reload: () => dispatch(creators.reload()),
  create: () => dispatch(creators.create()),
  setSyncToGlobalRegistry: x => dispatch(creators.setSyncToGlobalRegistry(x)),
}))
export default function ServicePage(props: DuckCmpProps<NamespaceDuck>) {
  const { duck, store, dispatch } = props
  const { selectors, selector } = duck
  const columns = getColumns(props)
  const handlers = getHandlers(props)
  const multiRegConfig = useServerConfig('multiregistries')
  const multiRegConfigEnabled = multiRegConfig?.open
  const { sync_to_global_registry } = selector(store)
  return (
    <BasicLayout title={'命名空间'} store={store} selectors={duck.selectors} header={<></>}>
      <Table.ActionPanel>
        <Justify
          left={
            <Button type={'primary'} onClick={handlers.create}>
              {'新建'}
            </Button>
          }
          right={
            <>
              <SearchBox
                value={selectors.pendingKeyword(store)}
                placeholder={'请输入命名空间名称'}
                onSearch={handlers.search}
                onChange={handlers.inputKeyword}
                onClear={handlers.clearKeyword}
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
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </BasicLayout>
  )
}
