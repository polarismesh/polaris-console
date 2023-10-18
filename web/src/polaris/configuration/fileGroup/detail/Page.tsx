import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import ServiceDetailDuck from './PageDuck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Tab, TabPanel, Tabs } from 'tea-component'
import File from './file/Page'
import Version from './version/Page'
import History from '../../releaseHistory/Page'
export enum TAB {
  File = 'file',
  Version = 'version',
  History = 'history',
}
export const TAB_LABLES = {
  [TAB.File]: '配置文件',
  [TAB.Version]: '配置版本',
  [TAB.History]: '发布历史',
}
const tabs: Array<Tab> = [TAB.File, TAB.Version, TAB.History].map(id => ({
  id,
  label: TAB_LABLES[id],
}))

export default purify(function ServiceDetail(props: DuckCmpProps<ServiceDetailDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators, ducks } = duck
  const { tab, group, namespace } = selector(store)
  const handlers = React.useMemo(
    () => ({
      switch: (tab: Tab) => dispatch(creators.switch(tab.id)),
    }),
    [],
  )
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={`${group}(${namespace})`}
      backRoute={'/configuration'}
    >
      <Tabs ceiling tabs={tabs} activeId={tab} onActive={handlers.switch}>
        <TabPanel id={TAB.File}>
          <File duck={ducks[TAB.File]} store={store} dispatch={dispatch} />
        </TabPanel>
        <TabPanel id={TAB.Version}>
          <Version duck={ducks[TAB.Version]} store={store} dispatch={dispatch} />
        </TabPanel>
        <TabPanel id={TAB.History}>
          <History duck={ducks[TAB.History]} store={store} dispatch={dispatch} />
        </TabPanel>
      </Tabs>
    </DetailPage>
  )
})
