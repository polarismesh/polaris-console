import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Form, Card, Icon, Table, Col, Row, Text, FormItem, FormText } from 'tea-component'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import PageDuck from './PageDuck'
import { Values } from '../operations/CreateDuck'
import { RouteArgumentTextMap, RouteLabelTextMap } from '../types'
import { t } from 'i18next'

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

const formatNamespace = (value) => (value === '*' ? t('全部命名空间') : value)
const formatService = (value) => (value === '*' ? t('全部服务') : value)

export default purify(function CustomRoutePage(props: DuckCmpProps<PageDuck>) {
  const { duck, store, dispatch } = props
  const { selectors, selector } = duck
  const composedId = selectors.composedId(store)
  const data = selectors.data(store)
  const { ruleDetail } = selector(store)
  const { name, description, source, destination, priority } = ruleDetail as Values
  const backRoute = composedId?.namespace
    ? `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}`
    : `/custom-route`
  if (!data) {
    return <noscript />
  }
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={`${composedId.id} (${name || '-'})`}
      backRoute={backRoute}
    >
      <Card>
        <Card.Body>
          <Form>
            <FormItem label={t('路由规则名称')}>
              <FormText>{name || '-'}</FormText>
            </FormItem>
            <FormItem label={t('描述')}>
              <FormText>{description || '-'}</FormText>
            </FormItem>
            <FormItem label={t('优先级')}>
              <FormText>{priority}</FormText>
            </FormItem>
            <Form.Item label={t('路由规则详情')} className='compact-form-control'>
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
                  <Icon type={'arrowright'} style={{ position: 'absolute', right: '-9px', top: '-9px' }} />
                </div>
                <Row gap={30}>
                  <Col span={12}>
                    <div style={{ margin: '10px 0' }}>
                      <Text parent={'div'} style={{ width: '100%', textAlign: 'center', fontWeight: 'bolder' }}>
                        {t('来源服务')}
                      </Text>
                      <Text parent={'div'} theme={'label'} style={{ width: '100%', textAlign: 'center' }}>
                        {t('主调请求按照匹配规则匹配成功后，将按照当前规则进行目标服务路由')}
                      </Text>
                    </div>
                    <Card bordered>
                      <Card.Body title={t('主调服务')}>
                        <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                          <FormItem label={t('命名空间')}>
                            <FormText>{formatNamespace(source.namespace)}</FormText>
                          </FormItem>
                          <FormItem label={t('服务名称')}>
                            <FormText>{formatService(source.service)}</FormText>
                          </FormItem>
                        </Form>
                      </Card.Body>
                      <Card.Body title={t('请求标签')}>
                        <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                          <Form.Item label={t('请求匹配规则')} align='middle'>
                            {source?.arguments?.length > 0 && (
                              <Table
                                verticalTop
                                bordered
                                records={source?.arguments}
                                columns={[
                                  {
                                    key: 'type',
                                    header: t('类型'),
                                    render: (item) => {
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
                                    header: t('键'),
                                    render: (item) => {
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
                                    header: t('匹配方式'),
                                    width: 80,
                                    render: (item) => {
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
                                    header: t('值'),
                                    render: (item) => {
                                      const { value } = item
                                      return (
                                        <Text reset overflow tooltip={value}>
                                          {value}
                                        </Text>
                                      )
                                    },
                                  },
                                ]}
                              ></Table>
                            )}
                          </Form.Item>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <div style={{ margin: '10px 0' }}>
                      <Text parent={'div'} style={{ width: '100%', textAlign: 'center', fontWeight: 'bolder' }}>
                        {t('目标服务')}
                      </Text>
                      <Text parent={'div'} theme={'label'} style={{ width: '100%', textAlign: 'center' }}>
                        {t('请求会按照规则路由到目标服务分组')}
                      </Text>
                    </div>
                    <Card bordered>
                      <Card.Body title={t('被调服务')}>
                        <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                          <FormItem label={t('命名空间')}>
                            <FormText>{formatNamespace(destination.namespace)}</FormText>
                          </FormItem>
                          <FormItem label={t('服务名称')}>
                            <FormText>{formatService(destination.service)}</FormText>
                          </FormItem>
                        </Form>
                      </Card.Body>
                      <Card.Body title={t('实例分组')}>
                        {destination.instanceGroups.map((instanceGroup, index) => {
                          const { name, weight, priority, labels, isolate } = instanceGroup
                          return (
                            <Card key={index} bordered>
                              <Card.Body title={name} operation={<></>}>
                                <Form style={{ padding: '0px', backgroundColor: 'inherit' }}>
                                  <Form.Item
                                    label={t('实例标签')}
                                    align='middle'
                                    tips={t('相同的标签键，只有最后出现的生效')}
                                  >
                                    {labels?.length > 0 && (
                                      <Table
                                        verticalTop
                                        bordered
                                        records={labels}
                                        columns={[
                                          {
                                            key: 'key',
                                            header: t('键'),
                                            render: (item) => {
                                              const { key } = item
                                              return (
                                                <Text reset overflow tooltip={key}>
                                                  {key}
                                                </Text>
                                              )
                                            },
                                          },
                                          {
                                            key: 'type',
                                            header: t('匹配方式'),
                                            width: 80,
                                            render: (item) => {
                                              const { type } = item
                                              return (
                                                <Text reset overflow tooltip={RouteLabelTextMap[type]}>
                                                  {RouteLabelTextMap[type]}
                                                </Text>
                                              )
                                            },
                                          },
                                          {
                                            key: 'value',
                                            header: t('值'),
                                            render: (item) => {
                                              const { value } = item
                                              return (
                                                <Text reset overflow tooltip={value}>
                                                  {value}
                                                </Text>
                                              )
                                            },
                                          },
                                        ]}
                                      ></Table>
                                    )}
                                  </Form.Item>
                                  <FormItem label={t('权重')}>
                                    <FormText>{weight}</FormText>
                                  </FormItem>
                                  <FormItem label={t('优先级')} tips={t('优先级数字设置越小，匹配顺序越靠前')}>
                                    <FormText>{priority}</FormText>
                                  </FormItem>
                                  <FormItem label={t('是否隔离')}>
                                    <FormText>{isolate ? t('是') : t('否')}</FormText>
                                  </FormItem>
                                </Form>
                              </Card.Body>
                            </Card>
                          )
                        })}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Form>
            </Form.Item>
          </Form>
        </Card.Body>
      </Card>
    </DetailPage>
  )
})
