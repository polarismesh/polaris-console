import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import ServiceDetailDuck from './PageDuck'
import { Tab, Tabs, TabPanel } from 'tea-component'
import BasicLayout from '../common/components/BaseLayout'
import FileGroup from './fileGroup/Page'
import Release from './releaseHistory/Page'

export enum TAB {
  FileGroup = 'fileGroup',
  Release = 'release',
}
export const TAB_LABLES = {
  [TAB.FileGroup]: '配置分组',
  [TAB.Release]: '发布历史',
}

const tabs: Array<Tab> = [TAB.FileGroup, TAB.Release].map(id => ({
  id,
  label: TAB_LABLES[id],
}))
export interface ComposedId {
  group?: string
  fileName?: string
  namespace?: string
}
export default purify(function ServiceDetail(props: DuckCmpProps<ServiceDetailDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators, ducks } = duck
  const { tab } = selector(store)
  const handlers = React.useMemo(
    () => ({
      switch: (tab: Tab) => dispatch(creators.switch(tab.id)),
    }),
    [],
  )
  return (
    <BasicLayout title={'配置管理'} store={store} selectors={duck.selectors}>
      <Tabs tabs={tabs} activeId={tab} onActive={handlers.switch} ceiling>
        <TabPanel id={TAB.FileGroup}>
          <section style={{ marginTop: '20px' }}>
            <FileGroup duck={ducks[TAB.FileGroup]} store={store} dispatch={dispatch} />
          </section>
        </TabPanel>
        <TabPanel id={TAB.Release}>
          <section style={{ marginTop: '20px' }}>
            <Release duck={ducks[TAB.Release]} store={store} dispatch={dispatch} />
          </section>
        </TabPanel>
      </Tabs>
    </BasicLayout>
  )
})
