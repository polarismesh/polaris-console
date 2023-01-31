import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import Duck from './CreateDuck'
import { Form, FormItem, Select, FormText, InputAdornment, Input as TeaInput, InputNumber } from 'tea-component'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import {
  AlertTimeIntervalOptions,
  AlterExprOptions,
  IntervalOptions,
  MetricNameOptions,
  MonitorTypeOption,
} from '../types'

export default function Create(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selectors } = duck
  const visible = selectors.visible(store)
  if (!visible) {
    return <noscript />
  }
  const data = selectors.data(store)
  return (
    <Dialog duck={duck} store={store} dispatch={dispatch} size={'xl'} title={data.id ? '编辑告警策略' : '新建告警策略'}>
      <CreateForm duck={duck} store={store} dispatch={dispatch} />
    </Dialog>
  )
}

const CreateForm = purify(function CreateForm(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selectors,
  } = duck

  const formApi = form.getAPI(store, dispatch)
  const { name, monitor_type, alter_expr, interval, interval_unit, callback, topic, message } = formApi.getFields([
    'name',
    'monitor_type',
    'alter_expr',
    'interval',
    'interval_unit',
    'callback',
    'topic',
    'message',
  ])
  const options = selectors.options(store)
  const { expr, for: expr_interval, metrics_name, value: expr_value, for_unit } = alter_expr.getFields([
    'expr',
    'for',
    'metrics_name',
    'value',
    'for_unit',
  ])
  const info = callback.getField('info')
  const url = info.getField('url')
  return (
    <>
      <Form>
        <FormField field={name} label={'名字'} required>
          <Input field={name} maxLength={128} size={'l'} disabled={options?.isModify} />
        </FormField>
        <FormField field={monitor_type} label={'监控类型'}>
          <Select
            value={monitor_type.getValue()}
            options={MonitorTypeOption}
            onChange={value => monitor_type.setValue(value)}
            appearance={'button'}
          ></Select>
        </FormField>
        <FormItem label={'触发条件'}>
          <Form>
            <Form layout={'inline'} key='111'>
              <FormItem>
                <FormText>{'当'}</FormText>
              </FormItem>
              <FormField field={metrics_name}>
                <Select
                  value={metrics_name.getValue()}
                  options={MetricNameOptions}
                  onChange={value => metrics_name.setValue(value)}
                  appearance={'button'}
                ></Select>
              </FormField>
              <FormField showStatusIcon={false} field={expr}>
                <Select
                  value={expr.getValue()}
                  options={AlterExprOptions}
                  onChange={value => expr.setValue(value)}
                  appearance={'button'}
                ></Select>
              </FormField>
              <FormField field={expr_value}>
                <InputNumber
                  value={expr_value.getValue()}
                  onChange={v => expr_value.setValue(v)}
                  min={0}
                  size={'m'}
                  hideButton
                />
              </FormField>
              <FormItem>
                <FormText>{'个'}</FormText>
              </FormItem>
            </Form>
          </Form>
        </FormItem>
        <FormField field={expr_interval} label={'持续时间'}>
          <InputAdornment
            after={
              <Select
                value={for_unit.getValue()}
                options={AlertTimeIntervalOptions}
                onChange={value => for_unit.setValue(value)}
                appearance={'button'}
                size={'xs'}
              ></Select>
            }
          >
            <InputNumber
              value={expr_interval.getValue()}
              onChange={v => expr_interval.setValue(v)}
              min={0}
              size={'m'}
              hideButton
            />
          </InputAdornment>
        </FormField>
        <FormItem label={'告警周期'}>
          <Select
            value={`${interval.getValue()}${interval_unit.getValue()}`}
            options={IntervalOptions}
            onChange={(value, context) => {
              const option = context.option as any
              interval.setValue(option.interval)
              interval_unit.setValue(option.unit)
            }}
            appearance={'button'}
          ></Select>
        </FormItem>
        <FormField field={url} label={'通知回调地址'} required>
          <Input field={url} size={'l'} />
        </FormField>
        <FormField field={topic} label={'告警主题'} required>
          <Input field={topic} size={'l'} />
        </FormField>
        <FormField field={message} label={'告警消息'} required>
          <TeaInput.TextArea
            value={message.getValue()}
            onChange={v => {
              message.setValue(v)
            }}
            rows={5}
            size={'l'}
          />
        </FormField>
      </Form>
    </>
  )
})
