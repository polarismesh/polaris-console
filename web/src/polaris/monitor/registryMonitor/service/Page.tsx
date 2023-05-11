import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { Checkbox, Col, Form, FormItem, Row, SelectMultiple, Text } from 'tea-component'
import MetricCard from '../MetricCard'
import SimpleCollapse from '../SimpleCollapse'
import { getQueryMap, MetricName } from '../types'
import BaseInfoDuck from './PageDuck'
export const SelectAllString = '__all__'
interface Props extends DuckCmpProps<BaseInfoDuck> {
  filterSlot: React.ReactNode
}
export default function Service(props: Props) {
  const { duck, store, dispatch, filterSlot } = props
  const { selector, creators, selectors } = duck
  const {
    composedId: { start, end, step, namespace },
    selectedConfigGroup,
    selectedService,
    data,
  } = selector(store)
  const [activeIds, setActiveIds] = React.useState(['all'])
  const basicQueryParam = { start, end, step }
  const configGroupMap = selectors.configGroupMap(store)
  const serviceMap = selectors.serviceMap(store)
  const [selectAllService, setSelectAllService] = React.useState(true)
  const [selectAllConfigGroup, setSelectAllConfigGroup] = React.useState(true)
  const onChangeFunction = v => {
    setActiveIds(v)
  }
  React.useEffect(() => {
    const partitions = [
      ...selectedConfigGroup.filter(item => item !== SelectAllString),
      ...selectedService.filter(item => item !== SelectAllString),
    ]
    partitions.length ? setActiveIds([partitions[0]]) : setActiveIds(['all'])
  }, [selectedService.length, selectedConfigGroup.length, namespace])
  return (
    <>
      {filterSlot}
      <section style={{ borderBottom: '1px solid #d0d5dd', padding: '20px 0px', marginBottom: '20px' }}>
        <Form layout={'inline'} style={{ width: '100%', display: 'inline-block' }}>
          <FormItem
            label={'服务'}
            suffix={
              data?.serviceList.length && (
                <>
                  <Checkbox
                    value={selectAllService}
                    onChange={v => {
                      dispatch(creators.selectService([]))
                      setSelectAllService(v)
                    }}
                  >
                    汇总
                  </Checkbox>
                </>
              )
            }
          >
            {data?.serviceList.length ? (
              <SelectMultiple
                searchable
                appearance='button'
                options={data?.serviceList || []}
                value={selectedService}
                onChange={v => {
                  dispatch(creators.selectService(v))
                  setSelectAllService(false)
                }}
                size={'m'}
                placeholder={'全部汇总服务'}
                className={'black-placeholder-text'}
              ></SelectMultiple>
            ) : (
              <Text reset>无可选服务</Text>
            )}
          </FormItem>
          <FormItem
            label={'配置分组'}
            suffix={
              data?.configGroupList.length && (
                <>
                  <Checkbox
                    value={selectAllConfigGroup}
                    onChange={v => {
                      dispatch(creators.selectConfigGroup([]))
                      setSelectAllConfigGroup(v)
                    }}
                  >
                    汇总
                  </Checkbox>
                </>
              )
            }
          >
            {data?.configGroupList.length ? (
              <SelectMultiple
                searchable
                appearance='button'
                options={[...(data?.configGroupList || [])]}
                value={selectedConfigGroup}
                onChange={v => {
                  dispatch(creators.selectConfigGroup(v))
                  setSelectAllConfigGroup(false)
                }}
                size={'m'}
                placeholder={'全部汇总配置分组'}
                className={'black-placeholder-text'}
              ></SelectMultiple>
            ) : (
              <Text reset>无配置分组</Text>
            )}
          </FormItem>
        </Form>
      </section>
      {(selectAllService || selectAllConfigGroup) && (
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
      )}
      <>
        {selectedService
          .filter(item => item !== SelectAllString)
          .map(service => {
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
                  query={getQueryMap[MetricName.Instance]({
                    namespace: curService?.namespace,
                    service: curService?.name,
                  })}
                  cardProps={{ bordered: true }}
                  cardBodyProps={{ title: '实例数' }}
                ></MetricCard>
              </SimpleCollapse>
            )
          })}
      </>
      <>
        {selectedConfigGroup
          .filter(item => item !== SelectAllString)
          .map(configGroup => {
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
                  query={getQueryMap[MetricName.ConfigFile]({
                    namespace: curConfigGroup.namespace,
                    configGroup: curConfigGroup?.name,
                  })}
                  cardProps={{ bordered: true }}
                  cardBodyProps={{ title: '配置文件数' }}
                ></MetricCard>
              </SimpleCollapse>
            )
          })}
      </>
    </>
  )
}
