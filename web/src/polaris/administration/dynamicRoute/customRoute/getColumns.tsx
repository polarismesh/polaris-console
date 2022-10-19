import * as React from 'react'
import AccessLimitingDuck from './PageDuck'
import { Text, Copy } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { Dispatch } from 'redux'
import { CustomRoute } from './model'
import { SwitchStatusAction } from '../../accessLimiting/types'
import { Link } from 'react-router-dom'
import { t } from 'i18next'
export default ({ creators }: AccessLimitingDuck): Column<CustomRoute>[] => [
  {
    key: 'idName',
    header: t('ID/规则名'),
    width: 280,
    render: (x) => (
      <>
        <Text theme='primary' overflow>
          <Link to={`/custom-route-detail?id=${x.id}`}>{x.id}</Link>
          <Copy text={x.id} />
        </Text>
        <br />
        <Text>{x.name}</Text>
      </>
    ),
  },
  {
    key: 'enable',
    header: t('状态'),
    render: (x) => (x.enable ? <Text theme='success'>{t('已启用')}</Text> : <Text theme='danger'>{t('未启用')}</Text>),
  },
  {
    key: 'description',
    header: t('描述'),
    render: (x) => x.description || '-',
  },
  {
    key: 'priority',
    header: t('优先级'),
    render: (x) => x.priority,
  },
  {
    key: 'source',
    header: t('主调服务'),
    render: (x) => {
      const { namespace, service } = x?.routing_config?.sources?.[0] || {}
      return (
        <>
          <Text parent={'div'}>
            {t('命名空间：')}
            {namespace}
          </Text>
          <Text parent={'div'}>
            {t('服务：')}
            {service}
          </Text>
        </>
      )
    },
  },
  {
    key: 'destination',
    header: t('被调服务'),
    render: (x) => {
      const { namespace, service } = x?.routing_config?.destinations?.[0] || {}
      return (
        <>
          <Text parent={'div'}>
            {t('命名空间：')}
            {namespace}
          </Text>
          <Text parent={'div'}>
            {t('服务：')}
            {service}
          </Text>
        </>
      )
    },
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
          text: x.enable ? t('禁用') : t('启用'),
          fn: (dispatch) => {
            const swtichStatusAction = x.enable ? SwitchStatusAction.disable : SwitchStatusAction.start
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
