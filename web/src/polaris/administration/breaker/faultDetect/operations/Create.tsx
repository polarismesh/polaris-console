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
  Text,
  InputNumber,
  Segment,
  FormItem,
} from 'tea-component'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import router from '@src/polaris/common/util/router'
import { TAB } from '@src/polaris/service/detail/types'
import CreateDuck from './CreateDuck'

import { LimitMethodType, LimitMethodTypeOptions } from '@src/polaris/administration/accessLimiting/types'
import {
  BlockHttpBodyMethod,
  FaultDetectHttpMethodOptions,
  FaultDetectProtocol,
  FaultDetectProtocolOptions,
} from '../types'
import { BreakerType } from '../../types'
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
  } = duck
  const composedId = selectors.composedId(store)
  const data = selectors.data(store)
  const {
    name,
    description,
    httpConfig,
    tcpConfig,
    udpConfig,
    interval,
    port,
    protocol,
    targetService,
    timeout,
  } = form
    .getAPI(store, dispatch)
    .getFields([
      'name',
      'description',
      'targetService',
      'tcpConfig',
      'udpConfig',
      'httpConfig',
      'interval',
      'port',
      'protocol',
      'timeout',
    ])
  const backRoute = composedId?.namespace
    ? `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}`
    : `/circuitBreaker?type=${BreakerType.FaultDetect}`
  const {
    method: destinationMethod,
    namespace: destinationNamespace,
    service: destinationService,
  } = targetService.getFields(['method', 'namespace', 'service'])
  const { type: methodType, value: methodValue } = destinationMethod.getFields(['type', 'value'])
  const { body, headers, method, url } = httpConfig.getFields(['body', 'headers', 'method', 'url'])
  const { send: tcpSend, receive: tcpReceive } = tcpConfig.getFields(['send', 'receive'])
  const { send: udpSend, receive: udpReceive } = udpConfig.getFields(['send', 'receive'])

  React.useEffect(() => {
    if (composedId?.namespace) {
      destinationNamespace.setValue(composedId?.namespace)
    }

    if (composedId?.service) {
      destinationService.setValue(composedId?.service)
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
      title={composedId?.id ? '编辑主动探测规则' : '新建主动探测规则'}
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
            <FormField field={destinationNamespace} label='命名空间' required>
              <TeaSelect
                value={destinationNamespace.getValue()}
                options={[{ text: '全部命名空间', value: '*' }, ...(data?.namespaceList || [])]}
                onChange={value => {
                  if (value === '*') {
                    destinationNamespace.setValue('*')
                    destinationService.setValue('*')
                    return
                  }
                  destinationNamespace.setValue(value)
                  destinationService.setValue('')
                }}
                searchable
                type={'simulate'}
                appearance={'button'}
                matchButtonWidth
                placeholder='请选择命名空间'
                size='m'
              />
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
                    value={destinationService.getValue() === '*' ? '全部服务' : destinationService.getValue()}
                    onChange={value => {
                      destinationService.setValue(value)
                    }}
                    disabled={destinationNamespace.getValue() === '*'}
                  />
                )}
              </AutoComplete>
            </FormField>
            <FormField label='接口名称' field={methodValue} align='middle'>
              <TagSelectOrInput
                useTagSelect={checkNeedTagInput(methodType.getValue())}
                inputProps={{ placeholder: '请输入接口名称', style: { width: '200px', borderRight: '0px' } }}
                tagSelectProps={{
                  style: { width: '200px', verticalAlign: 'middle', marginRight: '10px' },
                  placeholder: '请输入接口名称',
                }}
                field={methodValue}
              ></TagSelectOrInput>
              <TeaSelect
                options={LimitMethodTypeOptions}
                value={methodType.getValue()}
                onChange={value => methodType.setValue(LimitMethodType[value])}
                size='s'
                appearance={'button'}
                matchButtonWidth
              />
            </FormField>
            <FormField showStatusIcon={false} label='周期' field={interval} suffix={'秒'}>
              <InputNumber
                value={interval.getValue()}
                onChange={v => {
                  interval.setValue(v)
                }}
                size={'m'}
                hideButton
              />
            </FormField>
            <FormField showStatusIcon={false} label='超时时间' field={timeout}>
              <InputNumber
                value={timeout.getValue()}
                onChange={v => {
                  timeout.setValue(v)
                }}
                size={'m'}
                hideButton
                min={0}
              />
            </FormField>
            <FormField showStatusIcon={false} label='端口' field={port}>
              <InputNumber
                value={port.getValue()}
                onChange={v => {
                  port.setValue(v)
                }}
                size={'m'}
                hideButton
                min={0}
                max={65535}
              />
            </FormField>

            <FormField
              showStatusIcon={false}
              label='协议'
              tips={'服务实例下需要存在所选择用于探测的协议，否则无法探测无法生效'}
              field={protocol}
            >
              <Segment
                options={FaultDetectProtocolOptions}
                value={protocol.getValue()}
                onChange={value => protocol.setValue(value)}
              />
            </FormField>
            {protocol.getValue() === FaultDetectProtocol.HTTP && (
              <>
                <FormField label='方法' field={method} align='middle'>
                  <TeaSelect
                    options={FaultDetectHttpMethodOptions}
                    value={method.getValue()}
                    onChange={value => method.setValue(value)}
                    size='m'
                    appearance={'button'}
                    matchButtonWidth
                  />
                </FormField>
                <FormField field={url} label={'Url'}>
                  <Input field={url} placeholder='请输入url 以/开头' />
                </FormField>
                <FormItem label={'Headers'}>
                  {[...headers.asArray()].map((item, index) => {
                    const { key, value } = item.getFields(['key', 'value'])
                    return (
                      <Text parent={'div'} key={index}>
                        <Input field={key} size={'m'} placeholder={'header键'}></Input>
                        <Input field={value} size={'m'} placeholder={'header值'} style={{ marginLeft: '20px' }}></Input>
                        {headers.getValue().length > 1 && (
                          <Button
                            type='icon'
                            icon='close'
                            onClick={() => removeArrayFieldValue(headers, index)}
                          ></Button>
                        )}
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
                {!BlockHttpBodyMethod.includes(method.getValue()) && (
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
                )}
              </>
            )}
            {protocol.getValue() === FaultDetectProtocol.TCP && (
              <>
                <FormField field={tcpSend} label={'Send'}>
                  <Input field={tcpSend} />
                </FormField>
                <FormField field={tcpReceive} label={'Headers'}>
                  {[...tcpReceive.asArray()].map((item, index) => {
                    return (
                      <Text parent={'div'} key={index}>
                        <Input field={item} size={'m'} placeholder={'header键'}></Input>
                        <Button
                          type='icon'
                          icon='close'
                          onClick={() => removeArrayFieldValue(tcpReceive, index)}
                        ></Button>
                        <Button type={'icon'} icon={'plus'} onClick={() => addArrayFieldValue(tcpReceive, '')}></Button>
                      </Text>
                    )
                  })}
                  {tcpReceive.getValue()?.length < 1 && (
                    <Button type={'icon'} icon={'plus'} onClick={() => addArrayFieldValue(tcpReceive, '')}></Button>
                  )}
                </FormField>
              </>
            )}
            {protocol.getValue() === FaultDetectProtocol.UDP && (
              <>
                <FormField field={udpSend} label={'Send'}>
                  <Input field={udpSend} />
                </FormField>
                <FormField field={udpReceive} label={'Headers'}>
                  {[...udpReceive.asArray()].map((item, index) => {
                    return (
                      <Text parent={'div'} key={index}>
                        <Input field={item} size={'m'} placeholder={'header键'}></Input>
                        <Button
                          type='icon'
                          icon='close'
                          onClick={() => removeArrayFieldValue(udpReceive, index)}
                        ></Button>

                        <Button type={'icon'} icon={'plus'} onClick={() => addArrayFieldValue(udpReceive, '')}></Button>
                      </Text>
                    )
                  })}
                  {udpReceive.getValue()?.length < 1 && (
                    <Button type={'icon'} icon={'plus'} onClick={() => addArrayFieldValue(udpReceive, '')}></Button>
                  )}
                </FormField>
              </>
            )}
          </Form>
          <Form.Action>
            <Button type='primary' onClick={() => dispatch(creators.submit())}>
              提交
            </Button>
            <Button
              onClick={() => {
                if (composedId?.namespace) {
                  router.navigate(
                    `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}&tab=${TAB.CircuitBreaker}&type=${BreakerType.FaultDetect}`,
                  )
                } else {
                  router.navigate(`/circuitBreaker?type=${BreakerType.FaultDetect}`)
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
