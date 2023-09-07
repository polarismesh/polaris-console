import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import ServiceDetailDuck from './PageDuck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Button, Card, Form, FormItem, Select, Tab, TabPanel, Tabs } from 'tea-component'
import Overview from './overview/Page'
import moment from 'moment'
import TimeSelect from '@src/polaris/common/components/TimeSelect'
import Service from './service/Page'
import Server from './server/Page'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
export enum TAB {
  Overview = 'overview',
  Service = 'service',
  Server = 'server',
}
export const TAB_LABLES = {
  [TAB.Overview]: '概览',
  [TAB.Service]: '服务和配置统计',
  [TAB.Server]: '北极星服务端请求统计',
}
insertCSS(
  `monitor`,
  `
.black-placeholder-text .tea-text-weak{
  color: #000 !important;
}
.monitor-metric-board .tea-metrics-board__number{
  font-size: 2rem;
}
`,
)
const tabs: Array<Tab> = [TAB.Overview, TAB.Service, TAB.Server].map(id => ({
  id,
  label: TAB_LABLES[id],
}))
export const TimePickerTab = () => [
  {
    text: '1h',
    date: [moment().subtract(1, 'h'), moment()],
  },
  {
    text: '1d',
    date: [moment().subtract(1, 'd'), moment()],
  },
  {
    text: '3d',
    date: [moment().subtract(3, 'd'), moment()],
  },
  {
    text: '7d',
    date: [moment().subtract(1, 'w'), moment()],
  },
]
export default purify(function ServiceDetail(props: DuckCmpProps<ServiceDetailDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators, ducks } = duck
  const { tab, data, namespace, start, end, step } = selector(store)
  const handlers = React.useMemo(
    () => ({
      switch: (tab: Tab) => dispatch(creators.switch(tab.id)),
    }),
    [],
  )
  const timePicker = React.useRef(null)
  const flush = () => {
    timePicker?.current?.flush()
  }
  React.useEffect(() => {
    const gap = end - start
    if (gap < step) {
      //如果间隔小于step，重置step为可选的第一个
      dispatch(creators.setStep(Number(StepOptions.find(item => !item.disabled).value)))
    }
  }, [start, end])
  if (!data) return <noscript />
  const gap = end - start
  const StepOptions = [
    {
      text: '1秒',
      value: '1',
      disabled: gap > 60 * 60,
    },
    {
      text: '1分',
      value: '60',
      disabled: gap > 60 * 60 * 24,
    },
    {
      text: '5分',
      value: '300',
      disabled: gap > 60 * 60 * 24 * 3,
    },
    {
      text: '1小时',
      value: '3600',
      disabled: gap < 3600,
    },
  ]
  const filterSlot = (
    <section style={{ padding: '20px 0px', marginBottom: '20px' }}>
      <Form layout={'inline'} style={{ display: 'inline-block' }}>
        <FormItem label={'命名空间'}>
          <Select
            searchable
            appearance='button'
            options={[{ text: '全部命名空间汇总', value: '' }, ...data]}
            value={namespace}
            onChange={v => dispatch(creators.setNamespace(v))}
          ></Select>
        </FormItem>
        <FormItem label={'时间范围'} align={'middle'}>
          <TimeSelect
            tabs={TimePickerTab()}
            style={{ display: 'inline-block' }}
            changeDate={({ from, to }) => {
              dispatch(creators.setStart(moment(from).unix()))
              dispatch(creators.setEnd(moment(to).unix()))
            }}
            from={start ? new Date(start * 1000).toString() : undefined}
            to={end ? new Date(end * 1000).toString() : undefined}
            range={{
              min: moment().subtract(29, 'y'),
              max: moment(),
              maxLength: 3,
            }}
            ref={timePicker}
            format={'HH:mm:ss'}
          />
          <Button type={'icon'} icon={'refresh'} onClick={flush}></Button>
        </FormItem>
        <FormItem label={'时间粒度'}>
          <Select
            appearance='button'
            options={StepOptions}
            value={step.toString()}
            onChange={v => dispatch(creators.setStep(Number(v)))}
          ></Select>
        </FormItem>
      </Form>
    </section>
  )
  return (
    <DetailPage showBackButton={false} store={store} duck={duck} dispatch={dispatch} title={'注册配置监控'}>
      <Card>
        <Card.Body>
          <Tabs tabs={tabs} activeId={tab} onActive={handlers.switch}>
            <TabPanel id={TAB.Overview}>
              <Overview duck={ducks[TAB.Overview]} store={store} dispatch={dispatch} filterSlot={filterSlot} />
            </TabPanel>
            <TabPanel id={TAB.Service}>
              <Service duck={ducks[TAB.Service]} store={store} dispatch={dispatch} filterSlot={filterSlot} />
            </TabPanel>
            <TabPanel id={TAB.Server}>
              <Server duck={ducks[TAB.Server]} store={store} dispatch={dispatch} filterSlot={filterSlot} />
            </TabPanel>
          </Tabs>
        </Card.Body>
      </Card>
    </DetailPage>
  )
})
