import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import NamespacePageDuck, { NamespaceItem } from './PageDuck'
import { Text } from 'tea-component'
import { Column } from '../common/ducks/GridPage'
import Action from '../common/duckComponents/grid/Action'
import { t } from 'i18next'

export default ({ duck: { creators } }: DuckCmpProps<NamespacePageDuck>): Column<NamespaceItem>[] => [
  {
    key: 'name',
    header: t('名称'),
    render: (x) => <Text>{x.name}</Text>,
  },
  {
    key: 'commnet',
    header: t('描述'),
    render: (x) => <Text tooltip={x.comment}>{x.comment || '-'}</Text>,
  },
  {
    key: 'totalSerivce',
    header: t('服务数'),
    render: (x) => <Text>{x.total_service_count ?? '-'}</Text>,
  },
  {
    key: 'health/total',
    header: t('健康实例/总实例数'),
    render: (x) => (
      <Text
        tooltip={`${x.total_health_instance_count}/${x.total_instance_count}`}
      >{`${x.total_health_instance_count}/${x.total_instance_count}`}</Text>
    ),
  },
  {
    key: 'ctime',
    header: t('创建时间'),
    render: (x) => <Text>{x.ctime}</Text>,
  },
  {
    key: 'mtime',
    header: t('修改时间'),
    render: (x) => <Text>{x.mtime}</Text>,
  },
  {
    key: 'action',
    header: t('操作'),
    render: (x) => {
      return (
        <React.Fragment>
          <Action fn={(dispatch) => dispatch(creators.edit(x))} disabled={!x.editable} tip={t('编辑')}>
            {t('编辑')}
          </Action>
          <Action fn={(dispatch) => dispatch(creators.remove(x))} disabled={!x.editable} tip={t('删除')}>
            {t('删除')}
          </Action>
        </React.Fragment>
      )
    },
  },
]
