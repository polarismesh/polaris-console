import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Form, Card, FormItem, FormText, Text } from 'tea-component'
import PageDuck from './PageDuck'
import { AlertTimeIntervalMap, AlterExprMap, MetricNameMap, MonitorTypeMap } from '../types'

export default purify(function CustomRoutePage(props: DuckCmpProps<PageDuck>) {
  const { duck, store, dispatch } = props
  const { selectors } = duck
  const composedId = selectors.composedId(store)
  const data = selectors.data(store)

  const backRoute = `/alert`
  if (!data?.alertInfo) {
    return <noscript />
  }
  const { alertInfo } = data
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={`${data?.alertInfo?.name} (${composedId.id || '-'})`}
      backRoute={backRoute}
    >
      <Card>
        <Card.Body>
          <Form>
            <FormItem label={'告警策略名称'}>
              <FormText>{alertInfo.name}</FormText>
            </FormItem>
            <FormItem label={'启用状态'}>
              <FormText>{alertInfo.enable ? '已启用' : '未启用'}</FormText>
            </FormItem>
            <FormItem label={'监控类型'}>
              <FormText>
                <Text tooltip={MonitorTypeMap[alertInfo.monitor_type]}>
                  {MonitorTypeMap[alertInfo.monitor_type] || '-'}
                </Text>
              </FormText>
            </FormItem>
            <FormItem label={'更新时间'}>
              <FormText>{alertInfo.modify_time}</FormText>
            </FormItem>
            <FormItem label={'触发条件'}>
              <FormText>
                <Text parent={'div'}>
                  {MetricNameMap[alertInfo.alter_expr?.metrics_name]?.text} {AlterExprMap[alertInfo.alter_expr?.expr]}{' '}
                  {alertInfo.alter_expr?.value}
                  {MetricNameMap[alertInfo.alter_expr?.metrics_name]?.unit}
                </Text>
                <Text parent={'div'}>
                  持续{alertInfo.alter_expr.for}
                  {AlertTimeIntervalMap[alertInfo.alter_expr.for_unit]}
                </Text>
              </FormText>
            </FormItem>
            <FormItem label={'告警周期'}>
              <FormText>
                <Text>每隔{`${alertInfo.interval}${AlertTimeIntervalMap[alertInfo.interval_unit]}`}告警一次</Text>
              </FormText>
            </FormItem>
            <FormItem label={'告警主题'}>
              <FormText>{alertInfo.topic}</FormText>
            </FormItem>
            <FormItem label={'告警周期'}>
              <FormText>{alertInfo.message}</FormText>
            </FormItem>
            <FormItem label={'通知回调地址'}>
              <FormText>{alertInfo.callback?.info?.url}</FormText>
            </FormItem>
          </Form>
        </Card.Body>
      </Card>
    </DetailPage>
  )
})
