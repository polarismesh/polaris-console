import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import {
  Form,
  FormControl,
  Card,
  Select,
  Button,
  Icon,
  Table,
  Input as TeaInput,
  AutoComplete,
  Col,
  Row,
  Text,
  Bubble,
} from 'tea-component'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { FieldAPI } from '@src/polaris/common/ducks/Form'
import router from '@src/polaris/common/util/router'
import { TAB } from '@src/polaris/service/detail/types'
import CreateDuck, { RouteDestinationArgument, RouteSourceArgument } from './CreateDuck'
import InputNumber from '@src/polaris/common/duckComponents/form/InputNumber'
import Switch from '@src/polaris/common/duckComponents/form/Switch'
import {
  RouteLabelMatchType,
  RouteLabelMatchTypeOptions,
  RoutingArgumentsTypeOptions,
  RoutingArgumentsType,
} from '../types'
import { MatchingLabelTips } from '@src/polaris/administration/accessLimiting/operations/Create'

insertCSS(
  'create-rule-form',
  `.card-module-h6-title-style {
    display: inline-block;
    margin-right: 5px
  }
  .form-item-space {
    margin-right: 8px
  }
  .compact-form-control .tea-form__controls{
    padding-right: 0px;
  }
`,
)

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
  const { name, priority, description, destination, source } = form
    .getAPI(store, dispatch)
    .getFields(['name', 'enable', 'description', 'destination', 'source', 'priority'])
  const { namespace: sourceNamespace, service: sourceService, arguments: argumentsField } = source.getFields([
    'namespace',
    'service',
    'arguments',
  ])
  const { namespace: destinationNamespace, service: destinationService, instanceGroups } = destination.getFields([
    'namespace',
    'service',
    'instanceGroups',
  ])
  const { sourceLabelList, destinationLabelList } = selector(store)
  const filterSourceLabelList = sourceLabelList.map(item => {
    if (argumentsField.getValue().find(argument => argument.key === item.value)) {
      return { ...item, disabled: true }
    }
    return item
  })

  function getArgumentsKeyComp(
    recordField: FieldAPI<RouteSourceArgument | RouteDestinationArgument>,
    type: string,
    filteredLabelList,
  ) {
    const { key: keyField, value: valueField, type: labelType } = recordField.getFields(['key', 'value', 'type'])
    const keyValidate = keyField.getTouched() && keyField.getError()
    const labelList = [
      ...(keyField.getValue() ? [{ text: `(输入值)${keyField.getValue()}`, value: keyField.getValue() }] : []),
      ...filteredLabelList,
    ]
    let keyComponent
    if (labelType.getValue() === RoutingArgumentsType.CUSTOM || type === 'destination') {
      keyComponent = (
        <AutoComplete
          options={labelList}
          tips='没有匹配的标签键'
          onChange={value => {
            if (value !== keyField.getValue()) {
              valueField.setValue('')
            }
            keyField.setValue(value)
          }}
        >
          {ref => (
            <TeaInput
              ref={ref}
              value={keyField.getValue()}
              onChange={value => {
                keyField.setValue(value)
              }}
              placeholder={'请输入标签键'}
              size={'full'}
            />
          )}
        </AutoComplete>
      )
    } else if (labelType.getValue() === RoutingArgumentsType.METHOD) {
      keyField.setValue('$method')
      keyComponent = <TeaInput placeholder='$method' disabled />
    } else if (labelType.getValue() === RoutingArgumentsType.CALLER_IP) {
      keyField.setValue('$caller_ip')
      keyComponent = <TeaInput placeholder='$caller_ip' disabled />
    } else if (labelType.getValue() === RoutingArgumentsType.PATH) {
      keyField.setValue('$path')
      keyComponent = <TeaInput placeholder='$path' disabled />
    } else {
      keyComponent = <Input placeholder='请输入Key值' field={keyField} onChange={key => keyField.setValue(key)} />
    }
    return (
      <Bubble content={keyField.getValue()}>
        <FormControl
          status={keyValidate ? 'error' : null}
          message={keyValidate ? keyField.getError() : ''}
          showStatusIcon={false}
          style={{ display: 'inline', padding: 0 }}
        >
          {keyComponent}
        </FormControl>
      </Bubble>
    )
  }

  function getArgumentsValueComp(recordField: FieldAPI<RouteSourceArgument | RouteDestinationArgument>, type: string) {
    const { value: valueField, key: keyField, type: labelType } = recordField.getFields(['value', 'key', 'type'])
    const valueValidate = valueField.getTouched() && valueField.getError()
    const labelList = type === 'source' ? sourceLabelList : destinationLabelList
    const valueOptions = labelList.find(item => item.value === keyField.getValue())?.valueOptions || []
    const options = [
      ...(valueField.getValue() ? [{ text: `(输入值)${valueField.getValue()}`, value: valueField.getValue() }] : []),
      ...valueOptions,
    ]
    let valueComponent
    if (labelType.getValue() === RoutingArgumentsType.CUSTOM || type === 'destination') {
      valueComponent = (
        <AutoComplete
          options={options}
          tips='没有匹配的标签值'
          onChange={value => {
            valueField.setValue(value)
          }}
        >
          {ref => (
            <TeaInput
              ref={ref}
              value={valueField.getValue()}
              onChange={value => {
                valueField.setValue(value)
              }}
              placeholder={'请输入标签值'}
              size={'full'}
            />
          )}
        </AutoComplete>
      )
    } else {
      valueComponent = (
        <Input placeholder='请输入Value值' field={valueField} onChange={value => valueField.setValue(value)} />
      )
    }
    return (
      <Bubble content={valueField.getValue()}>
        <FormControl
          status={valueValidate ? 'error' : null}
          message={valueValidate ? valueField.getError() : ''}
          showStatusIcon={false}
          style={{ display: 'inline', padding: 0 }}
        >
          {valueComponent}
        </FormControl>
      </Bubble>
    )
  }

  const backRoute = composedId?.namespace
    ? `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}`
    : `/custom-route`

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
      title={composedId?.id ? '编辑服务路由规则' : '新建服务路由规则'}
      backRoute={backRoute}
    >
      <Card>
        <Card.Body>
          <Form>
            <FormField label='路由规则名称' field={name} message='最长64个字符' required>
              <Input field={name} maxLength={64} size='l' />
            </FormField>
            <FormField label='描述' field={description}>
              <Input field={description} maxLength={64} size='l' multiple />
            </FormField>
            <Form.Item label='路由规则详情' className='compact-form-control'>
              <Form style={{ position: 'relative' }}>
                <div
                  style={{
                    borderTop: '1px dashed gray',
                    right: 'calc(25% + 30px)',
                    width: 'calc(50% - 60px)',
                    top: '29px',
                    position: 'absolute',
                  }}
                >
                  <Button
                    type={'icon'}
                    icon={'transfer'}
                    onClick={() => {
                      const destinationNamespaceValue = destinationNamespace.getValue()
                      const destinationServiceValue = destinationService.getValue()
                      destinationNamespace.setValue(sourceNamespace.getValue())
                      destinationService.setValue(sourceService.getValue())
                      sourceNamespace.setValue(destinationNamespaceValue)
                      sourceService.setValue(destinationServiceValue)
                    }}
                    style={{ position: 'absolute', left: 'calc(50% + -14px)', top: '-14px' }}
                  ></Button>
                  <Text reset theme={'label'} style={{ position: 'absolute', left: 'calc(50% + -55px)', top: '5px' }}>
                    点击切换主被调服务
                  </Text>
                  <Icon type={'arrowright'} style={{ position: 'absolute', right: '-9px', top: '-9px' }} />
                </div>
                <Row gap={30}>
                  <Col span={12}>
                    <div style={{ margin: '10px 0' }}>
                      <Text parent={'div'} style={{ width: '100%', textAlign: 'center', fontWeight: 'bolder' }}>
                        来源服务
                      </Text>
                      <Text parent={'div'} theme={'label'} style={{ width: '100%', textAlign: 'center' }}>
                        主调请求按照匹配规则匹配成功后，将按照当前规则进行目标服务路由
                      </Text>
                    </div>
                    <Card bordered>
                      <Card.Body title='主调服务'>
                        <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                          <FormField field={sourceNamespace} label='命名空间' required>
                            <Select
                              value={sourceNamespace.getValue()}
                              options={[
                                { text: '全部命名空间', value: '*', disabled: destinationNamespace.getValue() === '*' },
                                ...(data?.namespaceList || []),
                              ]}
                              onChange={value => {
                                if (value === '*') {
                                  sourceNamespace.setValue('*')
                                  sourceService.setValue('*')
                                  return
                                }
                                sourceNamespace.setValue(value)
                                sourceService.setValue('')
                              }}
                              searchable
                              type={'simulate'}
                              appearance={'button'}
                              matchButtonWidth
                              placeholder='请选择命名空间'
                              size='m'
                            />
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
                                />
                              )}
                            </AutoComplete>
                          </FormField>
                        </Form>
                      </Card.Body>
                      <Card.Body title='请求标签'>
                        <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                          <Form.Item label='请求匹配规则' align='middle' tips={MatchingLabelTips}>
                            {argumentsField?.getValue()?.length > 0 && (
                              <Table
                                hideHeader
                                verticalTop
                                bordered
                                records={[...argumentsField.asArray()]}
                                columns={[
                                  {
                                    key: 'type',
                                    header: '类型',
                                    render: item => {
                                      const { type, key } = item.getFields(['type', 'key'])
                                      const validate = type.getTouched() && type.getError()
                                      const option = RoutingArgumentsTypeOptions.find(
                                        item => item.value === type.getValue(),
                                      )
                                      return (
                                        <Bubble content={option?.text}>
                                          <FormControl
                                            status={validate ? 'error' : null}
                                            message={validate ? type.getError() : ''}
                                            showStatusIcon={false}
                                            style={{ display: 'inline', padding: 0 }}
                                          >
                                            <Select
                                              options={RoutingArgumentsTypeOptions}
                                              value={type.getValue()}
                                              onChange={value => {
                                                type.setValue(RoutingArgumentsType[value])
                                                key.setValue('')
                                              }}
                                              type={'simulate'}
                                              appearance={'button'}
                                              size={'full'}
                                            ></Select>
                                          </FormControl>
                                        </Bubble>
                                      )
                                    },
                                  },
                                  {
                                    key: 'key',
                                    header: 'key',
                                    render: item => {
                                      return getArgumentsKeyComp(item, 'source', filterSourceLabelList)
                                    },
                                  },
                                  {
                                    key: 'value_type',
                                    header: 'value_type',
                                    width: 80,
                                    render: item => {
                                      const { value_type } = item.getFields(['value_type'])
                                      return (
                                        <Select
                                          options={RouteLabelMatchTypeOptions}
                                          value={value_type.getValue()}
                                          onChange={value => value_type.setValue(value)}
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
                                      return getArgumentsValueComp(item, 'source')
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
                                    type: RoutingArgumentsType.CUSTOM,
                                    key: '',
                                    value: '',
                                    value_type: RouteLabelMatchType.EXACT,
                                  })
                                }
                              >
                                添加
                              </Button>
                              {argumentsField?.getValue()?.length > 0 && (
                                <Button
                                  type='link'
                                  onClick={() => argumentsField.asArray().splice(0, argumentsField?.getValue()?.length)}
                                >
                                  删除所有
                                </Button>
                              )}
                            </div>
                          </Form.Item>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <div style={{ margin: '10px 0' }}>
                      <Text parent={'div'} style={{ width: '100%', textAlign: 'center', fontWeight: 'bolder' }}>
                        目标服务
                      </Text>
                      <Text parent={'div'} theme={'label'} style={{ width: '100%', textAlign: 'center' }}>
                        请求会按照规则路由到目标服务分组
                      </Text>
                    </div>
                    <Card bordered>
                      <Card.Body title='被调服务'>
                        <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                          <FormField field={destinationNamespace} label='命名空间' required>
                            <Select
                              value={destinationNamespace.getValue()}
                              options={[
                                { text: '全部命名空间', value: '*', disabled: sourceNamespace.getValue() === '*' },
                                ...(data?.namespaceList || []),
                              ]}
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
                                  value={
                                    destinationService.getValue() === '*' ? '全部服务' : destinationService.getValue()
                                  }
                                  onChange={value => {
                                    destinationService.setValue(value)
                                  }}
                                  disabled={destinationNamespace.getValue() === '*'}
                                />
                              )}
                            </AutoComplete>
                          </FormField>
                        </Form>
                      </Card.Body>
                      <Card.Body title='实例分组'>
                        {[...instanceGroups.asArray()].map((instanceGroup, index) => {
                          const { name, weight, priority, labels, isolate } = instanceGroup.getFields([
                            'name',
                            'weight',
                            'priority',
                            'labels',
                            'isolate',
                          ])
                          const filterDestinationLabelList = destinationLabelList.map(item => {
                            if (labels.getValue().find(label => label.key === item.value)) {
                              return { ...item, disabled: true }
                            }
                            return item
                          })
                          const nameValidate = name.getTouched() && name.getError()
                          return (
                            <Card key={index} bordered>
                              <Card.Body
                                title={
                                  <FormControl
                                    style={{ paddingBottom: '0px' }}
                                    status={nameValidate ? 'error' : null}
                                    message={nameValidate ? name.getError() : ''}
                                    showStatusIcon={false}
                                  >
                                    <TeaInput
                                      value={name.getValue()}
                                      onChange={v => name.setValue(v)}
                                      placeholder={'请输入实例分组名称'}
                                    ></TeaInput>
                                  </FormControl>
                                }
                                operation={
                                  <>
                                    <Button
                                      type={'icon'}
                                      icon={'close'}
                                      onClick={() => {
                                        instanceGroups.asArray().remove(index)
                                      }}
                                    ></Button>
                                  </>
                                }
                              >
                                <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                                  <Form.Item label='实例标签' align='middle'>
                                    {labels?.getValue()?.length > 0 && (
                                      <Table
                                        hideHeader
                                        verticalTop
                                        bordered
                                        records={[...labels.asArray()]}
                                        columns={[
                                          {
                                            key: 'key',
                                            header: 'key',
                                            render: item => {
                                              return getArgumentsKeyComp(
                                                item,
                                                'destination',
                                                filterDestinationLabelList,
                                              )
                                            },
                                          },
                                          {
                                            key: 'type',
                                            header: 'type',
                                            width: 80,
                                            render: item => {
                                              const { type } = item.getFields(['type'])
                                              return (
                                                <Select
                                                  options={RouteLabelMatchTypeOptions}
                                                  value={type.getValue()}
                                                  onChange={value => type.setValue(value)}
                                                  type={'simulate'}
                                                  appearance={'button'}
                                                />
                                              )
                                            },
                                          },
                                          {
                                            key: 'value',
                                            header: 'value',
                                            render: item => {
                                              return getArgumentsValueComp(item, 'destination')
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
                                                    labels.asArray().remove(index)
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
                                          labels.asArray().push({
                                            key: '',
                                            value: '',
                                            value_type: 'TEXT',
                                            type: RouteLabelMatchType.EXACT,
                                          })
                                        }
                                      >
                                        添加
                                      </Button>
                                      {labels?.getValue()?.length > 0 && (
                                        <Button
                                          type='link'
                                          onClick={() => labels.asArray().splice(0, labels?.getValue()?.length)}
                                        >
                                          删除所有
                                        </Button>
                                      )}
                                    </div>
                                  </Form.Item>
                                  <FormField label='权重' field={weight} required>
                                    <InputNumber min={0} max={100} field={weight} />
                                  </FormField>
                                  <FormField
                                    label='优先级'
                                    field={priority}
                                    required
                                    tips={'优先级数字设置越小，匹配顺序越靠前'}
                                  >
                                    <InputNumber min={0} max={10} field={priority} />
                                  </FormField>
                                  <FormField label='是否隔离' field={isolate} required>
                                    <Switch field={isolate} />
                                  </FormField>
                                </Form>
                              </Card.Body>
                            </Card>
                          )
                        })}
                        <Button
                          className='form-item-space'
                          type='link'
                          onClick={() =>
                            instanceGroups.asArray().push({
                              labels: [
                                {
                                  key: '',
                                  value: '',
                                  value_type: 'TEXT',
                                  type: RouteLabelMatchType.EXACT,
                                },
                              ],
                              weight: 100,
                              priority: 0,
                              isolate: false,
                              name: `实例分组${instanceGroups.getValue()?.length + 1}`,
                            })
                          }
                        >
                          添加
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Form>
            </Form.Item>
            <FormField label='优先级' field={priority} tips={'优先级数字设置越小，匹配顺序越靠前'} required>
              <InputNumber min={0} max={10} field={priority} />
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
                  router.navigate(`/custom-route`)
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
