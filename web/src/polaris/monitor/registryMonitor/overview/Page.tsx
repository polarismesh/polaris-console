import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { Col, Row, Text } from 'tea-component'
import MetricCard from '../MetricCard'
import { getQueryMap, MetricName } from '../types'
import BaseInfoDuck from './PageDuck'
interface Props extends DuckCmpProps<BaseInfoDuck> {
  filterSlot: React.ReactNode
}
export default function Overview(props: Props) {
  const { duck, store, filterSlot } = props
  const { selector } = duck
  const {
    composedId: { start, end, step, namespace },
  } = selector(store)
  const basicQueryParam = { start, end, step }

  return (
    <>
      {filterSlot}
      <Row>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.Node]()}
            cardProps={{ bordered: true }}
            cardBodyProps={{ title: '客户端节点数' }}
          ></MetricCard>
        </Col>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.Connect]()}
            cardProps={{ bordered: true }}
            cardBodyProps={{ title: '客户端连接数' }}
          ></MetricCard>
        </Col>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.Request]()}
            cardProps={{ bordered: true }}
            cardBodyProps={{
              title: '总请求数',
              subtitle: (
                <Text parent={'div'} theme={'label'}>
                  客户端访问北极星服务端请求数
                </Text>
              ),
            }}
          ></MetricCard>
        </Col>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.Timeout]({ ...basicQueryParam })}
            cardProps={{ bordered: true }}
            cardBodyProps={{
              title: '请求时延',
              subtitle: (
                <Text parent={'div'} theme={'label'}>
                  客户端访问北极星服务端请求时延
                </Text>
              ),
            }}
          ></MetricCard>
        </Col>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.Service]({ namespace })}
            cardProps={{ bordered: true }}
            cardBodyProps={{ title: '服务数' }}
          ></MetricCard>
        </Col>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.Instance]({ namespace })}
            cardProps={{ bordered: true }}
            cardBodyProps={{ title: '实例数' }}
          ></MetricCard>
        </Col>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.ConfigGroup]({ namespace })}
            cardProps={{ bordered: true }}
            cardBodyProps={{ title: '配置分组数' }}
          ></MetricCard>
        </Col>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.ConfigFile]({ namespace })}
            cardProps={{ bordered: true }}
            cardBodyProps={{ title: '配置数' }}
          ></MetricCard>
        </Col>
      </Row>
    </>
  )
}
