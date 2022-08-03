import React, { useRef } from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import CreateRouteDuck from './CreateDuck'

import {
  Form,
  FormItem,
  Segment,
  H3,
  Button,
  H4,
  MonacoEditor,
  Text,
  FormText,
  InputNumber as TeaInputNumber,
} from 'tea-component'
import {
  MATCH_TYPE_OPTIONS,
  RuleType,
  PolicyName,
  PolicyNameOptions,
  BreakResourceOptions,
  OUTLIER_DETECT_MAP_OPTIONS,
  PolicyMap,
} from '../types'
import Input from '@src/polaris/common/duckComponents/form/Input'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Select from '@src/polaris/common/duckComponents/form/Select'
import InputNumber from '@src/polaris/common/duckComponents/form/InputNumber'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export const REGEX_STAR_TIPS = '正则模式下，使用*代表选择所有'
export enum EditType {
  Manual = 'Manual',
  Json = 'Json',
}
const EditTypeOptions = [
  {
    text: '手动配置',
    value: EditType.Manual,
  },
  {
    text: 'JSON配置',
    value: EditType.Json,
  },
]

const removeArrayFieldValue = (field, index) => {
  const newValue = field.getValue()
  newValue.splice(index, 1)
  field.setValue([...newValue])
}
const addPolicy = field => {
  field.setValue([
    ...field.getValue(),
    {
      policyName: PolicyName.ErrorRate,
      errorRateToOpen: 10,
      slowRateToOpen: 0,
      consecutiveErrorToOpen: 10,
      maxRt: 1,
    },
  ])
}

const renderInboundRule = props => {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
  } = duck

  const formApi = form.getAPI(store, dispatch)
  const {
    inboundDestinations,

    outboundDestinations,

    ruleType,
    inboundNamespace,
    inboundService,
    outboundNamespace,
    outboundService,
  } = formApi.getFields([
    'inboundDestinations',
    'inboundSources',
    'outboundDestinations',
    'outboundSources',
    'editType',
    'ruleType',
    'inboundNamespace',
    'inboundService',
    'outboundNamespace',
    'outboundService',
  ])
  const isInbound = ruleType.getValue() === RuleType.Inbound

  const destinations = isInbound ? inboundDestinations : outboundDestinations
  const ruleNamespace = isInbound ? inboundNamespace : outboundNamespace
  const ruleService = isInbound ? inboundService : outboundService
  return (
    <>
      <FormItem
        label={<H4 style={{ margin: '10px 0' }}>{isInbound ? '以下服务' : '本服务调用以下服务或者接口时'}</H4>}
      ></FormItem>
      <Form>
        <Form style={{ width: '850px' }}>
          <Form layout={'inline'}>
            <FormField showStatusIcon={false} field={ruleNamespace} label={'命名空间'} message={REGEX_STAR_TIPS}>
              <Input field={ruleNamespace} />
            </FormField>
            <FormField showStatusIcon={false} field={ruleService} label={'服务'} message={REGEX_STAR_TIPS}>
              <Input field={ruleService} />
            </FormField>
          </Form>
        </Form>
      </Form>
      <FormItem label={<H3 style={{ margin: '10px 0' }}>{isInbound ? '调用本服务的以下接口时' : ''}</H3>}></FormItem>

      <Form style={{ width: '100%' }}>
        <Form style={{ width: '850px', paddingLeft: '20px' }} layout={'inline'}>
          {[...destinations.asArray()].map(field => {
            const { method } = field.getFields(['method'])
            const { value: methodValue, type: methodType } = method.getFields(['value', 'type'])
            return (
              <>
                <FormField showStatusIcon={false} field={methodValue} label={'接口'}>
                  <Input field={methodValue} />
                </FormField>
                <FormField field={methodType} label={'匹配方式'}>
                  <Select size='s' options={MATCH_TYPE_OPTIONS} field={methodType} />
                </FormField>
              </>
            )
          })}
        </Form>
      </Form>
      <FormItem label={<H3 style={{ margin: '10px 0' }}>如果满足以下任意条件，进行熔断 </H3>}></FormItem>
      {[...destinations.asArray()].map(field => {
        const { policy, resource, recover } = field.getFields(['policy', 'resource', 'recover', 'resourceSetMark'])
        const { sleepWindow, outlierDetectWhen } = recover.getFields(['sleepWindow', 'outlierDetectWhen'])
        return (
          <>
            <Form style={{ width: '100%', marginBottom: '20px' }}>
              <Form style={{ width: '850px' }}>
                {[...policy.asArray()].map((policyItem, index) => {
                  const {
                    policyName,
                    errorRateToOpen,

                    maxRt,
                    requestVolumeThreshold,
                    consecutiveErrorToOpen,
                  } = policyItem.getFields([
                    'policyName',
                    'errorRateToOpen',
                    'slowRateToOpen',
                    'maxRt',
                    'requestVolumeThreshold',
                    'consecutiveErrorToOpen',
                  ])
                  const threshold =
                    policyName.getValue() === PolicyName.ErrorRate ? errorRateToOpen : consecutiveErrorToOpen
                  return (
                    <Form layout={'inline'} key='111'>
                      <FormField field={policyName} label={'条件'} showStatusIcon={false}>
                        <Select field={policyName} options={PolicyNameOptions} />
                      </FormField>
                      <FormItem>
                        <FormText>{'>='}</FormText>
                      </FormItem>
                      <FormField showStatusIcon={false} field={threshold}>
                        <InputNumber
                          hideButton
                          field={threshold}
                          unit={PolicyMap[policyName.getValue()]?.unit}
                          min={0}
                          max={100}
                        />
                      </FormField>
                      {policyName.getValue() === PolicyName.SlowRate && (
                        <FormField showStatusIcon={false} field={maxRt} label={'最大响应时间'}>
                          <InputNumber size='m' field={maxRt} unit={'秒'} min={0} />
                        </FormField>
                      )}
                      {policyName.getValue() === PolicyName.ErrorRate && (
                        <FormField showStatusIcon={false} field={requestVolumeThreshold} label={'请求数阈值'}>
                          <InputNumber hideButton size='m' field={requestVolumeThreshold} unit={'个'} min={0} />
                        </FormField>
                      )}
                      {policy.getValue().length > 1 && (
                        <FormItem>
                          <Button
                            type='icon'
                            icon='close'
                            onClick={() => removeArrayFieldValue(policy, index)}
                          ></Button>
                        </FormItem>
                      )}
                      <Button type={'icon'} icon={'plus'} onClick={() => addPolicy(policy)}></Button>
                    </Form>
                  )
                })}
              </Form>
            </Form>
            <Form>
              <FormItem label={'半开时间'}>
                <TeaInputNumber
                  value={Number(sleepWindow.getValue().replace('s', ''))}
                  hideButton
                  unit='秒'
                  min={0}
                  onChange={value => sleepWindow.setValue(`${value}s`)}
                ></TeaInputNumber>
              </FormItem>

              <FormItem label={'熔断粒度'}>
                <Segment
                  options={BreakResourceOptions}
                  value={resource.getValue()}
                  onChange={value => resource.setValue(value)}
                ></Segment>
              </FormItem>

              <FormItem label={'主动探测'}>
                <Segment
                  options={OUTLIER_DETECT_MAP_OPTIONS}
                  value={outlierDetectWhen.getValue()}
                  onChange={value => outlierDetectWhen.setValue(value)}
                ></Segment>
              </FormItem>
            </Form>
          </>
        )
      })}
    </>
  )
}

