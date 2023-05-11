import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import AccessLimitingDetailPageDuck from './PageDuck'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { Values } from '../operations/CreateDuck'

import { Form, Card, Text, Table, H6, FormItem, FormText } from 'tea-component'
import { LimitType, LimitTypeMap, LimitMethodTypeMap, LimitAction, LimitActionMap, LimitFailoverMap } from '../types'
import insertCSS from '@src/polaris/common/helpers/insertCSS'

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
export default purify(function AccessLimitingDetailPag(props: DuckCmpProps<AccessLimitingDetailPageDuck>) {
  const { duck, store, dispatch } = props
  const { selectors, selector } = duck
  const composedId = selectors.composedId(store)
  const { ruleDetail } = selector(store)
  const {
    name,
    type: strLimitType,
    namespace,
    service,
    method: methodObj,
    arguments: argsList,
    amounts,
    regex_combine,
    action,
    max_queue_delay,
    failover,
    disable,
  } = ruleDetail as Values

  const backRoute = composedId?.namespace
    ? `/service-detail?name=${composedId?.service}&namespace=${composedId?.namespace}&tab=ratelimiter`
    : `/accesslimit`

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
            <FormItem label='限流规则名称'>
              <FormText>{name || '-'}</FormText>
            </FormItem>
            <FormItem label='限流类型'>
              <FormText>{LimitTypeMap[strLimitType]}</FormText>
            </FormItem>

            <Form.Item label='限流规则详情'>
              <Card bordered>
                <Card.Body
                  title='目标服务'
                  subtitle='您可以对目标服务的指定接口设置限流规则。当该接口被调用时，符合匹配规则的请求，则会触发限流规则'
                >
                  <Form style={{ padding: '20px' }}>
                    <FormItem label='命名空间'>
                      <FormText>{namespace}</FormText>
                    </FormItem>
                    <FormItem label='服务名称'>
                      <FormText>{service}</FormText>
                    </FormItem>

                    <FormItem label='接口名称' align='middle'>
                      <FormText>{methodObj && methodObj['value']}</FormText>
                      <FormText>{methodObj && LimitMethodTypeMap[methodObj['type']]}</FormText>
                    </FormItem>
                    <Form.Item label='请求匹配规则' align='middle' tips={MatchingLabelTips}>
                      {argsList?.length > 0 && (
                        <Table
                          hideHeader
                          verticalTop
                          bordered
                          style={{ width: '830px' }}
                          records={[...argsList]}
                          columns={[
                            {
                              key: 'type',
                              header: '类型',
                              render: item => {
                                const { type } = item
                                return (
                                  <Text reset overflow>
                                    {type}
                                  </Text>
                                )
                              },
                            },
                            {
                              key: 'key',
                              header: 'key',
                              render: item => {
                                const { key } = item
                                return (
                                  <Text reset overflow>
                                    {key}
                                  </Text>
                                )
                              },
                            },
                            {
                              key: 'operator',
                              header: 'operator',
                              width: 120,
                              render: item => {
                                const { operator } = item
                                return (
                                  <Text reset overflow>
                                    {LimitMethodTypeMap[operator]}
                                  </Text>
                                )
                              },
                            },
                            {
                              key: 'value',
                              header: 'value',
                              render: item => {
                                const { value } = item
                                return (
                                  <Text reset overflow>
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

              <Card bordered>
                <Card.Body title='限流规则'>
                  <div>
                    <H6 className='card-module-h6-title-style'>限流条件</H6>
                    <Text theme='label'>满足以下任意条件即可触发限流</Text>
                  </div>
                  <Form style={{ padding: '20px' }}>
                    <Form.Item label='限流阈值' align='middle'>
                      {amounts?.length > 0 && (
                        <Table
                          style={{ width: '400px' }}
                          records={[...amounts]}
                          columns={[
                            {
                              key: 'validDuration',
                              header: '统计窗口时长',
                              render: item => {
                                const { validDurationNum, validDurationUnit } = item
                                return (
                                  <Text>
                                    {validDurationNum}
                                    {validDurationUnit}
                                  </Text>
                                )
                              },
                            },
                            {
                              key: 'maxAmount',
                              header: '请求数阈值',
                              render: item => {
                                const { maxAmount } = item
                                return <Text>{maxAmount}次</Text>
                              },
                            },
                          ]}
                          compact
                          bordered
                        ></Table>
                      )}
                    </Form.Item>
                    <FormItem
                      label='合并计算阈值'
                      message='如果目标请求匹配到多个接口及参数，则将匹配到的所有请求汇合，合并计算阈值，具体规则查看'
                    >
                      <FormText>{regex_combine ? '是' : '否'}</FormText>
                    </FormItem>
                  </Form>
                  <div style={{ marginTop: '10px' }}>
                    <H6 className='card-module-h6-title-style'>限流方案</H6>
                    <Text theme='label'>满足限流触发条件后的处理方案</Text>
                  </div>
                  <Form style={{ padding: '20px' }}>
                    <Form.Item label='限流效果'>
                      <FormText>{LimitActionMap[action]}</FormText>
                    </Form.Item>
                    {strLimitType === LimitType.GLOBAL && (
                      <Form.Item
                        label='失败处理策略'
                        message='当出现通信失败或者 Token Server 不可用时，限流方案退化到单机限流的模式'
                      >
                        <FormText>{LimitFailoverMap[failover]}</FormText>
                      </Form.Item>
                    )}
                    {action === LimitAction.UNIRATE && (
                      <Form.Item label='最大排队时长'>
                        <FormText>{max_queue_delay}秒</FormText>
                      </Form.Item>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Form.Item>
            <FormItem label='是否启用'>
              <FormText>{disable ? '是' : '否'}</FormText>
            </FormItem>
          </Form>
        </Card.Body>
      </Card>
    </DetailPage>
  )
})
