import * as React from 'react'
import AccessLimitingDuck from './PageDuck'
import { Text, Copy, Bubble, Icon } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { Dispatch } from 'redux'
import { CustomRoute } from './model'
import { SwitchStatusAction } from '../../accessLimiting/types'
import { Link } from 'react-router-dom'
import { disableDeleteTip } from '@src/polaris/service/getColumns'
import { checkGlobalRegistry } from '@src/polaris/service/utils'

export default (
  { creators, selector }: AccessLimitingDuck,
  store,
): Column<CustomRoute & { namespace: string; service: string }>[] => {
  const { inDetail, namespace, service } = selector(store)
  return [
    {
      key: 'idName',
      header: 'ID/规则名',
      width: 280,
      render: x => (
        <>
          <Text theme='primary' overflow>
            <Link to={`/custom-route-detail?id=${x.id}${inDetail ? `&ns=${namespace}&service=${service}` : ''}`}>
              {x.id}
            </Link>
            <Copy text={x.id} />
          </Text>
          <br />
          <Text>
            {x.name}
            {checkGlobalRegistry(x) && (
              <Bubble content={disableDeleteTip}>
                <Icon type='convertip--blue' />
              </Bubble>
            )}
          </Text>
        </>
      ),
    },
    {
      key: 'enable',
      header: '状态',
      render: x => (x.enable ? <Text theme='success'>已启用</Text> : <Text theme='danger'>未启用</Text>),
    },
    {
      key: 'priority',
      header: '优先级',
      render: x => x.priority,
    },
    {
      key: 'description',
      header: '描述',
      render: x => x.description || '-',
    },
    {
      key: 'source',
      header: '主调服务',
      render: x => {
        const { namespace, service } = x?.routing_config?.rules?.[0]?.sources?.[0] || {}
        return (
          <>
            <Text parent={'div'}>命名空间：{namespace || '-'}</Text>
            <Text parent={'div'}>服务：{service || '-'}</Text>
          </>
        )
      },
    },
    {
      key: 'destination',
      header: '被调服务',
      render: x => {
        const { namespace, service } = x?.routing_config?.rules?.[0]?.destinations?.[0] || {}
        return (
          <>
            <Text parent={'div'}>命名空间：{namespace || '-'}</Text>
            <Text parent={'div'}>服务：{service || '-'}</Text>
          </>
        )
      },
    },
    {
      key: 'ctimeMtime',
      header: '创建时间/修改时间',
      render: x => (
        <>
          <Text>
            {x.ctime}
            <br />
            {x.mtime}
          </Text>
        </>
      ),
    },
    {
      key: 'etime',
      header: '启用时间',
      render: x => (
        <>
          <Text>{x.etime || '-'}</Text>
        </>
      ),
    },
    {
      key: 'action',
      header: '操作',
      render: x => {
        const hasGlobalRegistry = checkGlobalRegistry(x)
        const actions: {
          id: string
          text: string
          fn: (dispatch?: Dispatch<any>, e?) => void
          disabled: boolean
          tip?: string
        }[] = [
          {
            id: 'switchStatus',
            text: x.enable ? '禁用' : '启用',
            fn: dispatch => {
              const swtichStatusAction = x.enable ? SwitchStatusAction.disable : SwitchStatusAction.start
              dispatch(creators.switchStatus(x.id, x.name, swtichStatusAction))
            },
            disabled: x.editable === false || hasGlobalRegistry,
            tip: hasGlobalRegistry ? disableDeleteTip : '',
          },
          {
            id: 'modify',
            text: '编辑',
            fn: dispatch => {
              dispatch(creators.modify(x))
            },
            disabled: x.editable === false || hasGlobalRegistry,
            tip: hasGlobalRegistry ? disableDeleteTip : '',
          },
          {
            id: 'remove',
            text: '删除',
            fn: dispatch => {
              dispatch(creators.delete(x))
            },
            disabled: x.deleteable === false,
          },
        ]
        return (
          <React.Fragment>
            {actions.map(action => (
              <Action disabled={action.disabled} key={action.id} text={action.text} fn={action.fn} tip={action.tip} />
            ))}
          </React.Fragment>
        )
      },
    },
  ]
}
