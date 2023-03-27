import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import {
  Card,
  Col,
  Form,
  FormItem,
  Justify,
  List,
  ListItem,
  LoadingTip,
  Row,
  SearchBox,
  Select,
  Table,
  Text,
} from 'tea-component'
import MetricCard from '../../registryMonitor/MetricCard'
import MetricTagCard from '../MetricTagCard'
import { compressNumber, getQueryMap, getTableQueryMap, MetricName, roundToN } from '../types'
import BaseInfoDuck from './PageDuck'
import { autotip, pageable, sortable } from 'tea-component/lib/table/addons'
import { FilterType } from '../Page'
import { HEALTH_STATUS_MAP } from '@src/polaris/service/detail/instance/types'
import { Link } from 'react-router-dom'

interface Props extends DuckCmpProps<BaseInfoDuck> {
  filterMap: Record<string, React.ReactNode>
}

export default function Overview(props: Props) {
  const { duck, store, filterMap, dispatch } = props
  const { selector, creators } = duck
  const {
    composedId: { start, end, step, namespace },
    serviceList,
    service,
    interfaceName,
    instanceList,
    interfaceInfo,
    sort,
    callerList,
  } = selector(store)
  const basicQueryParam = { start, end, step }
  const { category_interfaces, category_service } = interfaceInfo
  const [instanceKeyword, setInstanceKeyword] = React.useState('')
  const [callerKeyword, setCallerKeyword] = React.useState('')
  const [callerSort, setCallerSort] = React.useState([])
  const processedInstanceList = instanceList.filter(item => item.id.indexOf(instanceKeyword) > -1)
  const sortedInstanceList = sort.length
    ? processedInstanceList.sort((a, b) => {
        const sortby = sort?.[0].by
        const order = sort?.[0].order
        return order === 'desc' ? Number(a[sortby]) - Number(b[sortby]) : Number(b[sortby]) - Number(a[sortby])
      })
    : processedInstanceList
  const processedCallerList = callerList.filter(item => item.host.indexOf(callerKeyword) > -1)
  const sortedCallerList = callerSort.length
    ? processedCallerList.sort((a, b) => {
        const sortby = callerSort?.[0].by
        const order = callerSort?.[0].order
        return order === 'desc' ? Number(a[sortby]) - Number(b[sortby]) : Number(b[sortby]) - Number(a[sortby])
      })
    : processedCallerList

  return (
    <>
      <section style={{ borderBottom: '1px solid #d0d5dd', padding: '40px 0px', marginBottom: '20px' }}>
        <Form layout={'inline'} style={{ display: 'inline-block' }}>
          {filterMap[FilterType.Namespace]}
          <FormItem label={'服务名'}>
            <Select
              searchable
              appearance='button'
              options={serviceList.map(item => ({ ...item, text: item.name, value: item.name }))}
              value={service}
              onChange={v => dispatch(creators.setService(v))}
            ></Select>
          </FormItem>
          {/* <FormItem label={'服务实例'}>
            <Select
              searchable
              appearance='button'
              options={instanceList.map(item => ({ ...item, text: item.id, value: item.id }))}
              value={instance}
              onChange={v => dispatch(creators.setInstance(v))}
            ></Select>
          </FormItem> */}
          {filterMap[FilterType.TimeRange]}
          {filterMap[FilterType.Step]}
        </Form>
      </section>
      <Row showSplitLine>
        <Col span={8}>
          <SearchBox></SearchBox>
          <section style={{ border: '1px solid #d0d5dd' }}>
            <List
              type={'option'}
              split={'divide'}
              style={{ maxHeight: '1700px', minHeight: '1000px', overflow: 'scroll' }}
            >
              <ListItem>
                <Justify
                  left={
                    <>
                      <Text reset>接口名称</Text>
                    </>
                  }
                  right={
                    <>
                      <Text reset>成功请求数/流控请求数/异常请求数/平均时延</Text>
                    </>
                  }
                ></Justify>
              </ListItem>

              <ListItem
                key={category_service?.interface_name}
                onClick={() => {
                  dispatch(creators.setInterface(''))
                }}
                selected={interfaceName === ''}
              >
                {!category_service && <>{service ? <LoadingTip /> : '暂无数据'}</>}
                {category_service && (
                  <Justify
                    left={
                      <>
                        <Text reset overflow style={{ width: '200px' }}>
                          所有接口
                        </Text>
                      </>
                    }
                    right={
                      <>
                        <Text reset>
                          {compressNumber(category_service.success_request) ?? '-'}/
                          {compressNumber(category_service.flow_control_request) ?? '-'}/
                          {compressNumber(category_service.abnormal_request) ?? '-'}/
                          {roundToN(category_service?.avg_timeout, 2)}ms
                        </Text>
                      </>
                    }
                  ></Justify>
                )}
              </ListItem>
              {category_interfaces.map(item => {
                const rateString = `${compressNumber(item.success_request) ?? '-'}/${compressNumber(
                  item.flow_control_request,
                ) ?? '-'}/${compressNumber(item.abnormal_request) ?? '-'}/${roundToN(item.avg_timeout, 2)}ms`
                return (
                  <ListItem
                    key={item.interface_name}
                    onClick={() => {
                      dispatch(creators.setInterface(item.interface_name))
                    }}
                    selected={interfaceName === item.interface_name}
                    tooltip={
                      <>
                        <Text parent={'p'}>{item.interface_name}</Text>
                        <Text parent={'p'}>{rateString}</Text>
                      </>
                    }
                  >
                    <Justify
                      left={
                        <>
                          <Text reset overflow style={{ width: '150px' }}>
                            {item.interface_name}
                          </Text>
                        </>
                      }
                      right={
                        <>
                          <Text reset overflow style={{ width: '150px' }}>
                            {rateString}
                          </Text>
                        </>
                      }
                    ></Justify>
                  </ListItem>
                )
              })}
            </List>
          </section>
        </Col>
        <Col span={16}>
          {service ? (
            <>
              <MetricCard
                {...basicQueryParam}
                query={getQueryMap[MetricName.Request]({
                  calleeNamespace: namespace,
                  calleeService: service,
                  calleeMethod: interfaceName,
                })}
                cardProps={{ bordered: true }}
                cardBodyProps={{ title: '服务请求数' }}
              ></MetricCard>
              <MetricCard
                {...basicQueryParam}
                query={getQueryMap[MetricName.Timeout]({
                  ...basicQueryParam,
                  calleeNamespace: namespace,
                  calleeService: service,
                  calleeMethod: interfaceName,
                })}
                cardProps={{ bordered: true }}
                cardBodyProps={{ title: '服务请求时延' }}
              ></MetricCard>
              <MetricTagCard
                {...basicQueryParam}
                query={getTableQueryMap[MetricName.RetCodeDistribute]({
                  calleeNamespace: namespace,
                  calleeService: service,
                  calleeMethod: interfaceName,
                })}
                cardProps={{ bordered: true }}
                cardBodyProps={{ title: '返回码统计' }}
              ></MetricTagCard>
              <Card bordered style={{ marginTop: '20px' }}>
                <Card.Body
                  title={'服务实例监控'}
                  operation={
                    <SearchBox
                      value={instanceKeyword}
                      onSearch={v => {
                        setInstanceKeyword(v)
                      }}
                      placeholder={'请输入实例IP'}
                    ></SearchBox>
                  }
                >
                  <Table
                    bordered
                    records={sortedInstanceList || []}
                    columns={[
                      {
                        key: 'id',
                        header: '实例IP',
                      },
                      {
                        key: 'port',
                        header: '端口',
                      },
                      {
                        key: 'healthy',
                        header: '健康状态',
                        render: x => (
                          <Text theme={HEALTH_STATUS_MAP[x.status]?.theme}>{HEALTH_STATUS_MAP[x.status]?.text}</Text>
                        ),
                      },
                      {
                        key: 'total_request',
                        header: '总请求数',
                      },
                      {
                        key: 'success_rate',
                        header: '成功率',
                        render: x => {
                          return `${roundToN(Number(x.success_rate) * 100, 2)}%`
                        },
                      },
                      {
                        key: 'failed_request',
                        header: '失败请求数',
                        render: x => {
                          return x.failed_request
                        },
                      },
                      {
                        key: 'limited-request',
                        header: '限流请求数',
                        render: x => {
                          return x.limited_request
                        },
                      },
                      {
                        key: 'circuitbreaker_request',
                        header: '熔断请求数',
                        render: x => {
                          return x.circuitbreaker_request
                        },
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
                        columns: [
                          'success_rate',
                          'total_request',
                          'failed_request',
                          'circuitbreaker_request',
                          'limited_request',
                          'avg_timeout',
                        ],
                        value: sort,
                        onChange: value => dispatch(creators.setSort(value.length ? value : [])),
                      }),
                      pageable({
                        pageSize: 5,
                      }),
                    ]}
                  ></Table>
                </Card.Body>
              </Card>
              <Card bordered style={{ marginTop: '20px' }}>
                <Card.Body
                  title={'调用者监控'}
                  subtitle={`以下节点调用了${service}服务`}
                  operation={
                    <SearchBox
                      value={callerKeyword}
                      onSearch={v => {
                        setCallerKeyword(v)
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
                        key: 'host',
                        header: '调用者IP',
                      },
                      {
                        key: 'service',
                        header: '调用者服务名',
                        render: x => {
                          return <Link to={`/service?name=${x.service}&namespace=${x.namespace}`}></Link>
                        },
                      },
                      {
                        key: 'namespace',
                        header: '命名空间',
                      },
                      {
                        key: 'total_request',
                        header: '总请求数',
                      },
                      {
                        key: 'success_rate',
                        header: '成功率',
                        render: x => {
                          return `${roundToN(Number(x.success_rate) * 100, 2)}%`
                        },
                      },
                      {
                        key: 'failed_request',
                        header: '失败请求数',
                        render: x => {
                          return x.failed_request
                        },
                      },
                      {
                        key: 'limited-request',
                        header: '限流请求数',
                        render: x => {
                          return x.limited_request
                        },
                      },
                      {
                        key: 'circuitbreaker_request',
                        header: '熔断请求数',
                        render: x => {
                          return x.circuitbreaker_request
                        },
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
                        columns: [
                          'success_rate',
                          'total_request',
                          'failed_request',
                          'circuitbreaker_request',
                          'limited_request',
                          'avg_timeout',
                        ],
                        value: callerSort,
                        onChange: value => setCallerSort(value.length ? value : []),
                      }),
                      pageable({
                        pageSize: 5,
                      }),
                    ]}
                  ></Table>
                </Card.Body>
              </Card>
            </>
          ) : (
            <>{serviceList?.length ? <LoadingTip /> : '暂无数据'}</>
          )}
        </Col>
      </Row>
    </>
  )
}
