import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import {
  Form,
  Card,
  Select as TeaSelect,
  Button,
  Input as TeaInput,
  AutoComplete,
  Col,
  Row,
  Text,
  H6,
  FormItem,
  ExternalLink,
  FormText,
  InputNumber,
  Segment,
  Icon,
} from 'tea-component'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import router from '@src/polaris/common/util/router'
import { TAB } from '@src/polaris/service/detail/types'
import CreateDuck from './CreateDuck'
import { LimitMethodType, LimitMethodTypeOptions } from '../../accessLimiting/types'
import {
  BreakerType,
  ErrorConditionOptions,
  ErrorConditionType,
  InterfaceBreakLevelOptions,
  ServiceBreakLevelOptions,
  TriggerType,
  TriggerTypeMap,
  TriggerTypeOptions,
  ServiceLevelType,
  BreakLevelType,
} from '../types'
import Select from '@src/polaris/common/duckComponents/form/Select'
import Switch from '@src/polaris/common/duckComponents/form/Switch'
import TagSelectOrInput, { checkNeedTagInput } from '@src/polaris/common/components/TagSelectOrInput'

const addArrayFieldValue = (field, defaultValue) => {
  field.setValue([...field.getValue(), defaultValue])
}
const removeArrayFieldValue = (field, index) => {
  const newValue = field.getValue()
  newValue.splice(index, 1)
  field.setValue([...newValue])
}
export default purify(function CustomRoutePage(props: DuckCmpProps<CreateDuck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selectors,
    creators,
    selector,
  } = duck
  const composedId = selectors.composedId(store)
  const data = selectors.data(store)
  const {
    name,
    description,
    ruleMatcher,
    errorConditions,
    triggerCondition,
    level,
    recoverCondition,
    faultDetectConfig,
    enable,
    fallbackConfig,
  } = form
    .getAPI(store, dispatch)
    .getFields([
      'name',
      'enable',
      'description',
      'ruleMatcher',
      'errorConditions',
      'triggerCondition',
      'fallbackConfig',
      'faultDetectConfig',
      'recoverCondition',
      'level',
    ])
  const { type } = selector(store)
  const { source, destination } = ruleMatcher.getFields(['source', 'destination'])
  const { namespace: sourceNamespace, service: sourceService } = source.getFields(['namespace', 'service'])
  const {
    namespace: destinationNamespace,
    service: destinationService,
    method: destinationMethod,
  } = destination.getFields(['namespace', 'service', 'method'])
  const { type: methodType, value: methodValue } = destinationMethod.getFields(['type', 'value'])
  const { sleepWindow, consecutiveSuccess } = recoverCondition.getFields(['sleepWindow', 'consecutiveSuccess'])
  const { enable: faultDetectEnable } = faultDetectConfig.getFields(['enable'])
  const { enable: fallbackConfigEnable, response: fallbackResponse } = fallbackConfig.getFields(['enable', 'response'])
  const { body, code, headers } = fallbackResponse.getFields(['body', 'code', 'headers'])
  const backRoute = composedId?.namespace
    ? `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}&tab=circuitbreaker`
    : `/circuitBreaker?type=${type}`

  React.useEffect(() => {
    if (composedId?.namespace) {
      sourceNamespace.setValue(composedId?.namespace)
    }

    if (composedId?.service) {
      sourceService.setValue(composedId?.service)
    }
  }, [composedId?.namespace, composedId?.service])

  if (!data) {
    return <noscript />
  }
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={composedId?.id ? '编辑熔断规则' : '新建熔断规则'}
      backRoute={backRoute}
    >
      <Card>
        <Card.Body>
          <Form>
            <FormField label='规则名称' field={name} message='最长64个字符' required>
              <Input field={name} maxLength={64} size='l' />
            </FormField>
            <FormField label='描述' field={description}>
              <Input field={description} maxLength={64} size='l' multiple />
            </FormField>
            <Form.Item label='匹配条件' className='compact-form-control'>
              <Form style={{ position: 'relative', width: '1100px' }}>
                <div
                  style={{
                    borderTop: '1px dashed gray',
                    right: 'calc(25% + 30px)',
                    width: 'calc(50% - 60px)',
                    top: '29px',
                    position: 'absolute',
                  }}
                >
                  <Icon type={'arrowright'} style={{ position: 'absolute', right: '-9px', top: '-9px' }} />
                </div>
                <Row gap={30}>
                  <Col span={12}>
                    <div style={{ margin: '10px 0' }}>
                      <Text parent={'div'} style={{ width: '100%', textAlign: 'center', fontWeight: 'bolder' }}>
                        主调服务
                      </Text>
                    </div>
                    <Card bordered>
                      <Card.Body title='主调服务'>
                        <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                          <FormField field={sourceNamespace} label='命名空间' required>
                            <AutoComplete
                              options={[
                                ...new Set([
                                  {
                                    text: '全部命名空间',
                                    value: '*',
                                    disabled: destinationNamespace.getValue() === '*',
                                  },
                                  ...(sourceNamespace.getValue()
                                    ? [
                                        {
                                          text: `(输入值)${sourceNamespace.getValue()}`,
                                          value: sourceNamespace.getValue(),
                                        },
                                      ]
                                    : []),
                                  ...data?.namespaceList,
                                ]),
                              ]}
                              tips='没有匹配的命名空间名称'
                              onChange={value => {
                                if (value === '*') {
                                  sourceNamespace.setValue('*')
                                  sourceService.setValue('*')
                                  return
                                }
                                sourceNamespace.setValue(value)
                                sourceService.setValue('')
                              }}
                            >
                              {ref => (
                                <TeaInput
                                  ref={ref}
                                  value={
                                    sourceNamespace.getValue() === '*' ? '全部命名空间' : sourceNamespace.getValue()
                                  }
                                  onChange={value => {
                                    if (value === '*') {
                                      sourceNamespace.setValue('*')
                                      sourceService.setValue('*')
                                      return
                                    }
                                    sourceNamespace.setValue(value)
                                    sourceService.setValue('')
                                  }}
                                  style={{ width: '80%', maxWidth: '600px' }}
                                />
                              )}
                            </AutoComplete>
                          </FormField>
                          <FormField field={sourceService} label='服务名称' required>
                            <AutoComplete
                              options={[
                                ...new Set([
                                  { text: '全部服务', value: '*' },
                                  ...(sourceService.getValue()
                                    ? [{ text: `(输入值)${sourceService.getValue()}`, value: sourceService.getValue() }]
                                    : []),
                                  ...(data?.serviceList.filter(o => {
                                    return o.namespace === sourceNamespace.getValue()
                                  }) || []),
                                ]),
                              ]}
                              tips='没有匹配的服务名称'
                              onChange={value => {
                                sourceService.setValue(value)
                              }}
                            >
                              {ref => (
                                <TeaInput
                                  ref={ref}
                                  value={sourceService.getValue() === '*' ? '全部服务' : sourceService.getValue()}
                                  onChange={value => {
                                    sourceService.setValue(value)
                                  }}
                                  disabled={sourceNamespace.getValue() === '*'}
                                  style={{ width: '80%', maxWidth: '600px' }}
                                />
                              )}
                            </AutoComplete>
                          </FormField>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <div style={{ margin: '10px 0' }}>
                      <Text parent={'div'} style={{ width: '100%', textAlign: 'center', fontWeight: 'bolder' }}>
                        目标服务
                      </Text>
                    </div>
                    <Card bordered>
                      <Card.Body title='被调服务'>
                        <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                          <FormField field={destinationNamespace} label='命名空间' required>
                            <AutoComplete
                              options={[
                                ...new Set([
                                  {
                                    text: '全部命名空间',
                                    value: '*',
                                    disabled: sourceNamespace.getValue() === '*',
                                  },
                                  ...(destinationNamespace.getValue()
                                    ? [
                                        {
                                          text: `(输入值)${destinationNamespace.getValue()}`,
                                          value: destinationNamespace.getValue(),
                                        },
                                      ]
                                    : []),
                                  ...data?.namespaceList,
                                ]),
                              ]}
                              tips='没有匹配的命名空间名称'
                              onChange={value => {
                                if (value === '*') {
                                  destinationNamespace.setValue('*')
                                  destinationService.setValue('*')
                                  return
                                }
                                destinationNamespace.setValue(value)
                                destinationService.setValue('')
                              }}
                            >
                              {ref => (
                                <TeaInput
                                  ref={ref}
                                  value={
                                    destinationNamespace.getValue() === '*'
                                      ? '全部命名空间'
                                      : destinationNamespace.getValue()
                                  }
                                  onChange={value => {
                                    if (value === '*') {
                                      destinationNamespace.setValue('*')
                                      destinationService.setValue('*')
                                      return
                                    }
                                    destinationNamespace.setValue(value)
                                    destinationService.setValue('')
                                  }}
                                  style={{ width: '80%', maxWidth: '600px' }}
                                />
                              )}
                            </AutoComplete>
                          </FormField>
                          <FormField field={destinationService} label='服务名称' required>
                            <AutoComplete
                              options={[
                                ...new Set([
                                  { text: '全部服务', value: '*' },
                                  ...(destinationService.getValue()
                                    ? [
                                        {
                                          text: `(输入值)${destinationService.getValue()}`,
                                          value: destinationService.getValue(),
                                        },
                                      ]
                                    : []),
                                  ...(data?.serviceList.filter(o => {
                                    return o.namespace === destinationNamespace.getValue()
                                  }) || []),
                                ]),
                              ]}
                              tips='没有匹配的服务名称'
                              onChange={value => {
                                destinationService.setValue(value)
                              }}
                            >
                              {ref => (
                                <TeaInput
                                  ref={ref}
                                  value={
                                    destinationService.getValue() === '*' ? '全部服务' : destinationService.getValue()
                                  }
                                  onChange={value => {
                                    destinationService.setValue(value)
                                  }}
                                  disabled={destinationNamespace.getValue() === '*'}
                                  style={{ width: '80%', maxWidth: '600px' }}
                                />
                              )}
                            </AutoComplete>
                          </FormField>
                          {level.getValue() === BreakLevelType.Method && (
                            <FormField label='接口名称' field={methodValue} align='middle'>
                              <TagSelectOrInput
                                useTagSelect={checkNeedTagInput(methodType.getValue())}
                                inputProps={{
                                  placeholder: '请输入接口名称',
                                  style: { width: 'calc(80% - 101px)', borderRight: '0px' },
                                }}
                                tagSelectProps={{
                                  style: { width: 'calc(80% - 111px)', marginRight: '10px', verticalAlign: 'middle' },
                                }}
                                field={methodValue}
                              ></TagSelectOrInput>
                              <TeaSelect
                                options={LimitMethodTypeOptions}
                                value={methodType.getValue()}
                                onChange={value => methodType.setValue(LimitMethodType[value])}
                                size='s'
                                type={'simulate'}
                                appearance={'button'}
                                matchButtonWidth
                              />
                            </FormField>
                          )}
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Form>
            </Form.Item>
            <Form.Item label='熔断配置' className='compact-form-control'>
              <Card style={{ width: '1100px', marginRight: '0px', marginLeft: '0px' }} bordered>
                <Card.Body>
                  <div>
                    <H6 className='card-module-h6-title-style'>错误判断条件</H6>
                    <Text theme='label'>满足以下任意应答条件的请求会被标识为错误请求</Text>
                  </div>
                  <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                    <FormItem required>
                      {[...errorConditions.asArray()].map((field, index) => {
                        const { condition, inputType } = field.getFields(['condition', 'inputType'])
                        const { value, type } = condition.getFields(['value', 'type'])
                        return (
                          <Form layout={'inline'} key={index} className={''}>
                            <FormField field={inputType} showStatusIcon={false}>
                              <TeaSelect
                                value={inputType.getValue()}
                                onChange={v => {
                                  inputType.setValue(v)
                                  if (v === ErrorConditionType.DELAY) {
                                    type.setValue(LimitMethodType.EXACT)
                                  }
                                }}
                                options={ErrorConditionOptions}
                                appearance={'button'}
                              />
                            </FormField>
                            {inputType.getValue() === ErrorConditionType.DELAY && (
                              <FormItem>
                                <FormText>超过</FormText>
                              </FormItem>
                            )}
                            {inputType.getValue() !== ErrorConditionType.DELAY && (
                              <FormItem>
                                <Select
                                  field={type}
                                  options={LimitMethodTypeOptions}
                                  disabled={inputType.getValue() === ErrorConditionType.DELAY}
                                  size={'s'}
                                />
                              </FormItem>
                            )}
                            <FormField
                              showStatusIcon={false}
                              field={value}
                              suffix={inputType.getValue() === ErrorConditionType.DELAY ? '毫秒' : ''}
                              style={{ paddingTop: '0px' }}
                            >
                              <TagSelectOrInput
                                useTagSelect={
                                  inputType.getValue() !== ErrorConditionType.DELAY &&
                                  checkNeedTagInput(type.getValue())
                                }
                                inputProps={{ size: 'm' }}
                                tagSelectProps={{
                                  style: { width: '600px', maxWidth: '600px' },
                                }}
                                field={value}
                              ></TagSelectOrInput>
                            </FormField>
                            {errorConditions.getValue().length > 1 && (
                              <FormItem>
                                <Button
                                  type='icon'
                                  icon='close'
                                  onClick={() => removeArrayFieldValue(errorConditions, index)}
                                ></Button>
                              </FormItem>
                            )}
                            <Button
                              type={'icon'}
                              icon={'plus'}
                              onClick={() =>
                                addArrayFieldValue(errorConditions, {
                                  inputType: ErrorConditionType.RET_CODE,
                                  condition: { value: '', type: 'EXACT' },
                                })
                              }
                            ></Button>
                          </Form>
                        )
                      })}
                    </FormItem>
                  </Form>
                </Card.Body>
                <Card.Body>
                  <div>
                    <H6 className='card-module-h6-title-style'>熔断触发条件</H6>
                    <Text theme='label'>满足以下任意条件可触发熔断</Text>
                  </div>
                  <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                    <FormItem required>
                      {[...triggerCondition.asArray()].map((field, index) => {
                        const { triggerType, errorCount, errorPercent, interval, minimumRequest } = field.getFields([
                          'triggerType',
                          'errorCount',
                          'errorPercent',
                          'interval',
                          'minimumRequest',
                        ])
                        return (
                          <Form layout={'inline'} key={index}>
                            <FormField field={triggerType} showStatusIcon={false}>
                              <TeaSelect
                                value={triggerType.getValue()}
                                onChange={v => {
                                  triggerType.setValue(v)
                                }}
                                options={TriggerTypeOptions}
                                appearance={'button'}
                              />
                            </FormField>
                            <FormItem>
                              <FormText>{'>='}</FormText>
                            </FormItem>
                            {triggerType.getValue() === TriggerType.ERROR_RATE && (
                              <>
                                <FormField
                                  showStatusIcon={false}
                                  field={errorPercent}
                                  suffix={TriggerTypeMap[triggerType.getValue()]?.unit}
                                >
                                  <InputNumber
                                    value={errorPercent.getValue()}
                                    onChange={v => {
                                      errorPercent.setValue(v)
                                    }}
                                    size={'m'}
                                    hideButton
                                  />
                                </FormField>
                                <FormField showStatusIcon={false} label={'统计周期'} field={interval} suffix={'秒'}>
                                  <InputNumber
                                    value={interval.getValue()}
                                    onChange={v => {
                                      interval.setValue(v)
                                    }}
                                    size={'m'}
                                    hideButton
                                  />
                                </FormField>
                                <FormField
                                  showStatusIcon={false}
                                  label={'最小请求数'}
                                  field={minimumRequest}
                                  suffix={'个'}
                                >
                                  <InputNumber
                                    value={minimumRequest.getValue()}
                                    onChange={v => {
                                      minimumRequest.setValue(v)
                                    }}
                                    size={'m'}
                                    hideButton
                                  />
                                </FormField>
                              </>
                            )}
                            {triggerType.getValue() === TriggerType.CONSECUTIVE_ERROR && (
                              <>
                                <FormField
                                  showStatusIcon={false}
                                  field={errorCount}
                                  suffix={TriggerTypeMap[triggerType.getValue()]?.unit}
                                >
                                  <InputNumber
                                    value={errorCount.getValue()}
                                    onChange={v => {
                                      errorCount.setValue(v)
                                    }}
                                    size={'m'}
                                    hideButton
                                  />
                                </FormField>
                              </>
                            )}
                            {triggerCondition.getValue().length > 1 && (
                              <FormItem>
                                <Button
                                  type='icon'
                                  icon='close'
                                  onClick={() => removeArrayFieldValue(triggerCondition, index)}
                                ></Button>
                              </FormItem>
                            )}
                            <Button
                              type={'icon'}
                              icon={'plus'}
                              onClick={() =>
                                addArrayFieldValue(triggerCondition, {
                                  triggerType: TriggerType.ERROR_RATE,
                                  errorCount: 10,
                                  errorPercent: 10,
                                  interval: 10,
                                  minimumRequest: 10,
                                })
                              }
                            ></Button>
                          </Form>
                        )
                      })}
                    </FormItem>
                  </Form>
                </Card.Body>
                <Card.Body>
                  <div>
                    <H6 className='card-module-h6-title-style'>熔断粒度</H6>
                    <Text theme='label'>熔断触发时影响的资源粒度</Text>
                  </div>
                  <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                    <FormItem required>
                      <Form layout={'inline'}>
                        <FormField field={level}>
                          <Segment
                            value={level.getValue()}
                            onChange={v => level.setValue(v)}
                            options={
                              type === BreakerType.Service ? ServiceBreakLevelOptions : InterfaceBreakLevelOptions
                            }
                          ></Segment>
                        </FormField>
                      </Form>
                    </FormItem>
                  </Form>
                </Card.Body>
                <Card.Body>
                  <div>
                    <H6 className='card-module-h6-title-style'>熔断恢复</H6>
                    <Text theme='label'>
                      经过熔断时长后，会触发熔断恢复机制，若符合预期，则结束熔断；否则重新回到熔断阶段
                    </Text>
                  </div>
                  <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                    <FormItem required>
                      <Form>
                        <FormField field={sleepWindow} label={'熔断时长'} showStatusIcon={false} suffix={'秒'}>
                          <InputNumber
                            value={sleepWindow.getValue()}
                            onChange={v => {
                              sleepWindow.setValue(v)
                            }}
                            size={'m'}
                            hideButton
                          />
                        </FormField>
                        <FormField field={consecutiveSuccess} label={'熔断恢复策略'} showStatusIcon={false}>
                          <FormText>
                            当满足
                            <InputNumber
                              value={consecutiveSuccess.getValue()}
                              onChange={v => {
                                consecutiveSuccess.setValue(v)
                              }}
                              size={'m'}
                              hideButton
                            />
                            个连续成功请求后恢复
                          </FormText>
                        </FormField>
                      </Form>
                    </FormItem>
                  </Form>
                </Card.Body>
              </Card>
            </Form.Item>
            <FormField
              label='主动探测'
              message={
                <>
                  <Text parent={'div'}>
                    开启主动探测时，客户端将会根据您配置的探测规则对目标被调服务进行探测；
                    主动探测请求与业务调用合并判断熔断恢复（如未匹配到探测规则，则不会生效）；
                    未开启主动探测时，会仅根据业务调用判断熔断恢复。
                  </Text>
                  <Text parent={'div'}>
                    <ExternalLink href={`/#/circuitBreaker?type=${BreakerType.FaultDetect}`}>
                      查看主动探测规则
                    </ExternalLink>
                  </Text>
                </>
              }
              field={faultDetectEnable}
            >
              <Switch field={faultDetectEnable} />
            </FormField>
            {ServiceLevelType.indexOf(level.getValue() as any) > -1 && (
              <Form.Item label='熔断后降级' className='compact-form-control'>
                <Switch field={fallbackConfigEnable} />
                {fallbackConfigEnable.getValue() && (
                  <Card style={{ width: '1100px', marginRight: '0px', marginLeft: '0px', marginTop: '20px' }} bordered>
                    <Card.Body>
                      <div>
                        <H6 className='card-module-h6-title-style'>自定义响应</H6>
                        <Text theme='label'>熔断触发后的降级响应策略</Text>
                      </div>
                      <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                        <FormItem>
                          <Form>
                            <FormField field={code} label={'返回码'}>
                              <InputNumber
                                value={code.getValue()}
                                onChange={v => {
                                  code.setValue(v)
                                }}
                                size={'m'}
                                hideButton
                              />
                            </FormField>
                            <FormItem label={'Headers'}>
                              {[...headers.asArray()].map((item, index) => {
                                const { key, value } = item.getFields(['key', 'value'])
                                return (
                                  <Text parent={'div'} key={index} style={{ marginBottom: '15px' }}>
                                    <Input field={key} size={'m'} placeholder={'header键'}></Input>
                                    <Input
                                      field={value}
                                      size={'m'}
                                      placeholder={'header值'}
                                      style={{ marginLeft: '20px' }}
                                    ></Input>
                                    <Button
                                      type='icon'
                                      icon='close'
                                      onClick={() => removeArrayFieldValue(headers, index)}
                                    ></Button>
                                    <Button
                                      type={'icon'}
                                      icon={'plus'}
                                      onClick={() =>
                                        addArrayFieldValue(headers, {
                                          key: '',
                                          value: '',
                                        })
                                      }
                                    ></Button>
                                  </Text>
                                )
                              })}
                              {headers.getValue()?.length < 1 && (
                                <Button
                                  type={'icon'}
                                  icon={'plus'}
                                  onClick={() =>
                                    addArrayFieldValue(headers, {
                                      key: '',
                                      value: '',
                                    })
                                  }
                                ></Button>
                              )}
                            </FormItem>
                            <FormField field={body} label={'Body'}>
                              <TeaInput.TextArea
                                value={body.getValue()}
                                onChange={v => {
                                  body.setValue(v)
                                }}
                                size={'m'}
                                rows={4}
                              />
                            </FormField>
                          </Form>
                        </FormItem>
                      </Form>
                    </Card.Body>
                  </Card>
                )}
              </Form.Item>
            )}
            <FormField label='是否开启' field={enable}>
              <Switch field={enable} />
            </FormField>
          </Form>
          <Form.Action>
            <Button type='primary' onClick={() => dispatch(creators.submit())}>
              提交
            </Button>
            <Button
              onClick={() => {
                if (composedId?.namespace) {
                  router.navigate(
                    `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}&tab=${TAB.CircuitBreaker}`,
                  )
                } else {
                  router.navigate(`/circuitBreaker?type=${type}`)
                }
              }}
            >
              取消
            </Button>
          </Form.Action>
        </Card.Body>
      </Card>
    </DetailPage>
  )
})
