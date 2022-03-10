import React, { useRef } from 'react'
import { DuckCmpProps } from 'saga-duck'
import ServicePageDuck from './PageDuck'
import {
  Button,
  Card,
  Justify,
  Table,
  Segment,
  Form,
  FormText,
  FormItem,
  Drawer,
  Text,
  MonacoEditor,
  H3,
  Row,
  Col,
} from 'tea-component'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import getColumns from './getColumns'
import { expandable } from 'tea-component/lib/table/addons'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { RULE_TYPE_OPTIONS, EDIT_TYPE_OPTION, EditType, RuleType } from './types'
import { isReadOnly } from '../../utils'
import Create from './operations/Create'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
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
      search: () => dispatch(creators.search('')),
      create: (payload = 0) => dispatch(creators.create(payload)),
      remove: payload => dispatch(creators.remove(payload)),
      drawerSubmit: () => dispatch(creators.drawerSubmit()),
      submit: () => dispatch(creators.submit()),
      reset: () => dispatch(creators.reset()),
      setDrawerStatus: payload => dispatch(creators.setDrawerStatus(payload)),
      setExpandedKeys: payload => dispatch(creators.setExpandedKeys(payload)),
      setRuleType: payload => dispatch(creators.setRuleType(payload)),
      setEditType: payload => dispatch(creators.setEditType(payload)),
      setJsonValue: payload => dispatch(creators.setJsonValue(payload)),
    }),
    [],
  )
  const columns = getColumns(props)
  const {
    expandedKeys,
    ruleType,
    data: { namespace },
    drawerStatus,
    edited,
    jsonValue,
    editType,
    data: { editable },
  } = selector(store)
  let createDuck
  if (drawerStatus.visible) {
    createDuck = ducks.dynamicCreateDuck.getDuck(drawerStatus.createId)
  }
  const ref = useRef(null)

  return (
    <>
      <Table.ActionPanel>
        <Form layout='inline'>
          <FormItem label={'编辑格式'}>
            <Segment options={EDIT_TYPE_OPTION} value={editType} onChange={handlers.setEditType}></Segment>
          </FormItem>
        </Form>
        <Form layout='inline'>
          <FormItem label={'规则类型'}>
            <Segment options={RULE_TYPE_OPTIONS} value={ruleType} onChange={handlers.setRuleType}></Segment>
          </FormItem>
        </Form>
        <Justify
          left={
            <>
              <Button
                type={'primary'}
                onClick={() => handlers.create()}
                disabled={isReadOnly(namespace) || !editable || drawerStatus.visible}
                tooltip={!editable ? '无写权限' : '新建一条规则'}
                style={{ marginTop: '20px' }}
              >
                新建
              </Button>
              <Button
                type={'primary'}
                onClick={() => handlers.submit()}
                disabled={isReadOnly(namespace) || drawerStatus.visible || !edited || !editable}
                tooltip={
                  isReadOnly(namespace)
                    ? '该命名空间为只读的'
                    : !edited
                    ? '未更改'
                    : !editable
                    ? '无写权限'
                    : '向服务器端提交变更'
                }
                style={{ marginTop: '20px' }}
              >
                提交
              </Button>
              {edited && (
                <Button onClick={() => handlers.reset()} style={{ marginTop: '20px' }}>
                  取消
                </Button>
              )}
            </>
          }
          right={<Button type={'icon'} icon={'refresh'} onClick={handlers.reload}></Button>}
        />
      </Table.ActionPanel>
      {editType === EditType.Table ? (
        <Card>
          <Card.Header>
            <H3 style={{ padding: '10px', color: 'black' }}>
              {ruleType === RuleType.Inbound
                ? '当以下服务调用本服务时，遵守下列路由规则'
                : '当本服务调用以下服务时，遵守以下路由规则'}
            </H3>
          </Card.Header>
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
                  return (
                    <>
                      <Form style={{ marginBottom: '20px' }}>
                        <FormItem label={'如果请求标签匹配，按权重和优先级路由到以下实例分组'}></FormItem>
                      </Form>
                      {record.destinations.map((destination, index) => {
                        return (
                          <Row key={index}>
                            <Col span={2} style={{ paddingTop: '0' }}>
                              <Text style={{ lineHeight: '30px' }} theme={'label'}>{`实例分组${index + 1}`}</Text>
                            </Col>
                            <Col span={22} style={{ paddingTop: '0' }}>
                              <Form layout='inline'>
                                <FormItem label='命名空间'>
                                  <FormText>{destination.namespace}</FormText>
                                </FormItem>
                                <FormItem label='服务'>
                                  <FormText>{destination.service}</FormText>
                                </FormItem>
                                <FormItem label='实例标签'>
                                  <FormText>
                                    {Object.keys(destination.metadata)
                                      .map(key => `${key}:${destination.metadata[key].value}`)
                                      .join(' ; ')}
                                  </FormText>
                                </FormItem>
                                <FormItem label='权重'>
                                  <FormText>{destination.weight}</FormText>
                                </FormItem>
                                <FormItem label='优先级'>
                                  <FormText>{destination.priority}</FormText>
                                </FormItem>
                                <FormItem label='是否隔离'>
                                  <FormText>{destination.isolate ? '隔离' : '不隔离'}</FormText>
                                </FormItem>
                              </Form>
                            </Col>
                          </Row>
                        )
                      })}
                    </>
                  )
                },
              }),
            ]}
          />
          <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <section style={{ border: '1px solid #ebebeb' }}>
              <MonacoEditor
                ref={ref}
                monaco={monaco}
                height={800}
                language='json'
                value={jsonValue}
                onChange={value => {
                  handlers.setJsonValue(value)
                }}
              />
            </section>
          </Card.Body>
        </Card>
      )}
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
              确定
            </Button>
            <Button
              onClick={createDuck ? () => handlers.setDrawerStatus({ visible: false }) : undefined}
              style={{ margin: '0 10px' }}
            >
              取消
            </Button>
          </>
        }
      >
        {createDuck && <Create duck={createDuck} store={store} dispatch={dispatch}></Create>}
      </Drawer>
    </>
  )
}
