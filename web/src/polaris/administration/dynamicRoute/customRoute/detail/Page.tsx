import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import {
  Form,
  Card,
  Icon,
  Table,
  Col,
  Row,
  Text,
  FormItem,
  FormText,
  Justify,
  Bubble,
  Button,
  Tag,
  LoadingTip,
} from 'tea-component'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import PageDuck from './PageDuck'
import { Values } from '../operations/CreateDuck'
import { RouteArgumentTextMap, RouteLabelTextMap, RoutingValueType } from '../types'
import { getLabelTag } from '../operations/Create'

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
  .compact-form-control .tea-form__controls--text{
    padding-top: 0px;
  }
`,
)

const formatNamespace = value => (value === '*' ? '全部命名空间' : value)
const formatService = value => (value === '*' ? '全部服务' : value)

export default purify(function CustomRoutePage(props: DuckCmpProps<PageDuck>) {
  const { duck, store, dispatch } = props
  const { selectors, selector } = duck
  const composedId = selectors.composedId(store)
  const { ruleDetail } = selector(store)
  const { name, description, source, destination, priority, rules } = ruleDetail as Values
  const backRoute = composedId?.namespace
    ? `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}&tab=router`
    : `/custom-route`
  const data = selectors.data(store)

  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={`${composedId.id} (${name || '-'})`}
      backRoute={backRoute}
    >
      {data ? (
        <Card>
          <Card.Body>
            <Form>
              <FormItem label={'规则名称'}>
                <FormText>{name || '-'}</FormText>
              </FormItem>
              <FormItem label={'描述'}>
                <FormText>{description || '-'}</FormText>
              </FormItem>
              <FormItem label={'优先级'}>
                <FormText>{priority}</FormText>
              </FormItem>
              <Form.Item label='匹配条件' className='compact-form-control'>
                <Form style={{ position: 'relative', width: '95%' }}>
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
                        <Text parent={'div'} theme={'label'} style={{ width: '100%', textAlign: 'center' }}>
                          主调请求按照匹配规则匹配成功后，将按照当前规则进行目标服务路由
                        </Text>
                      </div>
                      <Card bordered style={{ maxWidth: '500px', margin: 'auto' }}>
                        <Card.Body>
                          <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                            <FormItem label={'命名空间'}>
                              <FormText>{formatNamespace(source?.namespace)}</FormText>
                            </FormItem>
                            <FormItem label={'服务名称'}>
                              <FormText>{formatService(source?.service)}</FormText>
                            </FormItem>
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
                            <FormItem label={'命名空间'}>
                              <FormText>{formatNamespace(destination?.namespace)}</FormText>
                            </FormItem>
                            <FormItem label={'服务名称'}>
                              <FormText>{formatService(destination?.service)}</FormText>
                            </FormItem>
                          </Form>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Form>
              </Form.Item>
              <Form.Item label={'路由策略'}>
                {rules?.map((rule, index) => {
                  const { sources, destinations } = rule
                  return (
                    <Card key={index} style={{ width: 'calc(95% + 20px)', margin: '0 0 20px 0' }} bordered>
                      <Card.Header>
                        <Justify style={{ padding: '10px' }} left={<Text reset>{`规则${index + 1}`}</Text>}></Justify>
                      </Card.Header>
                      <Card.Body>
                        <Text parent={'div'} theme={'strong'} style={{ marginBottom: '20px' }}>
                          来源服务的请求满足以下匹配条件
                        </Text>
                        <section style={{ marginBottom: '20px' }}>
                          {sources?.[0]?.arguments?.length > 0 && (
                            <Table
                              verticalTop
                              bordered
                              records={sources?.[0]?.arguments}
                              columns={[
                                {
                                  key: 'type',
                                  header: '类型',
                                  width: 200,
                                  render: item => {
                                    const { type } = item

                                    return (
                                      <Text reset overflow tooltip={RouteArgumentTextMap[type]}>
                                        {RouteArgumentTextMap[type]}
                                      </Text>
                                    )
                                  },
                                },
                                {
                                  key: 'key',
                                  header: '键',
                                  render: item => {
                                    const { key } = item
                                    return (
                                      <Text reset overflow tooltip={key}>
                                        {key}
                                      </Text>
                                    )
                                  },
                                },
                                {
                                  key: 'value_type',
                                  header: '匹配方式',
                                  width: 80,
                                  render: item => {
                                    const { value_type } = item
                                    return (
                                      <Text reset overflow tooltip={RouteLabelTextMap[value_type]}>
                                        {RouteLabelTextMap[value_type]}
                                      </Text>
                                    )
                                  },
                                },
                                {
                                  key: 'value',
                                  header: '值/变量',
                                  render: item => {
                                    const { value, value_value_type } = item
                                    const v = value_value_type === RoutingValueType.PARAMETER ? '变量' : value
                                    return (
                                      <Text reset overflow tooltip={v}>
                                        {v}
                                      </Text>
                                    )
                                  },
                                },
                              ]}
                            ></Table>
                          )}
                        </section>
                        <Text parent={'div'} theme={'strong'} style={{ marginBottom: '20px' }}>
                          将转发至目标服务的以下实例分组
                        </Text>
                        {destinations?.length > 0 &&
                          destinations.map((destination, index) => {
                            return (
                              <Card style={{ marginBottom: '20px' }} key={index} bordered>
                                <Card.Header>
                                  <Justify
                                    left={
                                      <section style={{ padding: '5px 10px 5px 10px' }}>
                                        <Text
                                          reset
                                          theme={'strong'}
                                          style={{ marginRight: '10px', fontSize: '14px' }}
                                        >{`第${index}优先级`}</Text>
                                        <Text reset theme={'label'}>
                                          优先级常用于容灾场景，高优先级实例故障后，路由至次优先级实例。相同优先级下分组权重加和为100。
                                        </Text>
                                      </section>
                                    }
                                  ></Justify>
                                </Card.Header>
                                <Card.Body>
                                  <Table
                                    verticalTop
                                    bordered
                                    records={destination}
                                    columns={[
                                      {
                                        key: 'name',
                                        header: '分组名',
                                        width: 200,
                                        render: item => {
                                          const { name } = item
                                          return name
                                        },
                                      },
                                      {
                                        key: 'weight',
                                        header: '权重',
                                        width: 100,
                                        render: item => {
                                          const { weight } = item
                                          return weight
                                        },
                                      },
                                      {
                                        key: 'isolate',
                                        header: '是否隔离',
                                        width: 100,
                                        render: item => {
                                          const { isolate } = item
                                          return isolate ? '是' : '否'
                                        },
                                      },
                                      {
                                        key: 'labels',
                                        header: '实例标签',
                                        render: item => {
                                          const { labels } = item
                                          return (
                                            <>
                                              {labels.slice(0, 3).map((label, index) => getLabelTag(label, index))}
                                              {labels.length > 3 && (
                                                <Bubble
                                                  content={labels.map((label, index) => getLabelTag(label, index))}
                                                >
                                                  <Tag>
                                                    <Button type={'icon'} icon={'more'}></Button>
                                                  </Tag>
                                                </Bubble>
                                              )}
                                            </>
                                          )
                                        },
                                      },
                                    ]}
                                  ></Table>
                                </Card.Body>
                              </Card>
                            )
                          })}
                      </Card.Body>
                    </Card>
                  )
                })}
              </Form.Item>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <LoadingTip />
      )}
    </DetailPage>
  )
})
