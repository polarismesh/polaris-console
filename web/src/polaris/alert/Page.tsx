import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import NamespaceDuck from './PageDuck'
import getColumns from './getColumns'
import insertCSS from '../common/helpers/insertCSS'
import { Justify, Table, Button, SearchBox, Card, TabPanel, Tabs, Alert, ExternalLink } from 'tea-component'
import GridPageGrid from '../common/duckComponents/GridPageGrid'
import GridPagePagination from '../common/duckComponents/GridPagePagination'
import BasicLayout from '../common/components/BaseLayout'
import { MonitorPanel } from '../monitor/Page'
import buildConfig from '@src/buildConfig'

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
  inputKeyword: (keyword) => dispatch(creators.inputKeyword(keyword)),
  search: (keyword) => dispatch(creators.search(keyword)),
  clearKeyword: () => dispatch(creators.inputKeyword('')),
  reload: () => dispatch(creators.reload()),
  create: () => dispatch(creators.create()),
}))
export default function ServicePage(props: DuckCmpProps<NamespaceDuck>) {
  const { duck, store, dispatch } = props
  const { selectors, ducks, selector } = duck
  const columns = getColumns(props)
  const handlers = getHandlers(props)
  const { clsInfo } = selector(store)
  return (
    <BasicLayout title={'业务监控'} store={store} selectors={duck.selectors} header={<></>}>
      <Tabs
        tabs={[
          { id: 'business', label: '监控曲线' },
          { id: 'alert', label: '告警配置' },
        ]}
        ceiling
      >
        <TabPanel id={'business'}>
          <MonitorPanel duck={ducks.business} store={store} dispatch={dispatch} />
        </TabPanel>
        <TabPanel id={'alert'}>
          {buildConfig.useCls && (
            <Alert type={'info'}>
              当告警策略中所指定的监控指标达到触发条件后，将会触发一次告警，并以日志的形式写入您的
              <ExternalLink href={clsInfo?.link}>北极星CLS监控告警日志</ExternalLink>
              。如需配置更多的告警通知方式，请参见
              <ExternalLink href={'https://cloud.tencent.com/document/product/614/51741'}>CLS告警配置</ExternalLink>
            </Alert>
          )}
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
                    placeholder={'请输入规则名称'}
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
            <GridPageGrid duck={duck} dispatch={dispatch} store={store} columns={columns} />
            <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
          </Card>
        </TabPanel>
      </Tabs>
    </BasicLayout>
  )
}
