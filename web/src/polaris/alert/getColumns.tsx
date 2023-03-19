import { t } from 'i18next'
import { Trans, useTranslation } from 'react-i18next'
import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import AlertPageDuck from './PageDuck'
import { Text } from 'tea-component'
import { Column } from '../common/ducks/GridPage'
import Action from '../common/duckComponents/grid/Action'
import { AlertInfo, AlertTimeIntervalMap, AlterExprMap, MonitorTypeMap } from './types'
import { MetricNameMap } from '../monitor/types'
import { Link } from 'react-router-dom'

export default ({ duck: { creators } }: DuckCmpProps<AlertPageDuck>): Column<AlertInfo>[] => {
  return [
    {
      key: 'name',
      header: t('策略ID/名称'),
      render: x => (
        <>
          <React.Fragment>
            <Link to={`/alert-detail?id=${x.id}`}>{x.id}</Link>
          </React.Fragment>
          <Text parent={'div'}>{x.name}</Text>
        </>
      ),
    },
    {
      key: 'monitor_type',
      header: t('监控类型'),
      render: x => <Text tooltip={MonitorTypeMap[x.monitor_type]}>{MonitorTypeMap[x.monitor_type] || '-'}</Text>,
    },
    {
      key: 'rules',
      header: t('触发条件'),
      render: x => (
        <>
          <Text parent={'div'}>
            {MetricNameMap[x.alter_expr?.metrics_name]?.text} {AlterExprMap[x.alter_expr?.expr]} {x.alter_expr?.value}
            {MetricNameMap[x.alter_expr?.metrics_name]?.unit}
          </Text>
          <Text parent={'div'}>
            <Trans>持续</Trans>
            {x.alter_expr.for}
            {AlertTimeIntervalMap[x.alter_expr.for_unit]}
          </Text>
        </>
      ),
    },
    {
      key: 'interval',
      header: t('告警规则'),
      render: x => (
        <Text>
          <Trans>每隔</Trans>
          {`${x.interval}${AlertTimeIntervalMap[x.interval_unit]}`}
          <Trans>告警一次</Trans>
        </Text>
      ),
    },
    {
      key: 'ctime',
      header: t('创建时间'),
      render: x => (
        <>
          <Text parent={'div'}>{x.create_time}</Text>
          <Text parent={'div'}>{x.modify_time}</Text>
        </>
      ),
    },
    {
      key: 'action',
      header: t('操作'),
      render: x => {
        return (
          <React.Fragment>
            <Action fn={dispatch => dispatch(creators.toggle(x))} tip={x.enable ? t('禁用') : t('启用')}>
              {x.enable ? t('禁用') : t('启用')}
            </Action>
            <Action fn={dispatch => dispatch(creators.edit(x))} tip={t('编辑')}>
              {t('编辑')}
            </Action>
            <Action fn={dispatch => dispatch(creators.remove(x))} tip={t('删除')}>
              {t('删除')}
            </Action>
          </React.Fragment>
        )
      },
    },
  ]
}
