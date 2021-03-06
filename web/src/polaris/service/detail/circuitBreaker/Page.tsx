import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ServicePageDuck from './PageDuck'
import { Button, Card, Justify, Table, Segment, Form, FormText, FormItem, Text, H3, Drawer } from 'tea-component'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import getColumns from './getColumns'
import { expandable } from 'tea-component/lib/table/addons'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import csvColumns from './csvColumns'
import {
  RULE_TYPE_OPTIONS,
  PolicyMap,
  PolicyName,
  OUTLIER_DETECT_MAP,
  RuleType,
  BREAK_RESOURCE_TYPE_MAP,
  OutlierDetectWhen,
  BREAK_RESOURCE_TYPE,
} from './types'
import { isReadOnly } from '../../utils'
import { EDIT_TYPE_OPTION, EditType } from '../route/types'
import Create from './operations/Create'
insertCSS(
  'service-detail-instance',
  `
.justify-search{
  margin-right:20px
}
.justify-button{
  vertical-align: bottom
}
`,
)

export default function ServiceInstancePage(props: DuckCmpProps<ServicePageDuck>) {
  const { duck, store, dispatch } = props
  const { creators, selector, ducks } = duck
  const handlers = React.useMemo(
    () => ({
      reload: () => dispatch(creators.reload()),
      submit: () => dispatch(creators.submit()),
      reset: () => dispatch(creators.reset()),
      export: () => dispatch(creators.export(csvColumns, 'service-list')),
      search: () => dispatch(creators.search('')),
      drawerSubmit: () => dispatch(creators.drawerSubmit()),
      create: payload => dispatch(creators.create(payload)),
      remove: payload => dispatch(creators.remove(payload)),
      setExpandedKeys: payload => dispatch(creators.setExpandedKeys(payload)),
      setRuleType: payload => dispatch(creators.setRuleType(payload)),
      setDrawerStatus: payload => dispatch(creators.setDrawerStatus(payload)),
    }),
    [],
  )
  const {
    expandedKeys,
    ruleType,
    drawerStatus,
    data: { namespace, editable },
    edited,
  } = selector(store)
  const columns = React.useMemo(() => getColumns(props), [ruleType])
  let createDuck
  if (drawerStatus.visible) {
    createDuck = ducks.dynamicCreateDuck.getDuck(drawerStatus.createId)
  }
  return (
    <>
      <Table.ActionPanel>
        <Form layout='inline'>
          <FormItem label={'????????????'}>
            <Segment options={EDIT_TYPE_OPTION} value={EditType.Table}></Segment>
          </FormItem>
        </Form>
        <Form layout='inline'>
          <FormItem label={'????????????'}>
            <Segment options={RULE_TYPE_OPTIONS} value={ruleType} onChange={handlers.setRuleType}></Segment>
          </FormItem>
        </Form>
        <Justify
          left={
            <>
              <Button
                type={'primary'}
                onClick={() => {
                  handlers.create(0)
                }}
                disabled={isReadOnly(namespace) || !editable}
                tooltip={isReadOnly(namespace) ? '???????????????????????????' : !editable ? '????????????' : ''}
                style={{ marginTop: '20px' }}
              >
                ??????
              </Button>
              <Button
                type={'primary'}
                onClick={() => handlers.submit()}
                disabled={isReadOnly(namespace) || drawerStatus.visible || !edited || !editable}
                tooltip={
                  isReadOnly(namespace)
                    ? '???????????????????????????'
                    : !edited
                    ? '?????????'
                    : !editable
                    ? '????????????'
                    : '???????????????????????????'
                }
                style={{ marginTop: '20px' }}
              >
                ??????
              </Button>
              {edited && (
                <Button onClick={() => handlers.reset()} style={{ marginTop: '20px' }}>
                  ??????
                </Button>
              )}
            </>
          }
          right={<Button type={'icon'} icon={'refresh'} onClick={handlers.reload}></Button>}
        />
      </Table.ActionPanel>
      <Card>
        <Card.Header>
          <H3 style={{ padding: '10px', color: 'black' }}>
            {ruleType === RuleType.Inbound
              ? '????????????????????????????????????????????????????????????'
              : '????????????????????????????????????????????????????????????'}
          </H3>
        </Card.Header>
        <GridPageGrid
          duck={duck}
          dispatch={dispatch}
          store={store}
          columns={columns}
          addons={[
            expandable({
              // ?????????????????????
              expandedKeys,
              // ????????????????????????????????????????????????
              onExpandedKeysChange: keys => handlers.setExpandedKeys(keys),
              render: record => {
                return (
                  <>
                    <Form style={{ marginBottom: '15px' }}>
                      <FormItem label={'????????????????????????????????????????????????'}></FormItem>
                    </Form>
                    <Form key={record.sources.map(source => source.namespace).join(',')}>
                      {record.destinations.map(destination => {
                        return (
                          <>
                            <FormItem label='????????????'>
                              <FormText>
                                {Object.keys(destination.policy).map((key, index) => {
                                  if (!destination.policy[key]) return
                                  if (key === PolicyName.ErrorRate) {
                                    return (
                                      <Text parent='p' key={index}>{`?????????????????????${destination.policy[key]
                                        ?.requestVolumeThreshold || 10}?????????${PolicyMap[key]?.text ??
                                        '-'}??????${destination.policy[key]?.errorRateToOpen ?? '-'}%?????????`}</Text>
                                    )
                                  }
                                  if (key === PolicyName.SlowRate) {
                                    return (
                                      <Text parent='p' key={index}>{`?????????${destination.policy[key]?.maxRt ??
                                        '-'}??????????????????????????????${PolicyMap[key]?.text ?? '-'}??????${destination.policy[
                                        key
                                      ]?.slowRateToOpen ?? '-'}%?????????`}</Text>
                                    )
                                  }
                                  if (key === PolicyName.ConsecutiveError) {
                                    return (
                                      <Text parent='p' key={index}>{`???????????????????????????${destination.policy[key]
                                        ?.consecutiveErrorToOpen ?? '-'}????????????`}</Text>
                                    )
                                  }
                                })}
                              </FormText>
                            </FormItem>
                            <FormItem label='????????????'>
                              <FormText>{destination.recover?.sleepWindow ?? '-'}</FormText>
                            </FormItem>
                            <FormItem label='????????????'>
                              {/* ????????? */}
                              <FormText>
                                {BREAK_RESOURCE_TYPE_MAP[destination?.resource || BREAK_RESOURCE_TYPE.SUBSET]?.text ||
                                  '-'}
                              </FormText>
                            </FormItem>
                            <FormItem label='????????????'>
                              {/* ????????? */}
                              <FormText>
                                {OUTLIER_DETECT_MAP[destination.recover?.outlierDetectWhen || OutlierDetectWhen.NEVER]
                                  ?.text || '-'}
                              </FormText>
                            </FormItem>
                          </>
                        )
                      })}
                    </Form>
                  </>
                )
              },
            }),
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
      <Drawer
        title={drawerStatus.title}
        outerClickClosable={false}
        disableCloseIcon={true}
        visible={drawerStatus.visible}
        onClose={() => {}}
        style={{ width: '1000px' }}
        footer={
          <>
            <Button
              type={'primary'}
              onClick={createDuck ? () => handlers.drawerSubmit() : undefined}
              style={{ margin: '0 10px' }}
            >
              ??????
            </Button>
            <Button
              onClick={createDuck ? () => handlers.setDrawerStatus({ visible: false }) : undefined}
              style={{ margin: '0 10px' }}
            >
              ??????
            </Button>
          </>
        }
      >
        {createDuck && <Create duck={createDuck} store={store} dispatch={dispatch}></Create>}
      </Drawer>
    </>
  )
}
