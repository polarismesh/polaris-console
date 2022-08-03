import * as React from 'react'
import AccessLimitingDuck from './PageDuck'
import { Text, Copy } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { Dispatch } from 'redux'
import { RateLimit } from './model'
import { SwitchStatusAction } from './types'
export default ({ creators }: AccessLimitingDuck): Column<RateLimit>[] => [
  {
    key: 'idName',
    header: 'ID/规则名',
    width: 280,
    render: x => (
      <>
        <Text theme='primary'>
          {x.id}
          <Copy text={x.id} />
        </Text>
        <br />
        <Text>{x.name}</Text>
      </>
    ),
  },
  {
    key: 'disable',
    header: '状态',
    render: x => (x.disable ? <Text theme='success'>已启用</Text> : <Text theme='danger'>未启用</Text>),
  },
  {
    key: 'namespace',
    header: '命名空间',
    render: x => <Text>{x.namespace || '-'}</Text>,
  },
  {
    key: 'service',
    header: '服务名称',
    render: x => <Text>{x.service || '-'}</Text>,
  },
  {
    key: 'method',
    header: '接口名称',
    render: x => <Text>{x.method.value || '-'}</Text>,
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
      const actions: {
        id: string
        text: string
        fn: (dispatch?: Dispatch<any>, e?) => void
      }[] = [
        {
          id: 'switchStatus',
          text: x.disable ? '禁用' : '启用',
          fn: dispatch => {
            const swtichStatusAction = x.disable ? SwitchStatusAction.disable : SwitchStatusAction.start
            dispatch(creators.switchStatus(x.id, x.name, swtichStatusAction))
          },
        },
        {
          id: 'modify',
          text: '编辑',
          fn: dispatch => {
            dispatch(creators.modify(x))
          },
        },
        {
          id: 'remove',
          text: '删除',
          fn: dispatch => {
            dispatch(creators.delete(x))
          },
        },
      ]
      return (
        <React.Fragment>
          {actions.map(action => (
            <Action key={action.id} text={action.text} fn={action.fn} />
          ))}
        </React.Fragment>
      )
    },
  },
]
