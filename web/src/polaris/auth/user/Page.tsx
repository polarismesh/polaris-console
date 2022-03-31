import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import Duck from './PageDuck'
import { Card, Justify, Table, Button } from 'tea-component'
import getColumns from './getColumns'
import { injectable } from 'tea-component/lib/table/addons'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { isOwner, getUin } from '@src/polaris/common/util/common'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
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
const getHandlers = memorize(({ creators }: Duck, dispatch) => ({
  reload: () => dispatch(creators.reload()),
  create: () => dispatch(creators.create()),
  modifyGroup: () => dispatch(creators.modifyGroup()),
}))
export default function ServicePage(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selector } = duck
  const { composedId } = selector(store)
  const columns = getColumns(props)
  const handlers = getHandlers(props)
  const isInDetailpage = !!composedId?.groupId
  const contentElement = (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              {!isInDetailpage && isOwner() && (
                <Button type={'primary'} onClick={handlers.create}>
                  {'新建'}
                </Button>
              )}
              {isInDetailpage && isOwner() && (
                <Button type={'primary'} onClick={handlers.modifyGroup}>
                  {'编辑用户组'}
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
        <GridPageGrid
          duck={duck}
          dispatch={dispatch}
          store={store}
          columns={columns}
          addons={[
            injectable({
              row: (props, context) => ({
                style: {
                  ...(props.style || {}),
                  background: context.record.id === getUin().toString() ? '#eceef2' : undefined,
                },
              }),
            }),
          ]}
        />
        {!isInDetailpage && <GridPagePagination duck={duck} dispatch={dispatch} store={store} />}
      </Card>
    </>
  )
  return isInDetailpage ? (
    contentElement
  ) : (
    <BasicLayout title={'用户'} store={store} selectors={duck.selectors} header={<></>}>
      {contentElement}
    </BasicLayout>
  )
}
