import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import CircuitBreakerDuck from './PageDuck'
import BasicLayout from '@src/polaris/common/components/BaseLayout'
import {
  Card,
  Table,
  Justify,
  Button,
  TagSearchBox,
  Form,
  FormItem,
  FormText,
  LoadingTip,
  Text,
  TabPanel,
  Tabs,
} from 'tea-component'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import { expandable, filterable } from 'tea-component/lib/table/addons'
import getColumns from './getColumns'
import { replaceTags } from '@src/polaris/configuration/utils'
import router from '@src/polaris/common/util/router'
import {
  BreakerType,
  BreakLevelMap,
  CircuitBreakerRule,
  ErrorConditionMap,
  ErrorConditionType,
  FaultDetectTabs,
  TriggerType,
  TriggerTypeMap,
} from './types'
import { LimitMethodTypeMap } from '../accessLimiting/types'
import FaultDetectPage from './faultDetect/Page'
export enum TagSearchType {
  Name = 'name',
  Enable = 'enable',
  SourceNamespace = 'srcNamespace',
  SourceService = 'srcService',
  DestNamespace = 'dstNamespace',
  DestService = 'dstService',
  DestMethod = 'dstMethod',
  Description = 'description',
}
const EnableOptions = [
  {
    text: '已启用',
    value: 'true',
    name: '已启用',
    key: 'true',
  },
  {
    text: '未启用',
    value: 'false',
    name: '未启用',
    key: 'false',
  },
]
export const DefaultBreakerTag = {
  type: 'input',
  key: TagSearchType.Name,
  name: '规则名',
}
function getTagAttributes(props: DuckCmpProps<CircuitBreakerDuck>) {
  const { duck, store } = props
  const { namespaceList } = duck.selector(store)
  return [
    DefaultBreakerTag,
    {
      type: 'single',
      key: TagSearchType.SourceNamespace,
      name: '源命名空间',
      values: namespaceList,
    },
    {
      type: 'input',
      key: TagSearchType.SourceService,
      name: '源服务',
    },
    {
      type: 'single',
      key: TagSearchType.DestNamespace,
      name: '目标命名空间',
      values: namespaceList,
    },
    {
      type: 'input',
      key: TagSearchType.DestService,
      name: '目标服务',
    },
    {
      type: 'input',
      key: TagSearchType.DestMethod,
      name: '目标方法',
    },
    {
      type: 'input',
      key: TagSearchType.Description,
      name: '描述',
    },
  ]
}

