import React from 'react'
import { DuckCmpProps, purify, useDuck } from 'saga-duck'
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
  FormItem,
  Justify,
  Checkbox,
  Tag,
  PopConfirm,
  InputNumber as TeaInputNumber,
  SelectOptionWithGroup,
  Switch,
  TagSelect,
} from 'tea-component'
import FormDuck from '@src/polaris/common/ducks/Form'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { FieldAPI } from '@src/polaris/common/ducks/Form'
import router from '@src/polaris/common/util/router'
import { TAB } from '@src/polaris/service/detail/types'
import CreateDuck, { RouteDestinationArgument, RouteSourceArgument } from './CreateDuck'
import InputNumber from '@src/polaris/common/duckComponents/form/InputNumber'
import {
  RouteLabelMatchType,
  RouteLabelMatchTypeOptions,
  RoutingArgumentsTypeOptions,
  RoutingArgumentsType,
  RouteLabelTextMap,
  RoutingValueType,
  RoutingValueTypeOptions,
  RoutingValueTextMap,
  RoutingArgumentsTypeLabelMap,
} from '../types'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { autotip } from 'tea-component/lib/table/addons'
import { checkNeedTagInput } from '@src/polaris/common/components/TagSelectOrInput'
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
export const getLabelTag = (
  label: RouteDestinationArgument,
  index,
  labelsField?: FieldAPI<RouteDestinationArgument[]>,
) => {
  const { key, type, value, value_type } = label
  return (
    <Tag key={`${key}${index}`}>
      {`key:${key} ${RouteLabelTextMap[type]} value:${value}(${RoutingValueTextMap[value_type]})`}
      {labelsField && (
        <Button
          type={'icon'}
          icon={'close'}
          onClick={() => {
            labelsField.asArray().remove(index)
          }}
        ></Button>
      )}
    </Tag>
  )
}
const getEmptyRule = () => ({
  name: '',
  sources: [
    {
      service: '',
      namespace: '',
      arguments: [getEmptyArgument()],
    },
  ],
  destinations: [[getEmptyDestination(0)]],
})
const getEmptyArgument = () => ({
  type: RoutingArgumentsType.CUSTOM,
  key: '',
  value: '',
  value_type: RouteLabelMatchType.EXACT,
  value_value_type: RoutingValueType.TEXT,
})
const getEmptyLabel = () => ({
  type: RoutingValueType.TEXT,
  key: '',
  value: '',
  value_type: RouteLabelMatchType.EXACT,
  value_value_type: RoutingValueType.TEXT,
})
const getEmptyDestination = length => ({
  labels: [],
  weight: 0,
  isolate: false,
  service: '',
  namespace: '',
  name: `分组${length + 1}`,
})
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
  const { name, description, destination, source, rules, priority, enable } = form
    .getAPI(store, dispatch)
    .getFields(['name', 'enable', 'description', 'destination', 'source', 'rules', 'tempKey', 'priority'])
  const { namespace: sourceNamespace, service: sourceService } = source.getFields(['namespace', 'service'])
  const { namespace: destinationNamespace, service: destinationService } = destination.getFields([
    'namespace',
    'service',
  ])
  const { sourceLabelList, destinationLabelList } = selector(store)
  const [labelPopConfirmVisible, setLabelPopConfirmVisible] = React.useState('')

  const [isDragging, setIsDragging] = React.useState(false)
  const [isDestDragging, setIsDestDragging] = React.useState(false)

  function getArgumentsKeyComp(
    recordField: FieldAPI<RouteSourceArgument | RouteDestinationArgument>,
    type: string,
    filteredLabelList,
  ) {
    const { key: keyField, value: valueField, type: labelType } = recordField.getFields([
      'key',
      'value',
      'type',
      'value_type',
    ])
    const keyValidate = keyField.getTouched() && keyField.getError()
    const labelList = [
      ...(keyField.getValue() ? [{ text: `(输入值)${keyField.getValue()}`, value: keyField.getValue() }] : []),
      ...filteredLabelList.filter(item => (keyField.getValue() ? item.text.indexOf(keyField.getValue()) > -1 : true)),
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
            // if (value_type.getValue() === RoutingValueType.PARAMETER) {
            //   valueField.setValue(value)
            // }
            keyField.setValue(value)
          }}
        >
          {ref => (
            <TeaInput
              ref={ref}
              value={keyField.getValue()}
              onChange={value => {
                // if (value_type.getValue() === RoutingValueType.PARAMETER) {
                //   valueField.setValue(value)
                // }
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
      keyComponent = (
        <Input placeholder='请输入Key值' size={'full'} field={keyField} onChange={key => keyField.setValue(key)} />
      )
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

  function getArgumentsValueComp(
    recordField: FieldAPI<RouteSourceArgument | RouteDestinationArgument>,
    argumentsField: FieldAPI<RouteSourceArgument[]>,
    type: string,
  ) {
    const { value: valueField, key: keyField, type: labelType, value_type } = recordField.getFields([
      'value',
      'key',
      'type',
      'value_type',
    ])
    const { value_value_type } = (recordField as FieldAPI<RouteSourceArgument>).getFields(['value_value_type'])
    const isSourceVariable = type === 'source' && value_value_type.getValue() === RoutingValueType.PARAMETER
    if (isSourceVariable) {
      return <span />
    }

    const isVariableType = value_type.getValue() === RoutingValueType.PARAMETER
    const valueValidate = valueField.getTouched() && valueField.getError()
    const labelList = type === 'source' ? sourceLabelList : destinationLabelList
    const valueOptions = labelList.find(item => item.value === keyField.getValue())?.valueOptions || []
    const variableOptions =
      argumentsField
        ?.getValue()
        .filter(f => f.value_value_type === RoutingValueType.PARAMETER)
        .map(f => ({
          text: `${RoutingArgumentsTypeLabelMap[f.type]}${f.key}`,
          value: `${RoutingArgumentsTypeLabelMap[f.type]}${f.key}`,
        })) ?? []

    const options: SelectOptionWithGroup[] = [
      ...(valueField.getValue() && !isVariableType
        ? [
            {
              text: `(输入值)${valueField.getValue()}`,
              value: valueField.getValue(),
            },
          ]
        : []),
      ...(isVariableType ? variableOptions : []),
      ...(isVariableType
        ? []
        : valueOptions.filter(item => (valueField.getValue() ? item.text.indexOf(valueField.getValue()) > -1 : true))),
    ]
    let valueComponent
    if (value_type.getValue() === RouteLabelMatchType.RANGE || labelType.getValue() === RouteLabelMatchType.RANGE) {
      valueComponent = (
        <>
          <TeaInputNumber
            hideButton
            value={Number(valueField?.getValue()?.split('~')?.[0] || 0)}
            onChange={value => {
              const splited = valueField?.getValue() ? valueField?.getValue()?.split('~') : ['0', '0']
              splited[0] = value.toString()
              valueField.setValue(splited.join('~'))
            }}
          />
          <Text reset verticalAlign={'middle'}>
            &nbsp;~&nbsp;
          </Text>
          <TeaInputNumber
            hideButton
            value={Number(valueField?.getValue()?.split('~')?.[1] || 0)}
            onChange={value => {
              const splited = valueField?.getValue() ? valueField?.getValue()?.split('~') : ['0', '0']
              splited[1] = value.toString()
              valueField.setValue(splited.join('~'))
            }}
          />
        </>
      )
    } else if (checkNeedTagInput(value_type.getValue()) || checkNeedTagInput(labelType.getValue())) {
      const tagOptions = [
        ...(isVariableType ? variableOptions : []),
        ...(isVariableType
          ? []
          : valueOptions.filter(item =>
              valueField.getValue() ? item.text.indexOf(valueField.getValue()) > -1 : true,
            )),
      ]
      valueComponent = (
        <>
          <TagSelect
            options={tagOptions}
            value={valueField
              ?.getValue()
              ?.split(',')
              ?.filter(item => item)}
            onChange={tags => {
              valueField.setValue(tags.join(','))
            }}
            style={{ display: 'block' }}
          />
        </>
      )
    } else if (labelType.getValue() === RoutingArgumentsType.CUSTOM || type === 'destination') {
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
  function RouteLabelSelectPanel({
    labelsField,
    argumentsField,
    id,
  }: {
    labelsField: FieldAPI<RouteDestinationArgument[]>
    argumentsField: FieldAPI<RouteSourceArgument[]>
    id: string
  }) {
    const tempLabelForm = useDuck(FormDuck)
    const { duck: tempLabelFormDuck, store: tempLabelFormStore, dispatch: tempLabelFormDispatch } = tempLabelForm
    const labelField = tempLabelFormDuck.getAPI(tempLabelFormStore, tempLabelFormDispatch)
    const filterDestinationLabelList = destinationLabelList.map(item => {
      if (labelsField.getValue().find(label => label.key === item.value)) {
        return { ...item, disabled: true }
      }
      return item
    })
    const { type, value_type } = labelField.getFields(['type', 'value_type', 'key', 'value'])

    return (
      <PopConfirm
        key={id}
        message={
          <Row>
            <Col span={8}>{getArgumentsKeyComp(labelField, 'destination', filterDestinationLabelList)}</Col>
            <Col span={4}>
              <Select
                options={RouteLabelMatchTypeOptions}
                value={type.getValue()}
                onChange={value => type.setValue(value)}
                appearance={'button'}
                matchButtonWidth={false}
                size={'full'}
              />
            </Col>
            <Col span={3}>
              <Select
                options={RoutingValueTypeOptions}
                value={value_type.getValue()}
                onChange={value => {
                  // if (value === RoutingValueType.PARAMETER) {
                  //   valueField.setValue(keyField.getValue())
                  // }
                  value_type.setValue(value)
                }}
                type={'simulate'}
                appearance={'button'}
                matchButtonWidth
                size={'s'}
              />
            </Col>
            <Col span={9}>{getArgumentsValueComp(labelField, argumentsField, 'destination')}</Col>
          </Row>
        }
        placement={'top'}
        style={{ width: '800px', maxWidth: 'none' }}
        onVisibleChange={visible => {
          if (visible) setLabelPopConfirmVisible(id)
          else {
            setLabelPopConfirmVisible('')
            labelField.setValue(null)
          }
        }}
        visible={labelPopConfirmVisible === id}
        footer={
          <Button
            type={'link'}
            onClick={() => {
              labelsField.setValue([...labelsField.getValue(), { ...labelField.getValue() }])
              setLabelPopConfirmVisible('')
              labelField.setValue(null)
            }}
            style={{ marginTop: '20px' }}
            disabled={!labelField.getValue()?.type || !labelField.getValue()?.key || !labelField.getValue()?.value}
            tooltip={
              !labelField.getValue()?.type || !labelField.getValue()?.key || !labelField.getValue()?.value
                ? '请输入完整标签'
                : ''
            }
          >
            {'确认'}
          </Button>
        }
      >
        <Button type='icon' icon={'plus'}></Button>
      </PopConfirm>
    )
  }

  const backRoute = composedId?.namespace
    ? `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}&tab=router`
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
            <FormField label='规则名称' field={name} message='最长64个字符' required>
              <Input field={name} maxLength={64} size='l' />
            </FormField>
            <FormField label='描述' field={description}>
              <Input field={description} maxLength={64} size='l' multiple />
            </FormField>
            <FormField label='优先级' field={priority} tips={'优先级数字设置越小，匹配顺序越靠前'} required>
              <InputNumber min={0} max={10} field={priority} />
            </FormField>
            <Form.Item label='匹配条件' className='compact-form-control'>
              <Form style={{ position: 'relative', minWidth: '1200px', paddingBottom: '25px' }}>
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
                        主调服务
                      </Text>
                      <Text parent={'div'} theme={'label'} style={{ width: '100%', textAlign: 'center' }}>
                        主调请求按照匹配规则匹配成功后，将按照当前规则进行目标服务路由
                      </Text>
                    </div>
                    <Card bordered style={{ maxWidth: '500px', margin: 'auto' }}>
                      <Card.Body>
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
                              size='full'
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
                                  style={{ width: '100%' }}
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
                        被调服务
                      </Text>
                      <Text parent={'div'} theme={'label'} style={{ width: '100%', textAlign: 'center' }}>
                        请求会按照规则路由到目标服务分组
                      </Text>
                    </div>
                    <Card bordered style={{ maxWidth: '500px', margin: 'auto' }}>
                      <Card.Body>
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
                              size='full'
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
                                  style={{ width: '100%' }}
                                />
                              )}
                            </AutoComplete>
                          </FormField>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Form>
            </Form.Item>
            <FormItem label='路由策略'>
              <Text theme={'label'} reset>
                按照以下规则顺序进行匹配，可拖动调整顺序。若规则全未匹配上，则请求拒绝。
              </Text>
              <section style={{ marginTop: '10px' }}>
                {isDragging ? (
                  <DragDropContext
                    onDragEnd={context => {
                      const source = context.source.index
                      const dest = context.destination.index
                      if (source === dest) return
                      const rulesList = rules.getValue()
                      const [item] = rulesList.splice(source, 1)
                      rulesList.splice(dest, 0, item)
                      rules.setValue(rulesList)
                      setIsDragging(false)
                    }}
                  >
                    <Droppable droppableId='route-drop' direction='vertical'>
                      {provided => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {[...rules.asArray()].map((rule, index) => {
                            return (
                              <Draggable key={index} draggableId={`规则${index + 1}`} index={index}>
                                {provided => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <Card
                                      bordered
                                      style={{
                                        backgroundColor: '#f8f8fa',
                                        maxWidth: '1200px',
                                        margin: '0px 0px 20px 0',
                                      }}
                                    >
                                      <Card.Header>
                                        <Justify
                                          left={
                                            <Text reset>
                                              <Button
                                                type={'icon'}
                                                icon={'drop'}
                                                onClick={() => setIsDragging(!isDragging)}
                                              ></Button>
                                              {`规则【${index + 1}】`}
                                            </Text>
                                          }
                                          style={{ padding: '10px' }}
                                        ></Justify>
                                      </Card.Header>
                                    </Card>
                                  </div>
                                )}
                              </Draggable>
                            )
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <>
                    {[...rules.asArray()].map((rule, ruleIndex) => {
                      const { sources: ruleSources, destinations: ruleDestinations } = rule.getFields([
                        'sources',
                        'destinations',
                      ])
                      const { arguments: argumentsField } = [...ruleSources.asArray()]?.[0]?.getFields(['arguments'])

                      const filterSourceLabelList = sourceLabelList.map(item => {
                        if (argumentsField.getValue().find(argument => argument.key === item.value)) {
                          return { ...item, disabled: true }
                        }
                        return item
                      })
                      return (
                        <Card
                          bordered
                          key={ruleIndex}
                          style={{ backgroundColor: '#f8f8fa', maxWidth: '1200px', margin: '0px 0px 20px 0' }}
                        >
                          <Card.Header>
                            <Justify
                              left={
                                <Text reset>
                                  <Button
                                    type={'icon'}
                                    icon={'drop'}
                                    onClick={() => setIsDragging(!isDragging)}
                                    disabled={isDestDragging}
                                  ></Button>
                                  <Text
                                    style={{ fontSize: '14px', fontWeight: 700, verticalAlign: 'middle' }}
                                  >{`规则【${ruleIndex + 1}】`}</Text>
                                </Text>
                              }
                              right={
                                <>
                                  <Button
                                    type={'icon'}
                                    icon={'plus'}
                                    onClick={() => {
                                      rules.asArray().splice(ruleIndex, 0, getEmptyRule())
                                    }}
                                  ></Button>
                                  <Button
                                    type={'icon'}
                                    icon={'close'}
                                    onClick={() => {
                                      rules.asArray().remove(ruleIndex)
                                    }}
                                    disabled={rules.getValue()?.length === 1}
                                  ></Button>
                                </>
                              }
                              style={{ padding: '10px' }}
                            ></Justify>
                          </Card.Header>
                          <Card.Body>
                            <Text
                              parent={'div'}
                              theme={'strong'}
                              style={{ marginBottom: '10px', fontWeight: 700, fontSize: '14px' }}
                            >
                              来源服务的请求满足以下匹配条件
                            </Text>
                            <section style={{ marginBottom: '10px' }}>
                              <Table
                                hideHeader
                                verticalTop
                                bordered
                                bottomTip={
                                  <div>
                                    <Icon type='plus' />
                                    <Button
                                      className='form-item-space'
                                      type='link'
                                      onClick={() => argumentsField.asArray().push(getEmptyLabel())}
                                    >
                                      添加
                                    </Button>
                                  </div>
                                }
                                records={[...argumentsField.asArray()]}
                                columns={[
                                  {
                                    key: 'type',
                                    header: '类型',
                                    width: 200,
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
                                    width: 120,
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
                                          size={'full'}
                                        />
                                      )
                                    },
                                  },
                                  {
                                    key: 'value_value_type',
                                    header: 'value_value_type',
                                    width: 80,
                                    render(item) {
                                      const { value_value_type } = item.getFields(['value_value_type'])

                                      return (
                                        <Select
                                          options={RoutingValueTypeOptions}
                                          value={value_value_type.getValue()}
                                          onChange={value => {
                                            value_value_type.setValue(value)
                                          }}
                                          type={'simulate'}
                                          appearance={'button'}
                                          matchButtonWidth
                                          size={'s'}
                                        />
                                      )
                                    },
                                  },
                                  {
                                    key: 'value',
                                    header: 'value',
                                    render: item => {
                                      return getArgumentsValueComp(item, argumentsField, 'source')
                                    },
                                  },
                                  {
                                    key: 'close',
                                    header: '',
                                    width: 50,
                                    render(item, rowKey, recordIndex) {
                                      const index = Number(recordIndex)
                                      return (
                                        <Button
                                          type='icon'
                                          icon='close'
                                          onClick={() => {
                                            argumentsField.asArray().remove(index)
                                          }}
                                        />
                                      )
                                    },
                                  },
                                ]}
                                addons={[autotip({ emptyText: '无匹配条件' })]}
                              ></Table>
                            </section>
                            <Text
                              parent={'div'}
                              theme={'strong'}
                              style={{ marginBottom: '10px', fontWeight: 700, fontSize: '14px' }}
                            >
                              将转发至目标服务的以下实例分组，按优先级转发，可拖动调整优先级：
                            </Text>
                            {isDestDragging ? (
                              <DragDropContext
                                onDragEnd={context => {
                                  const source = context.source.index
                                  const dest = context.destination.index
                                  if (source === dest) return
                                  const destinationList = ruleDestinations.getValue()
                                  const [item] = destinationList.splice(source, 1)
                                  destinationList.splice(dest, 0, item)
                                  ruleDestinations.setValue(destinationList)
                                  setIsDestDragging(false)
                                }}
                              >
                                <Droppable droppableId='destination-drop' direction='vertical'>
                                  {destProvided => (
                                    <div ref={destProvided.innerRef} {...destProvided.droppableProps}>
                                      {[...ruleDestinations.asArray()].map((destination, index) => {
                                        return (
                                          <Draggable key={index} draggableId={`实例分组${index + 1}`} index={index}>
                                            {destProvided => (
                                              <div
                                                ref={destProvided.innerRef}
                                                {...destProvided.draggableProps}
                                                {...destProvided.dragHandleProps}
                                              >
                                                <Card style={{ marginBottom: '15px' }} key={index} bordered>
                                                  <Card.Header>
                                                    <Justify
                                                      left={
                                                        <section style={{ padding: '5px 10px 5px 0' }}>
                                                          <Text
                                                            reset
                                                            theme={'strong'}
                                                            style={{ marginRight: '10px', fontSize: '14px' }}
                                                          >
                                                            <Button
                                                              type={'icon'}
                                                              icon={'drop'}
                                                              onClick={() => setIsDestDragging(!isDestDragging)}
                                                              disabled={isDragging}
                                                            ></Button>
                                                            {`第【${index}】优先级`}
                                                          </Text>
                                                          <Text theme={'label'} reset>
                                                            优先级常用于容灾场景，高优先级实例故障后，路由至次优先级实例。相同优先级下分组权重加和为100。
                                                          </Text>
                                                        </section>
                                                      }
                                                    ></Justify>
                                                  </Card.Header>
                                                </Card>
                                              </div>
                                            )}
                                          </Draggable>
                                        )
                                      })}
                                      {destProvided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </DragDropContext>
                            ) : (
                              <>
                                {[...ruleDestinations.asArray()].map((destination, index) => {
                                  const groupComponent = (
                                    <>
                                      <Card style={{ marginBottom: '15px' }} key={index} bordered>
                                        <Card.Header>
                                          <Justify
                                            left={
                                              <section style={{ padding: '5px 10px 5px 0' }}>
                                                <Text
                                                  reset
                                                  theme={'strong'}
                                                  style={{ marginRight: '10px', fontSize: '14px' }}
                                                >
                                                  <Button
                                                    type={'icon'}
                                                    icon={'drop'}
                                                    onClick={() => setIsDestDragging(!isDestDragging)}
                                                    disabled={isDragging}
                                                  ></Button>
                                                  {`第【${index}】优先级`}
                                                </Text>
                                                <Text theme={'label'} reset>
                                                  优先级常用于容灾场景，高优先级实例故障后，路由至次优先级实例。相同优先级下分组权重加和为100。
                                                </Text>
                                              </section>
                                            }
                                            right={
                                              <Button
                                                type={'icon'}
                                                icon={'close'}
                                                onClick={() => {
                                                  ruleDestinations.asArray().remove(index)
                                                }}
                                                disabled={ruleDestinations.getValue()?.length === 1}
                                              ></Button>
                                            }
                                          ></Justify>
                                        </Card.Header>
                                        {!isDestDragging && (
                                          <Card.Body>
                                            <Table
                                              verticalTop
                                              bordered
                                              records={[...destination.asArray()]}
                                              columns={[
                                                {
                                                  key: 'name',
                                                  header: '实例分组名称',
                                                  width: 200,
                                                  render: item => {
                                                    const { name } = item.getFields(['name'])
                                                    return <Input field={name} size={'m'}></Input>
                                                  },
                                                },
                                                {
                                                  key: 'weight',
                                                  header: (
                                                    <>
                                                      权重
                                                      <Bubble content={'相对权重，数值范围：0-100'}>
                                                        <Icon type={'info'}></Icon>
                                                      </Bubble>
                                                    </>
                                                  ),
                                                  width: 150,
                                                  render: item => {
                                                    const { weight } = item.getFields(['weight'])
                                                    const validate = weight.getTouched() && weight.getError()
                                                    return (
                                                      <FormControl
                                                        status={validate ? 'error' : null}
                                                        message={validate ? weight.getError() : ''}
                                                        showStatusIcon={false}
                                                        style={{ display: 'inline', padding: 0 }}
                                                      >
                                                        <InputNumber
                                                          field={weight}
                                                          hideButton
                                                          min={0}
                                                          max={100}
                                                        ></InputNumber>
                                                      </FormControl>
                                                    )
                                                  },
                                                },
                                                {
                                                  key: 'isolate',
                                                  header: '是否隔离',
                                                  width: 100,
                                                  render: item => {
                                                    const { isolate } = item.getFields(['isolate'])
                                                    return (
                                                      <Checkbox
                                                        value={isolate.getValue()}
                                                        onChange={v => isolate.setValue(v)}
                                                        style={{ marginTop: '6px' }}
                                                      ></Checkbox>
                                                    )
                                                  },
                                                },
                                                {
                                                  key: 'labels',
                                                  header: '实例标签',
                                                  render: (item, _, recordIndex) => {
                                                    const { labels } = item.getFields(['labels'])
                                                    const validate = labels.getTouched() && labels.getError()
                                                    const labelFieldArray = [...labels.asArray()]
                                                    return (
                                                      <FormControl
                                                        status={validate ? 'error' : null}
                                                        message={validate ? labels.getError() : ''}
                                                        showStatusIcon={false}
                                                        style={{ display: 'inline', padding: 0 }}
                                                      >
                                                        {labelFieldArray
                                                          .slice(0, 3)
                                                          .map((labelField, index) =>
                                                            getLabelTag(labelField.getValue(), index, labels),
                                                          )}
                                                        {labels.getValue()?.length > 3 && (
                                                          <Bubble
                                                            content={labelFieldArray.map((labelField, index) =>
                                                              getLabelTag(labelField.getValue(), index, labels),
                                                            )}
                                                            trigger={'click'}
                                                          >
                                                            <Button type={'icon'} icon={'more'}></Button>
                                                          </Bubble>
                                                        )}
                                                        <Tag style={{ padding: 0, margin: 0 }}>
                                                          <RouteLabelSelectPanel
                                                            labelsField={labels}
                                                            argumentsField={argumentsField}
                                                            id={`${ruleIndex}-${index}-${recordIndex}`}
                                                          />
                                                        </Tag>
                                                      </FormControl>
                                                    )
                                                  },
                                                },
                                                {
                                                  key: 'close',
                                                  header: '',
                                                  width: 50,
                                                  render(item, rowKey, recordIndex) {
                                                    const index = Number(recordIndex)
                                                    return (
                                                      <Button
                                                        type='icon'
                                                        icon='close'
                                                        onClick={() => {
                                                          destination.asArray().remove(index)
                                                        }}
                                                      />
                                                    )
                                                  },
                                                },
                                              ]}
                                              addons={[autotip({ emptyText: '无匹配条件' })]}
                                            ></Table>
                                            <div style={{ marginTop: '8px' }}>
                                              <Icon type='plus' />
                                              <Button
                                                className='form-item-space'
                                                type='link'
                                                onClick={() =>
                                                  destination
                                                    .asArray()
                                                    .push(getEmptyDestination(destination.getValue().length))
                                                }
                                                disabled={destination.getValue().length >= 10}
                                              >
                                                添加实例分组
                                              </Button>
                                            </div>
                                          </Card.Body>
                                        )}
                                      </Card>
                                    </>
                                  )
                                  if (isDestDragging) {
                                    return (
                                      <Draggable key={index} draggableId={`实例分组${index + 1}`} index={index}>
                                        {destProvided => (
                                          <div
                                            ref={destProvided.innerRef}
                                            {...destProvided.draggableProps}
                                            {...destProvided.dragHandleProps}
                                          >
                                            {groupComponent}
                                          </div>
                                        )}
                                      </Draggable>
                                    )
                                  }
                                  return groupComponent
                                })}
                              </>
                            )}
                            <div style={{ marginTop: '8px' }}>
                              <Icon type='plus' />
                              <Button
                                className='form-item-space'
                                type='link'
                                onClick={() => ruleDestinations.asArray().push([getEmptyDestination(0)])}
                              >
                                添加次优先级
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      )
                    })}
                  </>
                )}
              </section>
              <div style={{ marginTop: '8px' }}>
                <Icon type='plus' />
                <Button className='form-item-space' type='link' onClick={() => rules.asArray().push(getEmptyRule())}>
                  添加规则
                </Button>
              </div>
            </FormItem>
            <FormItem label={'是否启用'}>
              <Switch value={enable.getValue()} onChange={v => enable.setValue(v)} />
            </FormItem>
          </Form>
          <Form.Action>
            <Button type='primary' onClick={() => dispatch(creators.submit())}>
              提交
            </Button>
            <Button
              onClick={() => {
                if (composedId?.namespace) {
                  router.navigate(
                    `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}&tab=${TAB.Route}`,
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
