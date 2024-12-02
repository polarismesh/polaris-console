import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import FaultDetectDuck from './PageDuck'
import { Card, Table, Justify, Button, TagSearchBox, Form, FormItem, FormText, LoadingTip, Text } from 'tea-component'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import { expandable } from 'tea-component/lib/table/addons'
import getColumns from './getColumns'
import router from '@src/polaris/common/util/router'
import { FaultDetectProtocol, FaultDetectRule } from './types'

export enum TagSearchType {
  Name = 'name',
  DestNamespace = 'dstNamespace',
  DestService = 'dstService',
  DestMethod = 'dstMethod',
  Description = 'description',
}
export const DefaultBreakerTag = {
  type: 'input',
  key: TagSearchType.Name,
  name: '规则名',
}
function getTagAttributes(props: DuckCmpProps<FaultDetectDuck>) {
  const { duck, store } = props
  const { namespaceList } = duck.selector(store)
  return [
    DefaultBreakerTag,
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

export default purify(function FaultDetectPage(props: DuckCmpProps<FaultDetectDuck>) {
  const { duck, store, dispatch } = props
  const { selector, creators } = duck
  const columns = getColumns(props)
  const { loadData, expandedKeys, ruleInfoMap } = selector(store)
  const handlers = React.useMemo(
    () => ({
      changeTags: tags => dispatch(creators.changeTags(tags)),
      setExpandedKeys: v => dispatch(creators.setExpandedKeys(v)),
    }),
    [],
  )
  const inService = !!loadData?.name

  return (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <Button
              type='primary'
              onClick={() => {
                if (loadData) {
                  router.navigate(`/faultDetect-create?ns=${loadData.namespace}&service=${loadData.name}`)
                  return
                }
                router.navigate(`/faultDetect-create`)
              }}
            >
              新建主动探测规则
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
            expandable({
              // 已经展开的产品
              expandedKeys,
              // 发生展开行为时，回调更新展开键值
              onExpandedKeysChange: keys => handlers.setExpandedKeys(keys),
              render: record => {
                const ruleDetail = ruleInfoMap[record.id] as FaultDetectRule
                return ruleDetail ? (
                  <Form>
                    <FormItem label='描述'>
                      <FormText>{ruleDetail.description || '-'}</FormText>
                    </FormItem>
                    <FormItem label='周期'>
                      <FormText>{ruleDetail.interval || '-'}秒</FormText>
                    </FormItem>
                    <FormItem label='端口'>
                      <FormText>{ruleDetail.port || '-'}</FormText>
                    </FormItem>
                    <FormItem label='协议'>
                      <FormText>{ruleDetail.protocol || '-'}</FormText>
                    </FormItem>
                    {ruleDetail.protocol === FaultDetectProtocol.HTTP && (
                      <>
                        <FormItem label={'HTTP Method'}>
                          <FormText>{ruleDetail.httpConfig?.method}</FormText>
                        </FormItem>
                        <FormItem label={'Url'}>
                          <FormText>{ruleDetail.httpConfig?.url}</FormText>
                        </FormItem>
                        <FormItem label={'Header'}>
                          <FormText>
                            {ruleDetail.httpConfig.headers.map(item => {
                              return (
                                <Text parent={'p'} key={item.key}>
                                  {item.key}:{item.value}
                                </Text>
                              )
                            })}
                          </FormText>
                        </FormItem>
                        <FormItem label={'Body'}>
                          <FormText>{ruleDetail.httpConfig?.body}</FormText>
                        </FormItem>
                      </>
                    )}
                    {ruleDetail.protocol === FaultDetectProtocol.TCP && (
                      <>
                        <FormItem label={'Send'}>
                          <FormText>{ruleDetail.tcpConfig?.send}</FormText>
                        </FormItem>
                        <FormItem label={'Receive'}>
                          <FormText>{ruleDetail.tcpConfig?.receive?.join(',')}</FormText>
                        </FormItem>
                      </>
                    )}
                    {ruleDetail.protocol === FaultDetectProtocol.UDP && (
                      <>
                        <FormItem label={'Send'}>
                          <FormText>{ruleDetail.udpConfig?.send}</FormText>
                        </FormItem>
                        <FormItem label={'Receive'}>
                          <FormText>{ruleDetail.udpConfig?.receive?.join(',')}</FormText>
                        </FormItem>
                      </>
                    )}
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
})
