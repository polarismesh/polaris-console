import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import ServiceDetailDuck from './PageDuck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Bubble, Tab, TabPanel, Tabs } from 'tea-component'
import { TAB, TAB_LABLES } from './types'
import BaseInfo from './info/Page'
import Instance from './instance/Page'
import Interface from './interface/Page'
import AccessLimit from '@src/polaris/administration/accessLimiting/Page'
import Route from '@src/polaris/administration/dynamicRoute/customRoute/Page'

import CircuitBreaker from '@src/polaris/administration/breaker/Page'
import { FeatureDisplayType, useCheckFeatureValid } from '@src/polaris/common/util/checkFeature'
import { handleInfo } from '@src/polaris/common/util/common'

const tabs: Array<Tab> = [TAB.Instance, TAB.Interface, TAB.Route, TAB.CircuitBreaker, TAB.AccessLimit, TAB.Info].map(
  id => ({
    id,
    label: TAB_LABLES[id],
  }),
)

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
  const features = useCheckFeatureValid()
  const filterTabs = tabs
    .map(item => {
      const currentFeature = features.find(feature => feature.name === item.id)
      if (!currentFeature || currentFeature.display === FeatureDisplayType.visible) return item
      if (currentFeature.display === FeatureDisplayType.block) {
        return {
          ...item,
          disabled: true,
          label: (
            <Bubble placement={'bottom'} content={handleInfo(currentFeature.tip)}>
              {item.label}
            </Bubble>
          ),
        }
      }
      if (currentFeature.display === FeatureDisplayType.hidden) {
        return undefined
      }
    })
    .filter(item => item)
  return (
    <DetailPage store={store} duck={duck} dispatch={dispatch} title={`${name}(${namespace})`} backRoute={'/#/service'}>
      <Tabs ceiling tabs={filterTabs} activeId={tab} onActive={handlers.switch}>
        <TabPanel id={TAB.Info}>
          <BaseInfo duck={ducks[TAB.Info]} store={store} dispatch={dispatch} />
        </TabPanel>
        <TabPanel id={TAB.Instance}>
          <Instance duck={ducks[TAB.Instance]} store={store} dispatch={dispatch} />
        </TabPanel>
        <TabPanel id={TAB.Interface}>
          <Interface duck={ducks[TAB.Interface]} store={store} dispatch={dispatch} />
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
