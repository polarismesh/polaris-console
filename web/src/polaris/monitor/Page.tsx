import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import {
  Card,
  Col,
  Row,
  Table,
  Justify,
  Button,
  Text,
  Layout,
  FormItem,
  Form,
  SelectMultiple,
  InputAdornment,
  Copy,
  StatusTip,
  InputNumber,
  FormText,
  Tabs,
  TabPanel,
} from 'tea-component'
import MonitorDuck from './PageDuck'
import { BasicLine } from 'tea-chart'
import { MetricNameMap, LabelKeyMap, OptionAllKey } from './types'
import moment from 'moment'
import insertCSS from '../common/helpers/insertCSS'
import TimeSelect from '../common/components/TimeSelect'
import FlowMonitorDuck from './FlowMonitorDuck'
const { Body, Content } = Layout
insertCSS(
  `monitor`,
  `
  .monitor-content > .tea-layout__content-body-inner{
    max-width: 100%;
  }
  .modify-form-control > .tea-form__controls--text{
    padding-top: 0px;
  }
  .monitor-select-style .tea-text-weak{
    color: black !important;
  }
`,
)
export const TimePickerTab = () => [
  {
    text: '近1小时',
    date: [moment().subtract(1, 'h'), moment()],
  },
  {
    text: '近1天',
    date: [moment().subtract(1, 'd'), moment()],
  },
  {
    text: '近1周',
    date: [moment().subtract(1, 'w'), moment()],
  },
]

