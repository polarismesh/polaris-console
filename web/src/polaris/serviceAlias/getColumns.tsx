import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ServiceAliasPageDuck, { GovernanceAliasItem } from './PageDuck'
import { Column } from '../common/ducks/GridPage'
import { Tag, Text } from 'tea-component'
import Action from '../common/duckComponents/grid/Action'
import i18n from '../common/util/i18n'

export default ({ duck: { creators } }: DuckCmpProps<ServiceAliasPageDuck>): Column<GovernanceAliasItem>[] => {
  return [
    {
      key: 'alias',
      header: i18n.t('服务别名'),
      render: x => <Text>{x.alias}</Text>,
      required: true,
    },
    {
      key: 'alias_namespace',
      header: i18n.t('命名空间'),
      render: x => <Text>{x.alias_namespace}</Text>,
      required: true,
    },
    {
      key: 'toService',
      header: i18n.t('指向服务'),
      render: x => (
        <>
          <a href={`/#/service-detail?name=${x.service}&namespace=${x.namespace}`} target={'_blank'} rel='noreferrer'>
            {x.service}
          </a>
          <Tag style={{ verticalAlign: 'bottom', margin: '0 5px' }}>{x.namespace}</Tag>
        </>
      ),
    },
    {
      key: 'comment',
      header: i18n.t('描述'),
      render: x => <Text>{x.comment || '-'}</Text>,
    },
    {
      key: 'createTime',
      header: i18n.t('创建时间'),
      render: x => <Text tooltip={x.ctime}>{x.ctime || '-'}</Text>,
    },
    {
      key: 'modifyTime',
      header: i18n.t('修改时间'),
      render: x => <Text tooltip={x.mtime}>{x.mtime || '-'}</Text>,
    },
    {
      key: 'action',
      header: i18n.t('操作'),
      render: x => {
        return (
          <React.Fragment>
            <Action
              disabled={!x.editable}
              tip={!x.editable ? i18n.t('无写权限') : i18n.t('编辑')}
              fn={dispatch => dispatch(creators.edit(x))}
            >
              {i18n.t('编辑')}
            </Action>
            <Action
              disabled={!x.editable}
              tip={!x.editable ? i18n.t('无写权限') : i18n.t('删除')}
              fn={dispatch => dispatch(creators.remove([x.id]))}
            >
              {i18n.t('删除')}
            </Action>
          </React.Fragment>
        )
      },
    },
  ]
}
