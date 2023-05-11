import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { Checkbox, Col, Form, FormItem, FormText, Row, SelectMultiple, Text } from 'tea-component'
import MetricCard from '../MetricCard'
import SimpleCollapse from '../SimpleCollapse'
import { getQueryMap, MetricName, MonitorFeature, MonitorFeatureOptions, MonitorFeatureTextMap } from '../types'
import BaseInfoDuck from './PageDuck'
interface Props extends DuckCmpProps<BaseInfoDuck> {
  filterSlot: React.ReactNode
}
export default function Server(props: Props) {
  const { duck, store, dispatch, filterSlot } = props
  const { selector, creators, selectors } = duck
  const {
    composedId: { start, end, step, namespace },
    selectedInterface,
    selectedPod,
    data,
  } = selector(store)
  const [activeIds, setActiveIds] = React.useState(['all'])
  const [selectAllInterface, setSelectAllInterface] = React.useState(true)
  const [selectAllPod, setSelectAllPod] = React.useState(true)

  const [selectedFeature, setSelectedFeature] = React.useState(Object.values(MonitorFeature) as string[])
  React.useEffect(() => {
    setActiveIds(['all'])
  }, [namespace])
  const basicQueryParam = { start, end, step }
  const interfaceMap = selectors.interfaceMap(store)
  const onChangeFunction = v => {
    setActiveIds(v)
  }
  const partitions = selectAllPod
    ? selectedInterface.map(item => ({ interfaceId: item, id: item }))
    : selectAllInterface
    ? selectedPod.map(item => ({ podName: item, id: item }))
    : selectedPod
        .map(podName =>
          selectedInterface.map(interfaceId => ({
            podName,
            interfaceId,
            id: `${interfaceId}-${podName}`,
          })),
        )
        .reduce((prev, curr) => {
          return prev.concat(curr)
        }, [])

  React.useEffect(() => {
    partitions.length ? setActiveIds([partitions[0].id]) : setActiveIds(['all'])
  }, [namespace, selectedInterface.length, selectedPod.length])
  const currentInterfaceList = (data?.interfaceList || []).filter(item => selectedFeature.includes(item.type))
  return (
    <>
      {filterSlot}
      <section style={{ borderBottom: '1px solid #d0d5dd', padding: '20px 0px', marginBottom: '20px' }}>
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
              allOption={{ text: '全部功能汇总', value: '' }}
              size={'m'}
            ></SelectMultiple>
          </FormItem>
          <FormItem
            label={'接口'}
            suffix={
              <>
                <Checkbox
                  value={selectAllInterface}
                  onChange={v => {
                    setSelectAllInterface(v)
                    if (v) {
                      dispatch(creators.selectInterface([]))
                    } else {
                      dispatch(creators.selectInterface([currentInterfaceList?.[0]?.value]))
                    }
                  }}
                >
                  汇总
                </Checkbox>
              </>
            }
          >
            {currentInterfaceList?.length ? (
              <SelectMultiple
                searchable
                appearance='button'
                options={[...currentInterfaceList]}
                value={selectedInterface}
                onChange={v => {
                  dispatch(creators.selectInterface(v))
                  if (v.length) {
                    setSelectAllInterface(false)
                  } else {
                    setSelectAllInterface(true)
                  }
                }}
                size={'m'}
                placeholder={'全部接口汇总'}
                className={'black-placeholder-text'}
              ></SelectMultiple>
            ) : (
              <FormText>无可选接口</FormText>
            )}
          </FormItem>
          <FormItem
            label={'节点'}
            align={'middle'}
            suffix={
              <>
                <Checkbox
                  value={selectAllPod}
                  onChange={v => {
                    setSelectAllPod(v)
                    if (v) {
                      dispatch(creators.selectPod([]))
                    } else {
                      dispatch(creators.selectPod([data?.podList?.[0]?.value]))
                    }
                  }}
                >
                  汇总
                </Checkbox>
              </>
            }
          >
            {data?.podList.length ? (
              <SelectMultiple
                searchable
                appearance='button'
                options={data?.podList || []}
                value={selectedPod}
                onChange={v => {
                  dispatch(creators.selectPod(v))
                  if (v.length) {
                    setSelectAllPod(false)
                  } else {
                    setSelectAllPod(true)
                  }
                }}
                size={'m'}
                placeholder={'全部节点汇总'}
                className={'black-placeholder-text'}
              ></SelectMultiple>
            ) : (
              <FormText>无节点</FormText>
            )}
          </FormItem>
        </Form>
      </section>
      {selectAllInterface && selectAllPod && (
        <SimpleCollapse id={'all'} activeIds={activeIds} title={'汇总'} onChange={onChangeFunction}>
          <Row>
            <Col span={12}>
              <MetricCard
                {...basicQueryParam}
                query={getQueryMap[MetricName.Request]({ ...basicQueryParam })}
                cardProps={{ bordered: true }}
                cardBodyProps={{
                  title: '请求数',
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
      )}

      {partitions.length > 0 && (
        <>
          {partitions.map(({ podName, interfaceId, id }) => {
            const curInterface = interfaceMap[interfaceId]
            const interfaceName = curInterface?.interfaceName
            const key = `${interfaceName ? `${interfaceName}-` : '所有接口汇总-'}${podName ? podName : '所有节点汇总'}`
            return (
              <SimpleCollapse
                id={id}
                key={key}
                activeIds={activeIds}
                title={`
                ${
                  curInterface
                    ? `${MonitorFeatureTextMap[curInterface.type]}功能-${curInterface.desc}接口`
                    : '所有接口汇总'
                }
                ${podName && interfaceName ? '-' : ''}
                ${podName ? `${podName}节点` : '所有节点汇总'}`}
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
                      cardBodyProps={{ title: '请求时延' }}
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
