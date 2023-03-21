import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ConfigFileGroupDuck, { ConfigFileGroupItem } from './PageDuck'
import { Text } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { Link } from 'react-router-dom'
import i18n from '@src/polaris/common/util/i18n'

export default ({ duck: { creators } }: DuckCmpProps<ConfigFileGroupDuck>): Column<ConfigFileGroupItem>[] => [
  {
    key: 'name',
    header: i18n.t('名称'),
    render: x => (
      <Text>
        <Link to={`/filegroup-detail?group=${x.name}&namespace=${x.namespace}`}>{x.name}</Link>
      </Text>
    ),
  },
  {
    key: 'namespace',
    header: i18n.t('命名空间'),
    render: x => <Text tooltip={x.namespace}>{x.namespace || '-'}</Text>,
  },
  {
    key: 'comment',
    header: i18n.t('备注'),
    render: x => <Text tooltip={x.comment}>{x.comment || '-'}</Text>,
  },
  {
    key: 'config',
    header: i18n.t('配置文件数'),
    render: x => <Text tooltip={x.fileCount}>{x.fileCount || '-'}</Text>,
  },
  {
    key: 'ctime',
    header: i18n.t('创建时间'),
    render: x => <Text>{x.createTime}</Text>,
  },
  {
    key: 'action',
    header: i18n.t('操作'),
    render: x => {
      return (
        <React.Fragment>
          <Action
            fn={dispatch => dispatch(creators.edit(x))}
            disabled={!x.editable}
            tip={!x.editable ? i18n.t('无权限') : i18n.t('编辑')}
          >
            {i18n.t('编辑')}
          </Action>
          <Action
            fn={dispatch => dispatch(creators.remove(x))}
            disabled={!x.editable}
            tip={!x.editable ? i18n.t('无权限') : i18n.t('编辑')}
          >
            {i18n.t('删除')}
          </Action>
        </React.Fragment>
      )
    },
  },
]
