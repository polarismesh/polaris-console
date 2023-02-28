import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { Col, Row } from 'tea-component'
import MetricCard from '../MetricCard'
import { getQueryMap, MetricName } from '../types'
import BaseInfoDuck from './PageDuck'

export default function Overview(props: DuckCmpProps<BaseInfoDuck>) {
  const { duck, store } = props
  const { selector } = duck
  const {
    composedId: { start, end, step, namespace },
  } = selector(store)
  const basicQueryParam = { start, end, step }

  return (
    <>
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
            cardBodyProps={{ title: '请求数' }}
          ></MetricCard>
        </Col>
        <Col span={12}>
          <MetricCard
            {...basicQueryParam}
            query={getQueryMap[MetricName.Timeout]()}
            cardProps={{ bordered: true }}
            cardBodyProps={{ title: '响应耗时' }}
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
