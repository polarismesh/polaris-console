import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import ServiceDetailDuck from './PageDuck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Button, Card, FormItem, Select, Tab, TabPanel, Tabs } from 'tea-component'
import Overview from './overview/Page'
import moment from 'moment'
import TimeSelect from '@src/polaris/common/components/TimeSelect'
import { TimePickerTab } from '../registryMonitor/Page'
import Service from './service/Page'

export enum TAB {
  Overview = 'overview',
  Service = 'service',
}
export const TAB_LABLES = {
  [TAB.Overview]: '概览',
  [TAB.Service]: '服务监控',
}
const tabs: Array<Tab> = [TAB.Overview, TAB.Service].map(id => ({
  id,
  label: TAB_LABLES[id],
}))
export enum FilterType {
  Namespace = 'Namespace',
  TimeRange = 'TimeRange',
  Step = 'Step',
}
export default purify(function ServiceDetail(props: DuckCmpProps<ServiceDetailDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators, ducks, selectors } = duck
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
  const needAllNamespace = selectors.needAllNamespace(store)
  const StepOptions = [
    {
      text: '秒级',
      value: '10',
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

  const filterMap = {
    [FilterType.Namespace]: (
      <FormItem label={'命名空间'} key={'命名空间'}>
        <Select
          searchable
          appearance='button'
          options={[...(needAllNamespace ? [{ text: '全部命名空间汇总', value: '' }] : []), ...data]}
          value={namespace}
          onChange={v => dispatch(creators.setNamespace(v))}
        ></Select>
      </FormItem>
    ),
    [FilterType.TimeRange]: (
      <FormItem label={'时间范围'} key={'时间范围'} align={'middle'}>
        <TimeSelect
          defaultIndex={0}
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
    ),
    [FilterType.Step]: (
      <FormItem label={'时间粒度'} key={'时间粒度'}>
        <Select
          appearance='button'
          options={StepOptions}
          value={step.toString()}
          defaultValue={StepOptions[0].value}
          onChange={v => dispatch(creators.setStep(Number(v)))}
        ></Select>
      </FormItem>
    ),
  }
  return (
    <DetailPage showBackButton={false} store={store} duck={duck} dispatch={dispatch} title={'服务调用监控'}>
      <Card>
        <Card.Body>
          <Tabs tabs={tabs} activeId={tab} onActive={handlers.switch}>
            <TabPanel id={TAB.Overview}>
              <Overview duck={ducks[TAB.Overview]} store={store} dispatch={dispatch} filterMap={filterMap} />
            </TabPanel>
            <TabPanel id={TAB.Service}>
              <Service duck={ducks[TAB.Service]} store={store} dispatch={dispatch} filterMap={filterMap} />
            </TabPanel>
          </Tabs>
        </Card.Body>
      </Card>
    </DetailPage>
  )
})
