import { Trans } from 'react-i18next'
import * as React from 'react'
import AccessLimitingDuck from './PageDuck'
import { Text, Copy } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { Dispatch } from 'redux'
import { CustomRoute } from './model'
import { SwitchStatusAction } from '../../accessLimiting/types'
import { Link } from 'react-router-dom'
import i18n from '@src/polaris/common/util/i18n'

export default (
  { creators, selector }: AccessLimitingDuck,
  store,
): Column<CustomRoute & { namespace: string; service: string }>[] => {
  const { inDetail, namespace, service } = selector(store)
  return [
    {
      key: 'idName',
      header: i18n.t('ID/规则名'),
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
          <Text>{x.name}</Text>
        </>
      ),
    },
    {
      key: 'enable',
      header: i18n.t('状态'),
      render: x =>
        x.enable ? (
          <Text theme='success'>
            <Trans>已启用</Trans>
          </Text>
        ) : (
          <Text theme='danger'>
            <Trans>未启用</Trans>
          </Text>
        ),
    },
    {
      key: 'description',
      header: i18n.t('描述'),
      render: x => x.description || '-',
    },
    {
      key: 'source',
      header: i18n.t('主调服务'),
      render: x => {
        const { namespace, service } = x?.routing_config?.rules?.[0]?.sources?.[0] || {}
        return (
          <>
            <Text parent={'div'}>
              <Trans>命名空间：</Trans>
              {namespace || '-'}
            </Text>
            <Text parent={'div'}>
              <Trans>服务：</Trans>
              {service || '-'}
            </Text>
          </>
        )
      },
    },
    {
      key: 'destination',
      header: i18n.t('被调服务'),
      render: x => {
        const { namespace, service } = x?.routing_config?.rules?.[0]?.destinations?.[0] || {}
        return (
          <>
            <Text parent={'div'}>
              <Trans>命名空间：</Trans>
              {namespace || '-'}
            </Text>
            <Text parent={'div'}>
              <Trans>服务：</Trans>
              {service || '-'}
            </Text>
          </>
        )
      },
    },
    {
      key: 'ctimeMtime',
      header: i18n.t('创建时间/修改时间'),
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
      header: i18n.t('启用时间'),
      render: x => (
        <>
          <Text>{x.etime || '-'}</Text>
        </>
      ),
    },
    {
      key: 'action',
      header: i18n.t('操作'),
      render: x => {
        const actions: {
          id: string
          text: string
          fn: (dispatch?: Dispatch<any>, e?) => void
        }[] = [
          {
            id: 'switchStatus',
            text: x.enable ? i18n.t('禁用') : i18n.t('启用'),
            fn: dispatch => {
              const swtichStatusAction = x.enable ? SwitchStatusAction.disable : SwitchStatusAction.start
              dispatch(creators.switchStatus(x.id, x.name, swtichStatusAction))
            },
          },
          {
            id: 'modify',
            text: i18n.t('编辑'),
            fn: dispatch => {
              dispatch(creators.modify(x))
            },
          },
          {
            id: 'remove',
            text: i18n.t('删除'),
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
}
