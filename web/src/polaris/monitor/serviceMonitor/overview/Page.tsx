import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { Button, Card, Col, Form, Row, SearchBox, Table, Text } from 'tea-component'
import MetricCard from '../../registryMonitor/MetricCard'
import MetricPieCard from '../MetricPieCard'
import MetricTagCard from '../MetricTagCard'
import { getPieQueryMap, getQueryMap, getTableQueryMap, MetricName, roundToN } from '../types'
import BaseInfoDuck from './PageDuck'
import { autotip, pageable, sortable } from 'tea-component/lib/table/addons'
import { FilterType } from '../Page'

interface Props extends DuckCmpProps<BaseInfoDuck> {
  filterMap: Record<string, React.ReactNode>
}
export default function Overview(props: Props) {
  const { duck, store, filterMap, dispatch } = props
  const { selector, creators } = duck
  const {
    composedId: { start, end, step, namespace },
    serviceList,
    sort,
  } = selector(store)
  const [serviceKeyword, setServiceKeyword] = React.useState('')
  const basicQueryParam = { start, end, step }
  const processedServiceList = serviceList.filter(item => item.name.indexOf(serviceKeyword) > -1)
  const sortedCallerList = sort.length
    ? processedServiceList.sort((a, b) => {
        const sortby = sort?.[0].by
        const order = sort?.[0].order
        return order === 'desc' ? Number(a[sortby]) - Number(b[sortby]) : Number(b[sortby]) - Number(a[sortby])
      })
    : processedServiceList
  return (
    <>
      <section style={{ padding: '20px 0px', marginBottom: '20px' }}>
        <Form layout={'inline'} style={{ display: 'inline-block' }}>
          {filterMap[FilterType.Namespace]}
          {filterMap[FilterType.TimeRange]}
          {filterMap[FilterType.Step]}
        </Form>
      </section>
      <Row showSplitLine>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.Request]({ calleeNamespace: namespace })}
            cardProps={{ bordered: true }}
            cardBodyProps={{ title: '服务请求数' }}
          ></MetricCard>
        </Col>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.Timeout]({ ...basicQueryParam, calleeNamespace: namespace })}
            cardProps={{ bordered: true }}
            cardBodyProps={{ title: '服务请求时延' }}
          ></MetricCard>
        </Col>
      </Row>
      <Row style={{ marginTop: '20px' }}>
        <Col span={24}>
          <MetricTagCard
            {...basicQueryParam}
            query={getTableQueryMap[MetricName.RetCodeDistribute]({ calleeNamespace: namespace })}
            cardProps={{ bordered: true }}
            cardBodyProps={{ title: '返回码统计' }}
          ></MetricTagCard>
        </Col>
      </Row>
      <Card bordered style={{ marginTop: '20px' }}>
        <Card.Body title={'服务请求分布'}>
          <Row>
            <Col>
              <MetricPieCard
                {...basicQueryParam}
                query={getPieQueryMap[MetricName.SuccessRate]({ calleeNamespace: namespace })}
                cardProps={{ bordered: true }}
                cardBodyProps={{ title: '服务请求成功率分布' }}
              ></MetricPieCard>
            </Col>
            <Col>
              <MetricPieCard
                {...basicQueryParam}
                query={getPieQueryMap[MetricName.Timeout]({ calleeNamespace: namespace })}
                cardProps={{ bordered: true }}
                cardBodyProps={{ title: '服务请求时延分布' }}
              ></MetricPieCard>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card bordered style={{ marginTop: '20px' }}>
        <Card.Body
          title={'服务列表'}
          operation={
            <SearchBox
              onSearch={v => {
                setServiceKeyword(v)
              }}
              placeholder={'请输入调用者IP'}
            ></SearchBox>
          }
        >
          <Table
            bordered
            records={sortedCallerList || []}
            columns={[
              {
                key: 'name',
                header: '服务名称',
                render: x => {
                  return (
                    <Button
                      type={'link'}
                      onClick={() => {
                        dispatch(creators.gotoServiceDetail({ service: x.name, namespace: x.namespace }))
                      }}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      <Text overflow tooltip={x.name}>
                        {x.name}
                      </Text>
                    </Button>
                  )
                },
              },
              {
                key: 'namespace',
                header: '命名空间',
                render: x => {
                  return x.namespace
                },
              },
              {
                key: 'healthy-total',
                header: '健康/总实例数',
                render: x => {
                  return `${x.healthy_instance_count}/${x.total_instance_count}`
                },
              },
              {
                key: 'success_rate',
                header: '成功率',
                render: x => {
                  return `${roundToN(Number(x.success_rate) * 100, 2)}%`
                },
              },
              {
                key: 'total_request',
                header: '总请求数',
              },
              {
                key: 'failed_request',
                header: '失败请求数',
              },
              {
                key: 'circuitbreaker_request',
                header: '熔断请求数',
              },
              {
                key: 'avg_timeout',
                header: '平均时延',
                render: x => {
                  return `${roundToN(x.avg_timeout, 2)}ms`
                },
              },
            ]}
            addons={[
              autotip({ emptyText: '暂无数据' }),
              sortable({
                columns: ['success_rate', 'total_request', 'failed_request', 'circuitbreaker_request', 'avg_timeout'],
                value: sort,
                onChange: value => dispatch(creators.setSort(value.length ? value : [])),
              }),
              pageable({}),
            ]}
          ></Table>
        </Card.Body>
      </Card>
    </>
  )
}
