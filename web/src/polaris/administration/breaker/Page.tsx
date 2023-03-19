import { t } from 'i18next'
import { Trans, useTranslation } from 'react-i18next'
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
    text: t('已启用'),
    value: 'true',
    name: t('已启用'),
    key: 'true',
  },
  {
    text: t('未启用'),
    value: 'false',
    name: t('未启用'),
    key: 'false',
  },
]
export const DefaultBreakerTag = {
  type: 'input',
  key: TagSearchType.Name,
  name: t('规则名'),
}
function getTagAttributes(props: DuckCmpProps<CircuitBreakerDuck>) {
  const { t } = useTranslation()

  const { duck, store } = props
  const { namespaceList } = duck.selector(store)
  return [
    DefaultBreakerTag,
    {
      type: 'single',
      key: TagSearchType.SourceNamespace,
      name: t('源命名空间'),
      values: namespaceList,
    },
    {
      type: 'input',
      key: TagSearchType.SourceService,
      name: t('源服务'),
    },
    {
      type: 'single',
      key: TagSearchType.DestNamespace,
      name: t('目标命名空间'),
      values: namespaceList,
    },
    {
      type: 'input',
      key: TagSearchType.DestService,
      name: t('目标服务'),
    },
    {
      type: 'input',
      key: TagSearchType.DestMethod,
      name: t('目标方法'),
    },
    {
      type: 'input',
      key: TagSearchType.Description,
      name: t('描述'),
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
              <Trans>新建熔断规则</Trans>
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
                tips={t('请选择条件进行过滤')}
                hideHelp={true}
              />
            </>
          }
        />
      </Table.ActionPanel>
      <Card>
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
                  name: t('状态'),
                  values: EnableOptions,
                })
                handlers.changeTags(replacedTags)
              },
              all: {
                value: '',
                text: t('全部'),
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
                    <FormItem label={t('描述')}>
                      <FormText>{ruleDetail.description || '-'}</FormText>
                    </FormItem>
                    <FormItem label={t('错误判断条件')}>
                      <FormText>
                        {ruleDetail.errorConditions?.map(item => {
                          return (
                            <>
                              <Text parent={'div'}>
                                {ErrorConditionMap[item.inputType]}
                                {item.inputType === ErrorConditionType.DELAY
                                  ? t('超过')
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
                    <FormItem label={t('描述')}>
                      <FormText>
                        {ruleDetail.triggerCondition?.map(item => {
                          return (
                            <>
                              <Text parent={'div'}>
                                {item.triggerType === TriggerType.ERROR_RATE && (
                                  <>
                                    {TriggerTypeMap[item.triggerType].text}
                                    {'>='}
                                    {item.errorPercent}
                                    <Trans>% (统计周期：</Trans>
                                    {item.interval}
                                    <Trans>，最小请求数：</Trans>
                                    {item.minimumRequest})
                                  </>
                                )}
                                {item.triggerType === TriggerType.CONSECUTIVE_ERROR && (
                                  <>
                                    {TriggerTypeMap[item.triggerType].text}
                                    {'>='}
                                    {item.errorCount}
                                    <Trans>个</Trans>
                                  </>
                                )}
                              </Text>
                            </>
                          )
                        })}
                      </FormText>
                    </FormItem>
                    <FormItem label={t('熔断粒度')}>
                      <FormText>{BreakLevelMap[ruleDetail.level]}</FormText>
                    </FormItem>
                    <FormItem label={t('熔断时长')}>
                      <FormText>
                        {t('{{attr0}}秒', {
                          attr0: ruleDetail.recoverCondition.sleepWindow,
                        }) || '-'}
                      </FormText>
                    </FormItem>
                    <FormItem label={t('恢复策略')}>
                      <FormText>
                        <Trans>当满足</Trans>
                        {ruleDetail.recoverCondition.consecutiveSuccess}
                        <Trans>个连续成功请求后恢复</Trans>
                      </FormText>
                    </FormItem>
                    <FormItem label={t('主动探测')}>
                      <FormText>{ruleDetail.faultDetectConfig.enable ? t('开启') : t('关闭') || '-'}</FormText>
                    </FormItem>
                    <FormItem label={t('自定义响应')}>
                      <FormText>
                        {ruleDetail.fallbackConfig.enable ? (
                          <Table
                            records={[{ ...ruleDetail.fallbackConfig.response }]}
                            columns={[
                              {
                                key: 'code',
                                header: t('返回码'),
                                width: 100,
                              },
                              {
                                key: 'headers',
                                header: t('消息头'),
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
                                header: t('消息体'),
                              },
                            ]}
                          ></Table>
                        ) : (
                          t('未开启')
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
  return (
    <BasicLayout
      title={t('熔断降级')}
      store={store}
      selectors={duck.selectors}
      header={<></>}
      type={loadData?.name ? 'fregment' : 'page'}
    >
      <Tabs tabs={FaultDetectTabs} onActive={v => handlers.setType(v.id)} activeId={type} ceiling>
        <TabPanel id={BreakerType.Service}>{breakerPanel}</TabPanel>
        <TabPanel id={BreakerType.Interface}>{breakerPanel}</TabPanel>
        <TabPanel id={BreakerType.FaultDetect}>
          <FaultDetectPage duck={ducks.faultDetect} store={store} dispatch={dispatch}></FaultDetectPage>
        </TabPanel>
      </Tabs>
    </BasicLayout>
  )
})
