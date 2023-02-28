import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import ServiceDetailDuck from './PageDuck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Button, Card, Form, FormItem, Select, Tab, TabPanel, Tabs } from 'tea-component'
import Overview from './overview/Page'
import moment from 'moment'
import TimeSelect from '@src/polaris/common/components/TimeSelect'
import Service from './service/Page'
export enum TAB {
  Overview = 'overview',
  Service = 'service',
}
export const TAB_LABLES = {
  [TAB.Overview]: '概览',
  [TAB.Service]: '服务和配置统计',
}
const tabs: Array<Tab> = [TAB.Overview, TAB.Service].map(id => ({
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
export const StepOptions = [
  {
    text: '1秒',
    value: '1',
  },
  {
    text: '1分',
    value: '60',
  },
  {
    text: '5分',
    value: '300',
  },
  {
    text: '1小时',
    value: '3600',
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
  if (!data) return <noscript />
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={'注册配置监控'}
      headerComponent={
        <>
          <Form layout={'inline'} style={{ width: '1000px', display: 'inline-block' }}>
            <FormItem label={'命名空间'}>
              <Select
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
        </>
      }
    >
      <Card>
        <Card.Body>
          <Tabs tabs={tabs} activeId={tab} onActive={handlers.switch}>
            <TabPanel id={TAB.Overview}>
              <Overview duck={ducks[TAB.Overview]} store={store} dispatch={dispatch} />
            </TabPanel>
            <TabPanel id={TAB.Service}>
              <Service duck={ducks[TAB.Service]} store={store} dispatch={dispatch} />
            </TabPanel>
          </Tabs>
        </Card.Body>
      </Card>
    </DetailPage>
  )
})
