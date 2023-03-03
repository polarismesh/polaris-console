import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { Col, Form, FormItem, FormText, Justify, Row, SelectMultiple, Text } from 'tea-component'
import MetricCard from '../MetricCard'
import SimpleCollapse from '../SimpleCollapse'
import { getQueryMap, MetricName } from '../types'
import BaseInfoDuck from './PageDuck'

export default function Service(props: DuckCmpProps<BaseInfoDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators, selectors } = duck
  const {
    composedId: { start, end, step, namespace },
    selectedConfigGroup,
    selectedService,
    data,
  } = selector(store)
  const [activeIds, setActiveIds] = React.useState(['all'])
  React.useEffect(() => {
    setActiveIds(['all'])
  }, [namespace])
  const basicQueryParam = { start, end, step }
  const configGroupMap = selectors.configGroupMap(store)
  const serviceMap = selectors.serviceMap(store)
  const selectAllService = selectedService?.length === data?.serviceList?.length
  const selectAllConfigGroup = selectedConfigGroup?.length === data?.configGroupList?.length
  const onChangeFunction = v => {
    setActiveIds(v)
  }
  return (
    <>
      <Justify
        left={
          <>
            <Form layout={'inline'} style={{ display: 'inline-block' }}>
              <FormItem label={'服务'}>
                {data?.serviceList.length ? (
                  <SelectMultiple
                    searchable
                    appearance='button'
                    options={[...(data?.serviceList || [])]}
                    value={selectedService}
                    onChange={v => dispatch(creators.selectService(v))}
                    allOption={{ text: '全部服务汇总', value: '' }}
                  ></SelectMultiple>
                ) : (
                  <FormText>无可选服务</FormText>
                )}
              </FormItem>
              <FormItem label={'配置分组'}>
                {data?.configGroupList.length ? (
                  <SelectMultiple
                    searchable
                    appearance='button'
                    options={[...(data?.configGroupList || [])]}
                    value={selectedConfigGroup}
                    onChange={v => dispatch(creators.selectConfigGroup(v))}
                    allOption={{ text: '全部配置分组汇总', value: '' }}
                  ></SelectMultiple>
                ) : (
                  <FormText>无配置分组</FormText>
                )}
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
      </SimpleCollapse>
      {!selectAllService && (
        <>
          {selectedService.map(service => {
            const curService = serviceMap[service]
            return (
              <SimpleCollapse
                key={service}
                id={service}
                activeIds={activeIds}
                onChange={onChangeFunction}
                title={<Text>服务{curService?.name}</Text>}
              >
                <MetricCard
                  {...basicQueryParam}
                  query={getQueryMap[MetricName.Instance]({ namespace, service })}
                  cardProps={{ bordered: true }}
                  cardBodyProps={{ title: '实例数' }}
                ></MetricCard>
              </SimpleCollapse>
            )
          })}
        </>
      )}
      {!selectAllConfigGroup && (
        <>
          {selectedConfigGroup.map(configGroup => {
            const curConfigGroup = configGroupMap[configGroup]
            return (
              <SimpleCollapse
                key={configGroup}
                id={configGroup}
                activeIds={activeIds}
                onChange={onChangeFunction}
                title={<Text>配置分组{curConfigGroup?.name}</Text>}
              >
                <MetricCard
                  {...basicQueryParam}
                  query={getQueryMap[MetricName.ConfigFile]({ namespace, configGroup })}
                  cardProps={{ bordered: true }}
                  cardBodyProps={{ title: '配置文件数' }}
                ></MetricCard>
              </SimpleCollapse>
            )
          })}
        </>
      )}
    </>
  )
}