export default purify(function CreateRoute(props: DuckCmpProps<CreateRouteDuck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
  } = duck

  const formApi = form.getAPI(store, dispatch)
  const { editType, ruleType, inboundJsonValue, outboundJsonValue } = formApi.getFields([
    'editType',
    'ruleType',
    'inboundJsonValue',
    'outboundJsonValue',
  ])

  const ref = useRef(null)

  const currentJsonValue = ruleType.getValue() === RuleType.Inbound ? inboundJsonValue : outboundJsonValue
  return (
    <>
      <Form>
        <FormItem label={'编辑方式'}>
          <Segment
            options={EditTypeOptions}
            value={editType.getValue()}
            onChange={value => editType.setValue(value as any)}
          ></Segment>
        </FormItem>
        {/* {!isEdit && (
          <FormItem label={'规则类型'}>
            <Segment
              options={RULE_TYPE_OPTIONS}
              value={ruleType.getValue()}
              onChange={(value) => ruleType.setValue(value as any)}
            ></Segment>
          </FormItem>
        )} */}
        {editType.getValue() === EditType.Json && (
          <FormItem
            message={<Text theme={'danger'}>{currentJsonValue.getTouched() && currentJsonValue.getError()}</Text>}
            label={'JSON编辑'}
          >
            <section style={{ border: '1px solid #ebebeb', width: '1000px' }}>
              <MonacoEditor
                ref={ref}
                monaco={monaco}
                height={400}
                width={1000}
                language='json'
                value={currentJsonValue.getValue()}
                onChange={value => {
                  currentJsonValue.setTouched(true)
                  currentJsonValue.setValue(value)
                }}
              />
            </section>
          </FormItem>
        )}
      </Form>
      {editType.getValue() === EditType.Manual && renderInboundRule(props)}
    </>
  )
})
