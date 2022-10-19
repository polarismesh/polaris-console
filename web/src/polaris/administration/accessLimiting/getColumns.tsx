import * as React from 'react'
import AccessLimitingDuck from './PageDuck'
import { Text, Copy } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { Dispatch } from 'redux'
import { RateLimit } from './model'
import { SwitchStatusAction } from './types'
import { t } from 'i18next'
export default ({ creators }: AccessLimitingDuck): Column<RateLimit>[] => [
  {
    key: 'idName',
    header: t('ID/规则名'),
    width: 280,
    render: (x) => (
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
    header: t('状态'),
    render: (x) => (x.disable ? <Text theme='success'>{t('已启用')}</Text> : <Text theme='danger'>{t('未启用')}</Text>),
  },
  {
    key: 'namespace',
    header: t('命名空间'),
    render: (x) => <Text>{x.namespace || '-'}</Text>,
  },
  {
    key: 'service',
    header: t('服务名称'),
    render: (x) => <Text>{x.service || '-'}</Text>,
  },
  {
    key: 'method',
    header: t('接口名称'),
    render: (x) => <Text>{x.method.value || '-'}</Text>,
  },
  {
    key: 'ctimeMtime',
    header: t('创建时间/修改时间'),
    render: (x) => (
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
    header: t('启用时间'),
    render: (x) => (
      <>
        <Text>{x.etime || '-'}</Text>
      </>
    ),
  },
  {
    key: 'action',
    header: t('操作'),
    render: (x) => {
      const actions: {
        id: string
        text: string
        fn: (dispatch?: Dispatch<any>, e?) => void
      }[] = [
        {
          id: 'switchStatus',
          text: x.disable ? t('禁用') : t('启用'),
          fn: (dispatch) => {
            const swtichStatusAction = x.disable ? SwitchStatusAction.disable : SwitchStatusAction.start
            dispatch(creators.switchStatus(x.id, x.name, swtichStatusAction))
          },
        },
        {
          id: 'modify',
          text: t('编辑'),
          fn: (dispatch) => {
            dispatch(creators.modify(x))
          },
        },
        {
          id: 'remove',
          text: t('删除'),
          fn: (dispatch) => {
            dispatch(creators.delete(x))
          },
        },
      ]
      return (
        <React.Fragment>
          {actions.map((action) => (
            <Action key={action.id} text={action.text} fn={action.fn} />
          ))}
        </React.Fragment>
      )
    },
  },
]
