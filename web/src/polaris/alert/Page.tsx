import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import NamespaceDuck from './PageDuck'
import insertCSS from '../common/helpers/insertCSS'
import { TabPanel, Tabs } from 'tea-component'
import BasicLayout from '../common/components/BaseLayout'
import { MonitorPanel } from '../monitor/Page'

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
export default function ServicePage(props: DuckCmpProps<NamespaceDuck>) {
  const { duck, store, dispatch } = props
  return (
    <BasicLayout title={'业务监控'} store={store} selectors={duck.selectors} header={<></>}>
      <Tabs tabs={[{ id: 'business', label: '监控曲线' }]} ceiling>
        <TabPanel id={'business'}>
          <MonitorPanel duck={duck.ducks.business} store={store} dispatch={dispatch} />
        </TabPanel>
      </Tabs>
    </BasicLayout>
  )
}