export default purify(function CircuitBreakerPage(props: DuckCmpProps<CircuitBreakerDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators, ducks } = duck
  const columns = getColumns(props)
  const { customFilters, tags, loadData, expandedKeys, ruleInfoMap, type } = selector(store)
  const handlers = React.useMemo(
    () => ({
      changeTags: tags => dispatch(creators.changeTags(tags)),
      setExpandedKeys: v => dispatch(creators.setExpandedKeys(v)),
      setType: v => dispatch(creators.setType(v)),
    }),
    [],
  )
  const inService = !!loadData?.name
  const breakerPanel = (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <Button
              type='primary'
              onClick={() => {
                if (loadData) {
                  router.navigate(
                    `/circuitBreaker-create?type=${type}&ns=${loadData.namespace}&service=${loadData.name}`,
                  )
                  return
                }
                router.navigate(`/circuitBreaker-create?type=${type}`)
              }}
            >
              新建熔断规则
            </Button>
          }
          right={
            <>
              <TagSearchBox
                attributes={getTagAttributes(props) as any}
                style={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  width: '400px',
                }}
                onChange={value => handlers.changeTags(value)}
                tips={'请选择条件进行过滤'}
                hideHelp={true}
              />
              <Button
                type={'icon'}
                icon={'refresh'}
                onClick={() => {
                  dispatch(creators.reload())
                }}
              ></Button>
            </>
          }
        />
      </Table.ActionPanel>
      <Card bordered={inService}>
        <GridPageGrid
          duck={duck}
          dispatch={dispatch}
          store={store}
          columns={columns}
          addons={[
            filterable({
              type: 'single',
              column: 'enable',
              value: customFilters.enable,
              onChange: value => {
                const replacedTags = replaceTags(TagSearchType.Enable, value, tags, EnableOptions, {
                  type: 'single',
                  key: TagSearchType.Enable,
                  name: '状态',
                  values: EnableOptions,
                })
                handlers.changeTags(replacedTags)
              },
              all: {
                value: '',
                text: '全部',
              },
              options: EnableOptions,
            }),
            expandable({
              // 已经展开的产品
              expandedKeys,
              // 发生展开行为时，回调更新展开键值
              onExpandedKeysChange: keys => handlers.setExpandedKeys(keys),
              render: record => {
                const ruleDetail = ruleInfoMap[record.id] as CircuitBreakerRule
                return ruleDetail ? (
                  <Form>
                    <FormItem label='描述'>
                      <FormText>{ruleDetail.description || '-'}</FormText>
                    </FormItem>
                    <FormItem label='错误判断条件'>
                      <FormText>
                        {ruleDetail.errorConditions?.map(item => {
                          return (
                            <>
                              <Text parent={'div'}>
                                {ErrorConditionMap[item.inputType]}
                                {item.inputType === ErrorConditionType.DELAY
                                  ? '超过'
                                  : LimitMethodTypeMap[item.condition?.type]}
                                {item.inputType === ErrorConditionType.DELAY
                                  ? `${item.condition?.value}ms`
                                  : item.condition?.value}
                              </Text>
                            </>
                          )
                        })}
                      </FormText>
                    </FormItem>
                    <FormItem label='描述'>
                      <FormText>
                        {ruleDetail.triggerCondition?.map(item => {
                          return (
                            <>
                              <Text parent={'div'}>
                                {item.triggerType === TriggerType.ERROR_RATE && (
                                  <>
                                    {TriggerTypeMap[item.triggerType].text}
                                    {'>='}
                                    {item.errorPercent}% (统计周期：{item.interval}，最小请求数：{item.minimumRequest})
                                  </>
                                )}
                                {item.triggerType === TriggerType.CONSECUTIVE_ERROR && (
                                  <>
                                    {TriggerTypeMap[item.triggerType].text}
                                    {'>='}
                                    {item.errorCount}个
                                  </>
                                )}
                              </Text>
                            </>
                          )
                        })}
                      </FormText>
                    </FormItem>
                    <FormItem label='熔断粒度'>
                      <FormText>{BreakLevelMap[ruleDetail.level]}</FormText>
                    </FormItem>
                    <FormItem label='熔断时长'>
                      <FormText>{`${ruleDetail.recoverCondition.sleepWindow}秒` || '-'}</FormText>
                    </FormItem>
                    <FormItem label='恢复策略'>
                      <FormText>当满足{ruleDetail.recoverCondition.consecutiveSuccess}个连续成功请求后恢复</FormText>
                    </FormItem>
                    <FormItem label='主动探测'>
                      <FormText>{ruleDetail.faultDetectConfig.enable ? '开启' : '关闭' || '-'}</FormText>
                    </FormItem>
                    <FormItem label='自定义响应'>
                      <FormText>
                        {ruleDetail.fallbackConfig.enable ? (
                          <Table
                            records={[{ ...ruleDetail.fallbackConfig.response }]}
                            columns={[
                              {
                                key: 'code',
                                header: '返回码',
                                width: 100,
                              },
                              {
                                key: 'headers',
                                header: '消息头',
                                render: x => {
                                  return (
                                    <>
                                      {x.headers.map(item => {
                                        return (
                                          <Text parent={'p'} key={item.key}>
                                            {item.key}:{item.value}
                                          </Text>
                                        )
                                      })}
                                    </>
                                  )
                                },
                              },
                              {
                                key: 'body',
                                header: '消息体',
                              },
                            ]}
                          ></Table>
                        ) : (
                          '未开启'
                        )}
                      </FormText>
                    </FormItem>
                  </Form>
                ) : (
                  <LoadingTip />
                )
              },
            }),
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </>
  )
  const module = (
    <Tabs
      tabs={FaultDetectTabs}
      onActive={v => handlers.setType(v.id)}
      activeId={type}
      ceiling={inService ? false : true}
    >
      <TabPanel id={BreakerType.Service}>{breakerPanel}</TabPanel>
      <TabPanel id={BreakerType.Interface}>{breakerPanel}</TabPanel>
      <TabPanel id={BreakerType.FaultDetect}>
        <FaultDetectPage duck={ducks.faultDetect} store={store} dispatch={dispatch}></FaultDetectPage>
      </TabPanel>
    </Tabs>
  )
  return (
    <BasicLayout
      title={'熔断降级'}
      store={store}
      selectors={duck.selectors}
      header={<></>}
      type={inService ? 'fregment' : 'page'}
    >
      {inService ? (
        <Card bordered>
          <Card.Body>{module}</Card.Body>
        </Card>
      ) : (
        module
      )}
    </BasicLayout>
  )
})
