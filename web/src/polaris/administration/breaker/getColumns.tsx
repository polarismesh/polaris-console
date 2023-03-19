import { Trans, useTranslation } from 'react-i18next'
import * as React from 'react'
import CircuitBreakerDuck from './PageDuck'
import { Text, Copy } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { checkRuleType, CircuitBreakerRule } from './types'
import { DuckCmpProps } from 'saga-duck'
import router from '@src/polaris/common/util/router'
import { LimitMethodTypeMap } from '../accessLimiting/types'

export default (props: DuckCmpProps<CircuitBreakerDuck>): Column<CircuitBreakerRule>[] => {
  const { t } = useTranslation()
  const {
    duck: { creators },
    dispatch,
  } = props
  return [
    {
      key: 'idName',
      header: t('ID/规则名'),
      width: 280,
      render: x => {
        return (
          <>
            <Text overflow>
              {x.id}
              <Copy text={x.id} />
            </Text>
            <br />
            <Text>{x.name}</Text>
          </>
        )
      },
    },
    {
      key: 'enable',
      header: t('状态'),
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
      key: 'source',
      header: t('主调服务'),
      render: x => {
        return (
          <>
            <Text parent={'div'}>
              <Trans>命名空间:</Trans>
              {x.ruleMatcher?.source?.namespace}
            </Text>
            <Text parent={'div'}>
              <Trans>服务:</Trans>
              {x.ruleMatcher?.source?.service}
            </Text>
          </>
        )
      },
    },
    {
      key: 'destination',
      header: t('被调服务'),
      render: x => {
        return (
          <>
            <Text parent={'div'}>
              <Trans>命名空间:</Trans>
              {x.ruleMatcher?.destination?.namespace}
            </Text>
            <Text parent={'div'}>
              <Trans>服务:</Trans>
              {x.ruleMatcher?.destination?.service}
            </Text>
            {x.ruleMatcher?.destination?.method?.value && (
              <Text parent={'div'}>
                <Trans>接口:</Trans>
                {LimitMethodTypeMap[x.ruleMatcher?.destination?.method?.type]}
                {x.ruleMatcher?.destination?.method?.value}
              </Text>
            )}
          </>
        )
      },
    },
    {
      key: 'ctimemtime',
      header: t('创建时间/修改时间'),
      render: x => {
        return (
          <>
            <Text parent={'div'}>{x.ctime}</Text>
            <Text parent={'div'}>{x.mtime}</Text>
          </>
        )
      },
    },
    {
      key: 'etime',
      header: t('启用时间'),
      render: x => {
        return (
          <>
            <Text parent={'div'}>{x.etime}</Text>
          </>
        )
      },
    },
    {
      key: 'action',
      header: t('操作'),
      render: x => {
        return (
          <React.Fragment>
            <Action
              text={x.enable ? t('禁用') : t('启用')}
              fn={() => {
                dispatch(creators.toggle(x))
              }}
            />
            <Action
              text={t('编辑')}
              fn={() => {
                const type = checkRuleType(x?.level)
                router.navigate(`/circuitBreaker-create?id=${x.id}&type=${type}`)
              }}
            />
            <Action
              text={t('删除')}
              fn={() => {
                dispatch(creators.remove(x))
              }}
            />
          </React.Fragment>
        )
      },
    },
  ]
}
