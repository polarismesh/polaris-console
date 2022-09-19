import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import ServiceDetailDuck from './PageDuck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Tab, TabPanel, Tabs } from 'tea-component'
import { TAB, TAB_LABLES } from './types'
import BaseInfo from './info/Page'
import Instance from './instance/Page'
import AccessLimit from '@src/polaris/administration/accessLimiting/Page'
import Route from '@src/polaris/administration/dynamicRoute/customRoute/Page'

import CircuitBreaker from './circuitBreaker/Page'

const tabs: Array<Tab> = [TAB.Instance, TAB.Route, TAB.CircuitBreaker, TAB.AccessLimit, TAB.Info].map(id => ({
  id,
  label: TAB_LABLES[id],
}))

export default purify(function ServiceDetail(props: DuckCmpProps<ServiceDetailDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators, ducks } = duck
  const { tab, name, namespace } = selector(store)
  const handlers = React.useMemo(
    () => ({
      switch: (tab: Tab) => dispatch(creators.switch(tab.id)),
    }),
    [],
  )
  return (
    <DetailPage store={store} duck={duck} dispatch={dispatch} title={`${name}(${namespace})`} backRoute={'/#/service'}>
      <Tabs ceiling tabs={tabs} activeId={tab} onActive={handlers.switch}>
        <TabPanel id={TAB.Info}>
          <BaseInfo duck={ducks[TAB.Info]} store={store} dispatch={dispatch} />
        </TabPanel>
        <TabPanel id={TAB.Instance}>
          <Instance duck={ducks[TAB.Instance]} store={store} dispatch={dispatch} />
        </TabPanel>
        <TabPanel id={TAB.Route}>
          <Route duck={ducks[TAB.Route]} store={store} dispatch={dispatch} />
        </TabPanel>
        <TabPanel id={TAB.AccessLimit}>
          <AccessLimit duck={ducks[TAB.AccessLimit]} store={store} dispatch={dispatch} />
        </TabPanel>
        <TabPanel id={TAB.CircuitBreaker}>
          <CircuitBreaker duck={ducks[TAB.CircuitBreaker]} store={store} dispatch={dispatch} />
        </TabPanel>
      </Tabs>
    </DetailPage>
  )
})
