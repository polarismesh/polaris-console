import * as React from 'react'
import { Column } from '../common/ducks/GridPage'
import { DuckCmpProps } from 'saga-duck'
import ServicePageDuck, { ServiceItem } from './PageDuck'
import { Link } from 'react-router-dom'
import { Text, Icon } from 'tea-component'
import Action from '../common/duckComponents/grid/Action'
import { isReadOnly } from './utils'
import { t } from 'i18next';

export default ({ duck: { creators } }: DuckCmpProps<ServicePageDuck>): Column<ServiceItem>[] => [
  {
    key: 'name',
    header: t('服务名'),
    render: x => (
      <React.Fragment>
        <Link to={`/service-detail?name=${x.name}&namespace=${x.namespace}`}>{x.name}</Link>
      </React.Fragment>
    ),
  },
  {
    key: 'namespace',
    header: t('命名空间'),
    render: x => <Text>{x.namespace}</Text>,
  },
  {
    key: 'department',
    header: t('部门'),
    render: x => <Text tooltip={x.department}>{x.department || '-'}</Text>,
  },
  {
    key: 'business',
    header: t('业务'),
    render: x => <Text tooltip={x.business}>{x.business || '-'}</Text>,
  },
  {
    key: 'health/total',
    header: t('健康实例/总实例数'),
    render: x => (
      <Text tooltip={`${x.healthy_instance_count}/${x.total_instance_count}`}>
        {`${x.healthy_instance_count ?? '-'}/${x.total_instance_count ?? '-'}`}
      </Text>
    ),
  },
  {
    key: 'ctime',
    header: t('创建时间'),
    render: x => <Text tooltip={x.ctime}>{x.ctime || '-'}</Text>,
  },
  {
    key: 'mtime',
    header: t('修改时间'),
    render: x => <Text tooltip={x.mtime}>{x.mtime || '-'}</Text>,
  },
  {
    key: 'action',
    header: t('操作'),
    render: x => {
      const disabled = isReadOnly(x.namespace)
      return (
        <React.Fragment>
          <Action
            fn={dispatch => dispatch(creators.edit(x))}
            disabled={disabled || !x.editable}
            tip={disabled ? t('该命名空间为只读的') : !x.editable ? t('无权限') : t('编辑')}
          >
            <Icon type={'pencil'}></Icon>
          </Action>
          <Action
            fn={dispatch => dispatch(creators.remove([x]))}
            disabled={disabled || !x.editable}
            tip={disabled ? t('该命名空间为只读的') : !x.editable ? t('无权限') : t('删除')}
          >
            <Icon type={'delete'}></Icon>
          </Action>
        </React.Fragment>
      )
    },
  },
]
