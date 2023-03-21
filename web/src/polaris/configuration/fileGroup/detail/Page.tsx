import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import ServiceDetailDuck from './PageDuck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Tab, TabPanel, Tabs } from 'tea-component'
import File from './file/Page'
import i18n from '@src/polaris/common/util/i18n'
export enum TAB {
  File = 'file',
}
export const TAB_LABLES = {
  [TAB.File]: i18n.t('配置文件'),
}
const tabs: Array<Tab> = [TAB.File].map(id => ({
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
    <DetailPage store={store} duck={duck} dispatch={dispatch} title={`${group}(${namespace})`} backRoute={'/filegroup'}>
      <Tabs ceiling tabs={tabs} activeId={tab} onActive={handlers.switch}>
        <TabPanel id={TAB.File}>
          <File duck={ducks[TAB.File]} store={store} dispatch={dispatch} />
        </TabPanel>
      </Tabs>
    </DetailPage>
  )
})
