import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import Duck from './PageDuck'
import { Card, Justify, Table, Button } from 'tea-component'
import getColumns from './getColumns'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import { isOwner } from '@src/polaris/common/util/common'
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
const getHandlers = memorize(({ creators }: Duck, dispatch) => ({
  inputKeyword: keyword => dispatch(creators.inputKeyword(keyword)),
  search: keyword => dispatch(creators.search(keyword)),
  clearKeyword: () => dispatch(creators.inputKeyword('')),
  reload: () => dispatch(creators.reload()),
  create: () => dispatch(creators.create()),
  attachGroup: () => dispatch(creators.attachGroup()),
}))
export default function ServicePage(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const columns = getColumns(props)
  const handlers = getHandlers(props)
  const { composedId } = duck.selector(store)
  const isInDetailpage = !!composedId?.userId
  const contentElement = (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              {!isInDetailpage && isOwner() && (
                <Button type={'primary'} onClick={handlers.create}>
                  {'新建用户组'}
                </Button>
              )}
              {isInDetailpage && isOwner() && (
                <Button type={'primary'} onClick={handlers.attachGroup}>
                  {'编辑'}
                </Button>
              )}
            </>
          }
          right={
            <>
              <Button type={'icon'} icon={'refresh'} onClick={handlers.reload}></Button>
            </>
          }
        />
      </Table.ActionPanel>
      <Card bordered>
        <GridPageGrid duck={duck} dispatch={dispatch} store={store} columns={columns} />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </>
  )
  return isInDetailpage ? (
    contentElement
  ) : (
    <BasicLayout title={'用户组'} store={store} selectors={duck.selectors} header={<></>}>
      {contentElement}
    </BasicLayout>
  )
}
