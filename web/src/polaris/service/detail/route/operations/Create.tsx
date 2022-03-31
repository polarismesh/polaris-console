import React, { useRef } from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import CreateRouteDuck from './CreateDuck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Card, Form, FormItem, Segment, H3, Button, H4, Justify, MonacoEditor, Text } from 'tea-component'
import { RULE_TYPE_OPTIONS, MATCH_TYPE_OPTIONS, MATCH_TYPE, RuleType } from '../types'
import Input from '@src/polaris/common/duckComponents/form/Input'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Select from '@src/polaris/common/duckComponents/form/Select'
import InputNumber from '@src/polaris/common/duckComponents/form/InputNumber'
import Switch from '@src/polaris/common/duckComponents/form/Switch'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

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

const addMetadata = field => {
  field.setValue([...field.getValue(), { key: '', value: '', type: MATCH_TYPE.EXACT }])
}
const removeArrayFieldValue = (field, index) => {
  const newValue = field.getValue()
  newValue.splice(index, 1)
  field.setValue([...newValue])
}
const addDestination = (field, service, namespace) => {
  field.setValue([
    ...field.getValue(),
    {
      service,
      namespace,
      metadata: [{ key: '', value: '', type: MATCH_TYPE.EXACT }],
      priority: 0,
      weight: 100,
      isolate: true,
    },
  ])
}
const getMetadataForm = field => {
  return [...field.asArray()].map((metadataField, index) => {
    const { key, value, type } = metadataField.getFields(['key', 'value', 'type'])
    return (
      <Form layout={'inline'}>
        <FormField showStatusIcon={false} field={key} label={'标签键'}>
          <Input field={key} />
        </FormField>
        <FormField showStatusIcon={false} field={value} label={'标签值'}>
          <Input field={value} />
        </FormField>
        <FormField field={type} label={'匹配方式'}>
          <Select size='s' options={MATCH_TYPE_OPTIONS} field={type} />
        </FormField>
        {field.getValue()?.length > 1 && (
          <Button type='icon' icon='close' onClick={() => removeArrayFieldValue(field, index)}></Button>
        )}
        <Button type={'icon'} icon={'plus'} onClick={() => addMetadata(field)}></Button>
      </Form>
    )
  })
}

const renderInboundRule = props => {
  const { duck, store, dispatch } = props
  const {
    selector,
    creators,
    ducks: { form },
  } = duck
  const {
    service,
    namespace,
    form: { values },
    data: { ruleType },
  } = selector(store)
  const formApi = form.getAPI(store, dispatch)
  const {
    inboundDestinations,
    inboundSources,
    outboundDestinations,
    outboundSources,
    editType,
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
    'inboundNamespace',
    'inboundService',
    'outboundNamespace',
    'outboundService',
  ])
  const isInbound = ruleType === RuleType.Inbound
  const sources = isInbound ? inboundSources : outboundSources
  const destinations = isInbound ? inboundDestinations : outboundDestinations
  const ruleNamespace = isInbound ? inboundNamespace : outboundNamespace
  const ruleService = isInbound ? inboundService : outboundService
  return (
    <>
      <FormItem
        label={<H4 style={{ margin: '10px 0' }}>{isInbound ? '当以下服务调用本服务时' : '当本服务调用以下服务时'}</H4>}
      ></FormItem>
      <Form>
        <Form style={{ width: '850px' }}>
          <Form layout={'inline'}>
            <FormField showStatusIcon={false} field={ruleNamespace} label={'命名空间'}>
              <Input field={ruleNamespace} />
            </FormField>
            <FormField showStatusIcon={false} field={ruleService} label={'服务'}>
              <Input field={ruleService} />
            </FormField>
          </Form>
        </Form>
      </Form>
      {[...sources.asArray()].map(field => {
        const { metadata } = field.getFields(['namespace', 'service', 'metadata'])
        return (
          <>
            <FormItem label={<H3 style={{ margin: '10px 0' }}>对带有以下标签的请求</H3>}></FormItem>
            <Form style={{ width: '100%' }}>
              <Form style={{ width: '850px' }}>{getMetadataForm(metadata)}</Form>
            </Form>
          </>
        )
      })}
      <FormItem label={<H3 style={{ margin: '10px 0' }}>按权重和优先级路由到以下实例分组</H3>}></FormItem>

      {[...destinations.asArray()].map((field, index) => {
        const { namespace, service, metadata, priority, weight, isolate } = field.getFields([
          'namespace',
          'service',
          'metadata',
          'priority',
          'weight',
          'isolate',
        ])

        return (
          <>
            <Form style={{ width: '100%', marginBottom: '20px' }}>
              <Form style={{ width: '850px' }}>
                <Justify
                  left={<H4 style={{ margin: '10px' }}>实例分组{index + 1}</H4>}
                  right={
                    destinations.getValue().length > 1 && (
                      <Button
                        onClick={() => removeArrayFieldValue(destinations, index)}
                        type='link'
                        style={{ margin: '10px' }}
                      >
                        删除
                      </Button>
                    )
                  }
                ></Justify>
                {getMetadataForm(metadata)}
                <Form layout={'inline'}>
                  <FormField field={weight} label={'权重'}>
                    <InputNumber hideButton field={weight} />
                  </FormField>
                  <FormField field={priority} label={'优先级'}>
                    <InputNumber hideButton field={priority} />
                  </FormField>
                  <FormField field={isolate} label={'是否隔离'}>
                    <Switch field={isolate} />
                  </FormField>
                </Form>
              </Form>
            </Form>
          </>
        )
      })}
      <Button type={'link'} onClick={() => addDestination(destinations, service, namespace)}>
        添加
      </Button>
    </>
  )
}

export default purify(function CreateRoute(props: DuckCmpProps<CreateRouteDuck>) {
  const { duck, store, dispatch } = props
  const {
    selector,
    creators,
    ducks: { form },
  } = duck
  const {
    data: { service, namespace, ruleIndex },
    form: { values },
  } = selector(store)
  const formApi = form.getAPI(store, dispatch)
  const { editType, ruleType, inboundJsonValue, outboundJsonValue } = formApi.getFields([
    'editType',
    'ruleType',
    'inboundJsonValue',
    'outboundJsonValue',
  ])
  const handlers = React.useMemo(
    () => ({
      submit: () => dispatch(duck.creators.submit()),
    }),
    [],
  )
  const ref = useRef(null)
  const isEdit = Number(ruleIndex) !== -1
  const currentJsonValue = ruleType.getValue() === RuleType.Inbound ? inboundJsonValue : outboundJsonValue
  return (
    <>
      <Form>
        {/* <FormItem label={"编辑方式"}>
          <Segment
            options={EditTypeOptions}
            value={editType.getValue()}
            onChange={(value) => editType.setValue(value as any)}
          ></Segment>
        </FormItem> */}
        {/* {!isEdit && (
          <FormItem label={"规则类型"}>
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
