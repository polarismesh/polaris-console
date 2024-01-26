import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import LimitRuleCreatePageDuck from './CreateDuck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import {
  Form,
  FormControl,
  Segment,
  Card,
  Select,
  Button,
  Icon,
  Text,
  Table,
  InputAdornment,
  H6,
  Input as TeaInput,
  AutoComplete,
} from 'tea-component'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import InputNumber from '@src/polaris/common/duckComponents/form/InputNumber'
import Switch from '@src/polaris/common/duckComponents/form/Switch'
import {
  LimitTypeOptions,
  LimitType,
  LimitMethodTypeOptions,
  LimitMethodType,
  LimitArgumentsType,
  LimitArgumentsTypeOptions,
  LimitActionOptions,
  LimitAction,
  LimitFailoverOptions,
  LimitFailover,
  LimitAmountsValidationUnit,
  LimitAmountsValidationUnitOptions,
} from '../types'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { FieldAPI } from '@src/polaris/common/ducks/Form'
import { LimitArgumentsConfigForFormFilling } from '../model'
import router from '@src/polaris/common/util/router'
import { TAB } from '@src/polaris/service/detail/types'
import TagSelectOrInput, { checkNeedTagInput } from '@src/polaris/common/components/TagSelectOrInput'
import { FeatureDisplayType, useCheckFeatureValid } from '@src/polaris/common/util/checkFeature'

