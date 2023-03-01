import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { Col, Form, FormItem, Justify, Row, SelectMultiple } from 'tea-component'
import { combineVector } from '../../combvec'
import MetricCard from '../MetricCard'
import SimpleCollapse from '../SimpleCollapse'
import { getQueryMap, MetricName, MonitorFeature, MonitorFeatureOptions, MonitorFeatureTextMap } from '../types'
import BaseInfoDuck from './PageDuck'

export default function Server(props: DuckCmpProps<BaseInfoDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators, selectors } = duck
  const {
    composedId: { start, end, step, namespace },
    selectedInterface,
    selectedPod,
    data,
  } = selector(store)
  const [activeIds, setActiveIds] = React.useState(['all'])
  const [selectedFeature, setSelectedFeature] = React.useState(Object.values(MonitorFeature) as string[])
  React.useEffect(() => {
    setActiveIds(['all'])
  }, [namespace])
  const basicQueryParam = { start, end, step }
  const interfaceMap = selectors.interfaceMap(store)
  const selectAllInterface = selectedInterface?.length === data?.interfaceList?.length
  const selectAllPod = selectedPod?.length === data?.podList?.length
  const onChangeFunction = v => {
    setActiveIds(v)
  }
  let partitions
  if (selectAllInterface && selectAllPod) {
    partitions = []
  } else if (selectAllInterface) {
    partitions = selectedPod.map(item => ({ podName: item }))
  } else if (selectAllPod) {
    partitions = selectedInterface.map(item => ({ interfaceId: item }))
  } else {
    partitions = combineVector(
      selectedPod.map(podName =>
        selectedInterface.map(interfaceId => ({
          podName,
          interfaceId,
        })),
      ),
    )
  }
  const currentInterfaceList = (data?.interfaceList || []).filter(item => selectedFeature.includes(item.type))
  return (
    <>
      <Justify
        left={
          <>
            <Form layout={'inline'} style={{ display: 'inline-block' }}>
              <FormItem label={'功能'}>
                <SelectMultiple
                  appearance='button'
                  options={MonitorFeatureOptions}
                  value={selectedFeature}
                  onChange={v => {
                    setSelectedFeature(v)
                    const availableInterface = selectedInterface.filter(interfaceId =>
                      v.includes(interfaceMap[interfaceId].type),
                    )
                    if (availableInterface.length === 0) {
                      dispatch(
                        creators.selectInterface(
                          data?.interfaceList.filter(item => v.includes(item.type)).map(item => item.value),
                        ),
                      )
                      return
                    }
                    dispatch(creators.selectInterface(availableInterface))
                  }}
                  allOption={{ text: '全部服务汇总', value: '' }}
                ></SelectMultiple>
              </FormItem>
              <FormItem label={'接口'}>
                <SelectMultiple
                  appearance='button'
                  options={currentInterfaceList}
                  value={selectedInterface}
                  onChange={v => dispatch(creators.selectInterface(v))}
                  allOption={{ text: '全部接口汇总', value: '' }}
                ></SelectMultiple>
              </FormItem>
              <FormItem label={'节点'}>
                <SelectMultiple
                  appearance='button'
                  options={[...(data?.podList || [])]}
                  value={selectedPod}
                  onChange={v => dispatch(creators.selectPod(v))}
                  allOption={{ text: '全部节点汇总', value: '' }}
                ></SelectMultiple>
              </FormItem>
            </Form>
          </>
        }
      ></Justify>

      <SimpleCollapse id={'all'} activeIds={activeIds} title={'汇总'} onChange={onChangeFunction}>
        <Row>
          <Col span={12}>
            <MetricCard
              {...basicQueryParam}
              query={getQueryMap[MetricName.Request]({ ...basicQueryParam })}
              cardProps={{ bordered: true }}
              cardBodyProps={{ title: '总请求数' }}
            ></MetricCard>
          </Col>
          <Col span={12}>
            <MetricCard
              {...basicQueryParam}
              query={getQueryMap[MetricName.Timeout]({ ...basicQueryParam })}
              cardProps={{ bordered: true }}
              cardBodyProps={{ title: '响应耗时' }}
            ></MetricCard>
          </Col>
          <Col span={12}>
            <MetricCard
              {...basicQueryParam}
              query={getQueryMap[MetricName.ErrorReq]()}
              cardProps={{ bordered: true }}
              cardBodyProps={{ title: '失败请求数' }}
            ></MetricCard>
          </Col>
          <Col span={12}>
            <MetricCard
              {...basicQueryParam}
              query={getQueryMap[MetricName.RetCode]()}
              cardProps={{ bordered: true }}
              cardBodyProps={{ title: '返回码分布' }}
            ></MetricCard>
          </Col>
        </Row>
      </SimpleCollapse>
      {partitions.length > 0 && (
        <>
          {partitions.map(({ podName, interfaceId }) => {
            const id = interfaceId
            const curInterface = interfaceMap[id]
            const interfaceName = curInterface.interfaceName
            const key = `${interfaceName ? `${interfaceName}-` : ''}${podName ? podName : ''}`
            return (
              <SimpleCollapse
                id={key}
                key={`${interfaceName ? interfaceName : ''}-${podName ? podName : ''}`}
                activeIds={activeIds}
                title={`
                ${curInterface ? `${MonitorFeatureTextMap[curInterface.type]}功能-${curInterface.desc}接口` : ''}
                ${podName && interfaceName ? '-' : ''}
                ${podName ? `${podName}节点` : ''}`}
                onChange={onChangeFunction}
              >
                <Row>
                  <Col span={12}>
                    <MetricCard
                      {...basicQueryParam}
                      query={getQueryMap[MetricName.Request]({ interfaceName, podName })}
                      cardProps={{ bordered: true }}
                      cardBodyProps={{ title: '总请求数' }}
                    ></MetricCard>
                  </Col>
                  <Col span={12}>
                    <MetricCard
                      {...basicQueryParam}
                      query={getQueryMap[MetricName.Timeout]({ ...basicQueryParam, interfaceName, podName })}
                      cardProps={{ bordered: true }}
                      cardBodyProps={{ title: '响应耗时' }}
                    ></MetricCard>
                  </Col>
                  <Col span={12}>
                    <MetricCard
                      {...basicQueryParam}
                      query={getQueryMap[MetricName.ErrorReq]({ interfaceName, podName })}
                      cardProps={{ bordered: true }}
                      cardBodyProps={{ title: '失败请求数' }}
                    ></MetricCard>
                  </Col>
                  <Col span={12}>
                    <MetricCard
                      {...basicQueryParam}
                      query={getQueryMap[MetricName.RetCode]({ interfaceName, podName })}
                      cardProps={{ bordered: true }}
                      cardBodyProps={{ title: '返回码分布' }}
                    ></MetricCard>
                  </Col>
                </Row>
              </SimpleCollapse>
            )
          })}
        </>
      )}
    </>
  )
}
