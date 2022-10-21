import * as React from 'react'
import { Column } from '@src/polaris/common/ducks/GridPage'
import { DuckCmpProps } from 'saga-duck'
import { Text, Icon } from 'tea-component'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import RoutePageDuck from './PageDuck'
import { isReadOnly } from '../../utils'
import { RuleType } from '../circuitBreaker/types'
import { t } from 'i18next'
export default ({ duck: { creators, selector }, store }: DuckCmpProps<RoutePageDuck>): Column<any>[] => {
  const { ruleType } = selector(store)
  return [
    ...(ruleType === RuleType.Inbound
      ? [
          {
            key: 'sourceNamespace',
            header: t('命名空间'),
            render: (x) => (
              <React.Fragment>
                <Text>
                  {x.sources.map((source) => (source.namespace === '*' ? t('全部') : source.namespace)).join(',')}
                </Text>
              </React.Fragment>
            ),
          },
          {
            key: 'sourceService',
            header: t('服务名'),
            render: (x) => (
              <Text>{x.sources.map((source) => (source.service === '*' ? t('全部') : source.service)).join(',')}</Text>
            ),
          },
          {
            key: 'labels',
            header: t('请求标签'),
            render: (x) => {
              const result = x.sources
                ?.map((source) =>
                  Object.keys(source.metadata || {}).map((key) => `${key}:${source.metadata[key]?.value}`),
                )
                .join(' ; ')
              return <React.Fragment>{result || '-'}</React.Fragment>
            },
          },
        ]
      : []),
    ...(ruleType === RuleType.Outbound
      ? [
          {
            key: 'desNamespace',
            header: t('命名空间'),
            render: (x) => {
              const destination = x.destinations?.[0] || {}
              return (
                <React.Fragment>
                  <Text>{destination.namespace === '*' ? t('全部') : destination.namespace}</Text>
                </React.Fragment>
              )
            },
          },
          {
            key: 'desService',
            header: t('服务名'),
            render: (x) => {
              const destination = x.destinations?.[0] || {}
              return <Text>{destination.service === '*' ? t('全部') : destination.service}</Text>
            },
          },
          {
            key: 'labels',
            header: t('请求标签'),
            render: (x) => {
              const result = x.sources
                ?.map((source) =>
                  Object.keys(source.metadata || {}).map((key) => `${key}:${source.metadata[key]?.value}`),
                )
                .join(' ; ')
              return <React.Fragment>{result || '-'}</React.Fragment>
            },
          },
        ]
      : []),

    {
      key: 'action',
      header: t('操作'),
      render: (x) => {
        const {
          data: { namespace, editable },
        } = selector(store)

        return (
          <React.Fragment>
            <Action
              fn={(dispatch) => dispatch(creators.edit(x.id))}
              disabled={isReadOnly(namespace) || !editable}
              tip={isReadOnly(namespace) ? t('该命名空间为只读的') : !editable ? t('无写权限') : t('编辑')}
            >
              <Icon type={'pencil'}></Icon>
            </Action>
            <Action
              fn={(dispatch) => dispatch(creators.remove(x.id))}
              disabled={isReadOnly(namespace) || !editable}
              tip={isReadOnly(namespace) ? t('该命名空间为只读的') : !editable ? t('无写权限') : t('删除')}
            >
              <Icon type={'delete'}></Icon>
            </Action>
            <Action
              fn={(dispatch) => dispatch(creators.create(x.id))}
              disabled={isReadOnly(namespace) || !editable}
              tip={
                isReadOnly(namespace) ? t('该命名空间为只读的') : !editable ? t('无写权限') : t('在该规则前新建规则')
              }
            >
              <Icon type={'plus'}></Icon>
            </Action>
          </React.Fragment>
        )
      },
    },
  ]
}