insertCSS(
  'create-rule-form',
  `.card-module-h6-title-style {
    display: inline-block;
    margin-right: 5px
  }
  .form-item-space {
    margin-right: 8px
  }
`,
)
export const MatchingLabelTips = (
  <>
    <Text parent={'div'}>多个请求匹配规则之间是且的关系</Text>
    <Text parent={'div'}>部分匹配运算符的说明如下：</Text>
    <Text parent={'div'}>
      包含：多字符串取OR匹配，传入的值只要匹配到其中一个字符串，就算匹配成功。字符串之间使用逗号进行分割。值格式为'value1,value2,value3‘，匹配到其中一个就算成功。
    </Text>
    <Text parent={'div'}>
      不包含：多字符串取反匹配，传入的值必须都没有出现在所配置的字符串列表中，才算匹配通过。值格式为'value1,value2,value3‘，全部不等于才算成功。
    </Text>
  </>
)
export default purify(function LimitRuleCreatePage(props: DuckCmpProps<LimitRuleCreatePageDuck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selectors,
    creators,
  } = duck
  const composedId = selectors.composedId(store)
  const data = selectors.data(store)

  const {
    name: nameField,
    type: typeField,
    namespace: namespaceField,
    service: serviceField,
    method: methodField,
    arguments: argumentsField,
    amounts: amountsField,
    regex_combine: regex_combine_Field,
    action: actionField,
    max_queue_delay: max_queue_delay_Field,
    failover: failoverField,
    disable: disableField,
  } = form
    .getAPI(store, dispatch)
    .getFields([
      'name',
      'type',
      'namespace',
      'service',
      'method',
      'arguments',
      'amounts',
      'regex_combine',
      'action',
      'max_queue_delay',
      'failover',
      'disable',
    ])

  const { type: methodTypeField, value: methodValueField } = methodField.getFields(['type', 'value'])

  // 只有单机限流模式才有匀速排队
  const limitType = typeField.getValue()
  const limitActionOptions =
    limitType === LimitType.LOCAL ? LimitActionOptions : LimitActionOptions.filter(o => o.value === LimitAction.REJECT)
  // 获取arguments amounts列表值
  const argumentsList = argumentsField.getValue()
  const amountsList = amountsField.getValue()

  function getArgumentsKeyComp(type: LimitArgumentsType, recordField: FieldAPI<LimitArgumentsConfigForFormFilling>) {
    const { key: keyField } = recordField.getFields(['key'])
    const keyValidate = keyField.getTouched() && keyField.getError()
    let keyComponent: React.ReactNode = <noscript />

    if (type === LimitArgumentsType.CALLER_SERVICE) {
      keyComponent = (
        <Select
          options={data?.namespaceList}
          value={keyField.getValue()}
          onChange={value => keyField.setValue(value)}
          type={'simulate'}
          appearance={'button'}
          matchButtonWidth
          placeholder='请选择命名空间'
          size='m'
        />
      )
    } else if (type === LimitArgumentsType.METHOD) {
      keyField.setValue('$method')
      keyComponent = <TeaInput placeholder='$method' disabled />
    } else if (type === LimitArgumentsType.CALLER_IP) {
      keyField.setValue('$caller_ip')
      keyComponent = <TeaInput placeholder='$caller_ip' disabled />
    } else {
      keyComponent = <Input placeholder='请输入Key值' field={keyField} onChange={key => keyField.setValue(key)} />
    }

    return (
      <FormControl
        status={keyValidate ? 'error' : null}
        message={keyValidate ? keyField.getError() : ''}
        showStatusIcon={false}
        style={{ display: 'inline', padding: 0 }}
      >
        {keyComponent}
      </FormControl>
    )
  }

  function getArgumentsValueComp(type: LimitArgumentsType, recordField: FieldAPI<LimitArgumentsConfigForFormFilling>) {
    const { value: valueField, key: keyField, operator: operatorField } = recordField.getFields([
      'value',
      'key',
      'operator',
    ])
    const valueValidate = valueField.getTouched() && valueField.getError()
    let valueComponent: React.ReactNode = <noscript />
    const needInputType = [LimitMethodType.REGEX, LimitMethodType.IN, LimitMethodType.NOT_IN]
    if (type === LimitArgumentsType.CALLER_SERVICE && !needInputType.includes(operatorField.getValue())) {
      valueComponent = (
        <Select
          value={valueField.getValue()}
          options={data?.serviceList.filter(o => {
            if (keyField.getValue()) {
              return o.namespace === keyField.getValue()
            } else {
              return data?.serviceList
            }
          })}
          onChange={value => valueField.setValue(value)}
          searchable
          type={'simulate'}
          appearance={'button'}
          matchButtonWidth
          placeholder='请选择服务名'
          size='m'
        ></Select>
      )
    } else {
      valueComponent = (
        <>
          <TagSelectOrInput
            useTagSelect={checkNeedTagInput(operatorField.getValue())}
            inputProps={{ placeholder: '请输入Value值', size: 'full' }}
            tagSelectProps={{
              options: data?.serviceList.filter(o => {
                if (keyField.getValue()) {
                  return o.namespace === keyField.getValue()
                } else {
                  return data?.serviceList
                }
              }),
              style: { display: 'block', width: '100%' },
            }}
            field={valueField}
          ></TagSelectOrInput>
        </>
      )
    }

    return (
      <FormControl
        status={valueValidate ? 'error' : null}
        message={valueValidate ? valueField.getError() : ''}
        showStatusIcon={false}
        style={{ display: 'inline', padding: 0 }}
      >
        {valueComponent}
      </FormControl>
    )
  }

  const backRoute = composedId?.namespace
    ? `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}&tab=ratelimiter`
    : `/accesslimit`

  React.useEffect(() => {
    if (composedId?.namespace) {
      namespaceField.setValue(composedId?.namespace)
    }

    if (composedId?.service) {
      serviceField.setValue(composedId?.service)
    }
  }, [composedId?.namespace, composedId?.service])

  const [serviceInputValue, setServiceInputValue] = React.useState('')
  const [globalLimitFeature] = useCheckFeatureValid(['accesslimit-global'])
  const globalLimitEnable = globalLimitFeature ? globalLimitFeature?.display === FeatureDisplayType.visible : true
  const filteredLimitTypeOptions = LimitTypeOptions.map(item => ({
    ...item,
    disabled: item.value === LimitType.GLOBAL && !globalLimitEnable,
    tooltip: item.value === LimitType.GLOBAL && !globalLimitEnable ? globalLimitFeature?.tip : '',
  }))
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={composedId?.id ? '编辑服务限流规则' : '新建服务限流规则'}
      backRoute={backRoute}
    >
      <Card>
        <Card.Body>
          <Form>
            <FormField label='限流规则名称' field={nameField} message='最长64个字符' required>
              <Input field={nameField} maxLength={64} size='l' />
            </FormField>
            <FormField label='限流类型' field={typeField} required>
              <Segment
                value={typeField.getValue()}
                options={filteredLimitTypeOptions}
                onChange={value => {
                  typeField.setValue(LimitType[value])
                  if (value === LimitType.GLOBAL) {
                    actionField.setValue(LimitAction.REJECT)
                  }
                }}
              />
            </FormField>

            <Form.Item label='限流规则详情'>
              <Card bordered>
                <Card.Body
                  title='目标服务'
                  subtitle='您可以对目标服务的指定接口设置限流规则。当该接口被调用时，符合匹配规则的请求，则会触发限流规则'
                >
                  <Form style={{ padding: '20px' }}>
                    <FormField field={namespaceField} label='命名空间' required>
                      <Select
                        value={namespaceField.getValue()}
                        options={data?.namespaceList}
                        onChange={value => {
                          namespaceField.setValue(value)
                          serviceField.setValue('')
                          setServiceInputValue('')
                        }}
                        searchable
                        type={'simulate'}
                        appearance={'button'}
                        matchButtonWidth
                        placeholder='请选择命名空间'
                        size='m'
                        disabled={!!composedId?.namespace}
                      />
                    </FormField>
                    <FormField field={serviceField} label='服务名称' required>
                      <AutoComplete
                        options={data?.serviceList.filter(o => {
                          if (namespaceField.getValue()) {
                            return o.text.includes(serviceInputValue) && o.namespace === namespaceField.getValue()
                          } else {
                            return o.text.includes(serviceInputValue)
                          }
                        })}
                        tips='没有匹配的服务名称'
                        onChange={value => {
                          const option = data?.serviceList.find(opt => opt.value === value)
                          setServiceInputValue(option.value)
                          serviceField.setValue(option.value)
                        }}
                      >
                        {ref => (
                          <TeaInput
                            ref={ref}
                            value={serviceField.getValue()}
                            onChange={value => {
                              setServiceInputValue(value)
                              serviceField.setValue(value)
                            }}
                            disabled={!!composedId?.service}
                          />
                        )}
                      </AutoComplete>
                    </FormField>
                    <FormField label='接口名称' field={methodField} align='middle'>
                      <TagSelectOrInput
                        useTagSelect={checkNeedTagInput(methodTypeField.getValue())}
                        inputProps={{ placeholder: '请输入接口名称，默认全选', className: 'form-item-space' }}
                        tagSelectProps={{
                          style: { width: '500px', verticalAlign: 'middle', marginRight: '10px' },
                          placeholder: '请输入接口名称，默认全选',
                        }}
                        field={methodValueField}
                      ></TagSelectOrInput>
                      <Select
                        options={LimitMethodTypeOptions}
                        value={methodTypeField.getValue()}
                        onChange={value => methodTypeField.setValue(LimitMethodType[value])}
                        size='s'
                        type={'simulate'}
                        appearance={'button'}
                        matchButtonWidth
                      />
                    </FormField>
                    <Form.Item label='请求匹配规则' align='middle' tips={MatchingLabelTips}>
                      {argumentsList?.length > 0 && (
                        <Table
                          hideHeader
                          verticalTop
                          recordKey={o => {
                            const { id } = o.getFields(['id'])
                            return id.getValue()
                          }}
                          bordered
                          style={{ width: '100%' }}
                          records={[...argumentsField.asArray()]}
                          columns={[
                            {
                              key: 'type',
                              header: '类型',
                              width: 220,
                              render: item => {
                                const { type, key } = item.getFields(['type', 'key'])
                                const validate = type.getTouched() && type.getError()
                                return (
                                  <FormControl
                                    status={validate ? 'error' : null}
                                    message={validate ? type.getError() : ''}
                                    showStatusIcon={false}
                                    style={{ display: 'inline', padding: 0 }}
                                  >
                                    <Select
                                      options={LimitArgumentsTypeOptions}
                                      value={type.getValue()}
                                      onChange={value => {
                                        type.setValue(LimitArgumentsType[value])
                                        key.setValue('')
                                      }}
                                      type={'simulate'}
                                      appearance={'button'}
                                      matchButtonWidth
                                      size='m'
                                    ></Select>
                                  </FormControl>
                                )
                              },
                            },
                            {
                              key: 'key',
                              header: 'key',
                              width: 220,
                              render: item => {
                                const { type } = item.getFields(['type'])
                                return getArgumentsKeyComp(type.getValue(), item)
                              },
                            },
                            {
                              key: 'operator',
                              header: 'operator',
                              width: 120,
                              render: item => {
                                const { operator } = item.getFields(['operator'])
                                return (
                                  <Select
                                    options={LimitMethodTypeOptions}
                                    value={operator.getValue()}
                                    onChange={value => operator.setValue(LimitMethodType[value])}
                                    size='s'
                                    type={'simulate'}
                                    appearance={'button'}
                                    matchButtonWidth
                                  />
                                )
                              },
                            },
                            {
                              key: 'value',
                              header: 'value',
                              render: item => {
                                const { type } = item.getFields(['type'])
                                return getArgumentsValueComp(type.getValue(), item)
                              },
                            },
                            {
                              key: 'close',
                              header: '',
                              width: 50,
                              render(item, rowKey, recordIndex) {
                                const index = Number(recordIndex)
                                return (
                                  <Icon
                                    style={{
                                      cursor: 'pointer',
                                      display: 'block',
                                      marginTop: '8px',
                                    }}
                                    type='close'
                                    onClick={() => {
                                      argumentsField.asArray().remove(index)
                                    }}
                                  />
                                )
                              },
                            },
                          ]}
                        ></Table>
                      )}
                      <div style={{ marginTop: '8px' }}>
                        <Icon type='plus' />
                        <Button
                          className='form-item-space'
                          type='link'
                          onClick={() =>
                            argumentsField.asArray().push({
                              id: `${Math.round(Math.random() * 10000)}`,
                              type: LimitArgumentsType.CUSTOM,
                              key: '',
                              value: '',
                              operator: LimitMethodType.EXACT,
                            })
                          }
                        >
                          添加
                        </Button>
                        {argumentsList?.length > 0 && (
                          <Button type='link' onClick={() => argumentsField.asArray().splice(0, argumentsList?.length)}>
                            删除所有
                          </Button>
                        )}
                      </div>
                    </Form.Item>
                  </Form>
                </Card.Body>
              </Card>

              <Card bordered>
                <Card.Body title='限流规则'>
                  <div>
                    <H6 className='card-module-h6-title-style'>限流条件</H6>
                    <Text theme='label'>满足以下任意条件即可触发限流</Text>
                  </div>
                  <Form style={{ padding: '20px' }}>
                    <Form.Item label='限流阈值' align='middle'>
                      {amountsList?.length > 0 && (
                        <Table
                          recordKey={o => {
                            const { id } = o.getFields(['id'])
                            return id.getValue()
                          }}
                          style={{ width: '400px' }}
                          records={[...amountsField.asArray()]}
                          columns={[
                            {
                              key: 'validDuration',
                              header: '统计窗口时长',
                              render: item => {
                                const { validDurationNum, validDurationUnit } = item.getFields([
                                  'validDurationNum',
                                  'validDurationUnit',
                                ])
                                return (
                                  <InputAdornment
                                    after={
                                      <Select
                                        options={LimitAmountsValidationUnitOptions}
                                        value={validDurationUnit.getValue()}
                                        onChange={value =>
                                          validDurationUnit.setValue(LimitAmountsValidationUnit[value])
                                        }
                                        matchButtonWidth
                                      ></Select>
                                    }
                                  >
                                    <InputNumber
                                      field={validDurationNum}
                                      min={1}
                                      onInputChange={value => validDurationNum.setValue(+value)}
                                      hideButton
                                      size='l'
                                    />
                                  </InputAdornment>
                                )
                              },
                            },
                            {
                              key: 'maxAmount',
                              header: '请求数阈值',
                              render: item => {
                                const { maxAmount } = item.getFields(['maxAmount'])
                                return (
                                  <InputAdornment after='次'>
                                    <InputNumber
                                      field={maxAmount}
                                      min={1}
                                      onInputChange={value => maxAmount.setValue(+value)}
                                      hideButton
                                      size='l'
                                    />
                                  </InputAdornment>
                                )
                              },
                            },
                            {
                              key: 'delete',
                              header: '',
                              width: 50,
                              render(item, rowKey, recordIndex) {
                                const index = Number(recordIndex)
                                return (
                                  amountsList?.length > 1 && (
                                    <Icon
                                      style={{
                                        cursor: 'pointer',
                                      }}
                                      type='close'
                                      onClick={() => {
                                        amountsField.asArray().remove(index)
                                      }}
                                    />
                                  )
                                )
                              },
                            },
                          ]}
                          compact
                          bordered
                        ></Table>
                      )}
                      <div style={{ marginTop: '8px' }}>
                        <Icon type='plus' />
                        <Button
                          className='form-item-space'
                          type='link'
                          onClick={() =>
                            amountsField.asArray().push({
                              id: `${Math.round(Math.random() * 10000)}`,
                              maxAmount: 1,
                              validDurationNum: 1,
                              validDurationUnit: LimitAmountsValidationUnit.s,
                            })
                          }
                        >
                          添加
                        </Button>
                        {amountsList?.length > 0 && (
                          <Button type='link' onClick={() => amountsField.asArray().splice(1, amountsList?.length)}>
                            删除所有
                          </Button>
                        )}
                      </div>
                    </Form.Item>
                    <FormField
                      field={regex_combine_Field}
                      label='合并计算阈值'
                      message='如果目标请求匹配到多个接口及参数，则将匹配到的所有请求汇合，合并计算阈值，具体规则查看'
                    >
                      <Switch field={regex_combine_Field}></Switch>
                    </FormField>
                  </Form>
                  <div style={{ marginTop: '10px' }}>
                    <H6 className='card-module-h6-title-style'>限流方案</H6>
                    <Text theme='label'>满足限流触发条件后的处理方案</Text>
                  </div>
                  <Form style={{ padding: '20px' }}>
                    <Form.Item label='限流效果'>
                      <Segment
                        value={actionField.getValue()}
                        options={limitActionOptions}
                        onChange={value => actionField.setValue(LimitAction[value])}
                      />
                    </Form.Item>
                    {limitType === LimitType.GLOBAL && (
                      <Form.Item
                        label='失败处理策略'
                        message='当出现通信失败或者 Token Server 不可用时，限流方案退化到单机限流的模式'
                      >
                        <Segment
                          value={failoverField.getValue()}
                          options={LimitFailoverOptions}
                          onChange={value => failoverField.setValue(LimitFailover[value])}
                        />
                      </Form.Item>
                    )}
                    {actionField.getValue() === LimitAction.UNIRATE && (
                      <FormField field={max_queue_delay_Field} label='最大排队时长'>
                        <InputAdornment after='秒'>
                          <InputNumber
                            field={max_queue_delay_Field}
                            min={1}
                            hideButton
                            onInputChange={val => {
                              const timeWindow = amountsField
                                .getValue()
                                .map((item, index) => {
                                  let seconds = 1
                                  if (item.validDurationUnit === LimitAmountsValidationUnit.m) {
                                    seconds = 60
                                  }
                                  if (item.validDurationUnit === LimitAmountsValidationUnit.h) {
                                    seconds = 3600
                                  }
                                  return (item.validDurationNum * seconds) / item.maxAmount
                                })
                                .sort((a, b) => {
                                  return a - b
                                })
                                .pop()
                              if (timeWindow < max_queue_delay_Field.getValue()) {
                                max_queue_delay_Field.setError(
                                  '排队时长非法, 必须大于等于最小请求间隔窗口(窗口时长/请求数阈值)',
                                )
                              }
                            }}
                          />
                        </InputAdornment>
                      </FormField>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Form.Item>

            <FormField label='是否启用' field={disableField}>
              <Switch field={disableField} />
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
                    `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}&tab=${TAB.AccessLimit}`,
                  )
                } else {
                  router.navigate(`/accesslimit`)
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