export function MonitorPanel(props: DuckCmpProps<MonitorDuck>) {
  const { duck, store, dispatch } = props
  const { selectors, creators, ducks, selector } = duck
  const { dynamicMonitorFetcher, dynamicLabelFetcher } = ducks
  const metricQuerySets = selectors.metricQuerySets(store)
  const filterConfig = selectors.filterConfig(store)
  const { step } = selector(store)
  const handlers = React.useMemo(
    () => ({
      create: () => dispatch(creators.createGraph()),
      modify: (payload) => dispatch(creators.modifyGraph(payload)),
      remove: (payload) => dispatch(creators.removeGraph(payload)),
      saveConfig: () => dispatch(creators.saveConfig()),
      search: () => dispatch(creators.search()),
      changeFilterConfig: (payload) => dispatch(creators.changeFilterConfig(payload)),
      fetchLabels: (payload) => dispatch(creators.fetchLabels(payload)),
      getFilterConfig: () => dispatch(creators.getFilterConfig()),
    }),
    [],
  )
  const timePicker = React.useRef(null)
  const flush = () => {
    timePicker?.current?.flush()
  }
  return (
    <Content.Body className={'monitor-content'}>
      <Table.ActionPanel>
        <Justify
          left={
            <Form layout='inline'>
              <FormItem label='指标名'>
                <SelectMultiple
                  allOption={{
                    text: '全部',
                    value: OptionAllKey,
                  }}
                  searchable
                  appearance={'button'}
                  options={duck.metricNames.map((key) => ({
                    text: MetricNameMap[key].text,
                    value: key,
                  }))}
                  value={filterConfig.metricNames || []}
                  onChange={(value) => {
                    handlers.changeFilterConfig({
                      filterConfig: {
                        ...filterConfig,
                        metricNames: value,
                      },
                      changedItem: 'metricNames',
                    })
                  }}
                  size='m'
                />
              </FormItem>
              <FormItem label={'时间选择'} className={'modify-form-control'}>
                <FormText>
                  <TimeSelect
                    tabs={TimePickerTab()}
                    style={{ display: 'inline-block' }}
                    changeDate={({ from, to }) => {
                      handlers.changeFilterConfig({
                        filterConfig: {
                          ...filterConfig,
                          filterTime: {
                            start: moment(from).unix(),
                            end: moment(to).unix(),
                          },
                        },
                        changedItem: 'filterTime',
                      })
                    }}
                    from={
                      filterConfig.filterTime?.start
                        ? new Date(filterConfig.filterTime?.start * 1000).toString()
                        : undefined
                    }
                    to={
                      filterConfig.filterTime?.end
                        ? new Date(filterConfig.filterTime?.end * 1000).toString()
                        : undefined
                    }
                    range={{
                      min: moment().subtract(29, 'y'),
                      max: moment(),
                      maxLength: 3,
                    }}
                    ref={timePicker}
                  />
                  <Button type={'icon'} icon={'refresh'} onClick={flush}></Button>
                  &nbsp; 步长 &nbsp;
                  <InputNumber
                    hideButton
                    value={step}
                    onChange={(v) => {
                      dispatch(creators.setStep(v))
                    }}
                  ></InputNumber>
                  &nbsp;秒
                </FormText>
              </FormItem>
            </Form>
          }
        />
        {duck.monitorLabels.filter((labelKey) => labelKey.indexOf('caller') !== -1).length > 0 && (
          <Text theme={'label'} parent={'div'} style={{ marginBottom: '10px' }}>
            主调方
          </Text>
        )}
        <Justify
          left={
            <Form layout='inline'>
              {duck.monitorLabels
                .filter((labelKey) => labelKey.indexOf('caller') !== -1)
                .map((labelKey) => {
                  const fetcher = dynamicLabelFetcher.getDuck(labelKey)
                  if (!fetcher) return <noscript />
                  const { data: options, loading } = fetcher.selector(store)
                  return (
                    <FormItem label={LabelKeyMap[labelKey].text.replace('主调', '')} key={labelKey}>
                      {
                        <InputAdornment
                          after={
                            filterConfig.filterLabels[labelKey]?.length > 0 ? (
                              <Button
                                type={'link'}
                                onClick={() => {
                                  handlers.changeFilterConfig({
                                    filterConfig: {
                                      ...filterConfig,
                                      filterLabels: {
                                        ...filterConfig.filterLabels,
                                        [labelKey]: [],
                                      },
                                    },
                                    changedItem: `filterLabels:${labelKey}`,
                                  })
                                }}
                              >
                                汇总
                              </Button>
                            ) : (
                              <noscript />
                            )
                          }
                        >
                          <SelectMultiple
                            placeholder={'汇总'}
                            searchable
                            allOption={{
                              text: '全部',
                              value: OptionAllKey,
                            }}
                            className={'monitor-select-style'}
                            appearance={'button'}
                            options={options || []}
                            value={filterConfig.filterLabels?.[labelKey] || []}
                            onChange={(value) => {
                              handlers.changeFilterConfig({
                                filterConfig: {
                                  ...filterConfig,
                                  filterLabels: {
                                    ...filterConfig.filterLabels,
                                    [labelKey]: value,
                                  },
                                },
                                changedItem: `filterLabels:${labelKey}`,
                              })
                            }}
                            size='m'
                            tips={loading && <StatusTip status={'loading'} />}
                            onOpen={() => handlers.fetchLabels(labelKey)}
                          />
                        </InputAdornment>
                      }
                    </FormItem>
                  )
                })}
            </Form>
          }
        />
        {duck.monitorLabels.filter((labelKey) => labelKey.indexOf('callee') !== -1).length > 0 &&
          duck.type !== 'ratelimit' && (
            <Text theme={'label'} parent={'div'} style={{ marginBottom: '10px' }}>
              被调方
            </Text>
          )}
        <Justify
          left={
            <Form layout='inline'>
              {duck.monitorLabels
                .filter((labelKey) => labelKey.indexOf('callee') !== -1)
                .map((labelKey) => {
                  const fetcher = dynamicLabelFetcher.getDuck(labelKey)
                  if (!fetcher) return <noscript />
                  const { data: options, loading } = fetcher.selector(store)
                  return (
                    <FormItem label={LabelKeyMap[labelKey].text.replace('被调', '')} key={labelKey}>
                      {
                        <InputAdornment
                          after={
                            filterConfig.filterLabels[labelKey]?.length > 0 ? (
                              <Button
                                type={'link'}
                                onClick={() => {
                                  handlers.changeFilterConfig({
                                    filterConfig: {
                                      ...filterConfig,
                                      filterLabels: {
                                        ...filterConfig.filterLabels,
                                        [labelKey]: [],
                                      },
                                    },
                                    changedItem: `filterLabels:${labelKey}`,
                                  })
                                }}
                              >
                                汇总
                              </Button>
                            ) : (
                              <noscript />
                            )
                          }
                          appearance='pure'
                        >
                          <SelectMultiple
                            placeholder={'汇总'}
                            searchable
                            allOption={{
                              text: '全部',
                              value: OptionAllKey,
                            }}
                            className={'monitor-select-style'}
                            appearance={'button'}
                            options={options || []}
                            value={filterConfig.filterLabels?.[labelKey] || []}
                            onChange={(value) => {
                              handlers.changeFilterConfig({
                                filterConfig: {
                                  ...filterConfig,
                                  filterLabels: {
                                    ...filterConfig.filterLabels,
                                    [labelKey]: value,
                                  },
                                },
                                changedItem: `filterLabels:${labelKey}`,
                              })
                            }}
                            size='m'
                            tips={loading && <StatusTip status={'loading'} />}
                            onOpen={() => handlers.fetchLabels(labelKey)}
                          />
                        </InputAdornment>
                      }
                    </FormItem>
                  )
                })}
            </Form>
          }
        />
        <Justify
          left={
            <Button
              type={'primary'}
              onClick={handlers.search}
              onKeyPress={(event) => {
                console.log(event)
              }}
            >
              查询
            </Button>
          }
        />
      </Table.ActionPanel>
      <Card style={{ width: '100%' }}>
        <Card.Body
          title={metricQuerySets.length === 0 ? '暂无图表数据' : '监控曲线'}
          operation={
            metricQuerySets.length === 0 ? (
              <noscript />
            ) : (
              <>
                <Copy
                  text={`${window.location.protocol}//${window.location.host}${
                    duck.baseUrl
                  }?filterConfig=${encodeURIComponent(JSON.stringify(filterConfig))}`}
                >
                  <Button type={'link'}>复制分享链接</Button>
                </Copy>
                <Button type={'link'} onClick={() => handlers.saveConfig()}>
                  保存当前配置
                </Button>
                {window.localStorage.getItem(`${duck.type}MonitorConfigLocalStorageKey`) && (
                  <Button type={'link'} onClick={() => handlers.getFilterConfig()}>
                    载入保存配置
                  </Button>
                )}
              </>
            )
          }
        >
          <Row>
            <>
              {metricQuerySets.map((querySet, index) => {
                const { query, metricName, fetcherId, start, end, monitorFilters } = querySet
                const fetcher = dynamicMonitorFetcher.getDuck(`${encodeURIComponent(query)}-${fetcherId}`)
                if (!fetcher) return <div style={{ height: '300px' }}></div>
                const chartData = fetcher.selectors.data(store)
                const startString = moment(start * 1000).format('YYYY-MM-DD HH:mm:ss')
                const endString = moment(end * 1000).format('YYYY-MM-DD HH:mm:ss')
                const labelsTitle =
                  monitorFilters?.length > 0
                    ? monitorFilters
                        .map((filter) => {
                          return `${filter.labelValue}_`
                        })
                        .join('')
                    : ''
                return (
                  <Col span={12} key={`${encodeURIComponent(query)}-${fetcherId}`}>
                    <Card bordered>
                      <Card.Body
                        title={
                          <>
                            <Text theme={'strong'} parent={'p'}>
                              {`${labelsTitle}${MetricNameMap[metricName].text}`}
                            </Text>
                          </>
                        }
                        operation={
                          <>
                            {/* <Button
                          type={"link"}
                          onClick={() => handlers.modify(querySet)}
                        >
                          编辑
                        </Button>
                        <Button
                          type={"link"}
                          onClick={() => handlers.remove(index)}
                        >
                          删除
                        </Button> */}
                          </>
                        }
                      >
                        <>
                          <Text parent={'p'} theme={'weak'}>
                            筛选条件：
                            {monitorFilters?.length > 0
                              ? monitorFilters.map((filter) => {
                                  return (
                                    <Text key={filter.labelKey}>
                                      {`${LabelKeyMap[filter.labelKey].text}
                                  ：${filter.labelValue} ；`}
                                    </Text>
                                  )
                                })
                              : '无'}
                          </Text>
                          <Text parent={'p'} theme={'weak'}>
                            {`${startString} - ${endString}`}
                          </Text>
                        </>
                        <BasicLine height={300} position={'time*value'} dataSource={chartData}></BasicLine>
                      </Card.Body>
                    </Card>
                  </Col>
                )
              })}
            </>
          </Row>
        </Card.Body>
      </Card>
    </Content.Body>
  )
}

export default function Monitor(props: DuckCmpProps<FlowMonitorDuck>) {
  const { duck } = props
  return (
    <>
      <Layout>
        <Body>
          <Content>
            <Content.Header title={'流量监控'}></Content.Header>
            <Content.Body className={'monitor-content'}>
              <Tabs
                tabs={[
                  { id: 'routes', label: '路由监控' },
                  { id: 'circuit', label: '熔断监控' },
                  { id: 'ratelimit', label: '限流监控' },
                ]}
                ceiling
              >
                <TabPanel id={'routes'}>
                  <MonitorPanel {...props} duck={duck.ducks.route} />
                </TabPanel>
                <TabPanel id={'circuit'}>
                  <MonitorPanel {...props} duck={duck.ducks.circuit} />
                </TabPanel>
                <TabPanel id={'ratelimit'}>
                  <MonitorPanel {...props} duck={duck.ducks.ratelimit} />
                </TabPanel>
              </Tabs>
            </Content.Body>
          </Content>
        </Body>
      </Layout>
    </>
  )
}
