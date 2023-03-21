import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ConfigFileReleaseHistoryDuck, { ConfigFileReleaseHistoryItem } from './PageDuck'
import { Text } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import i18n from '@src/polaris/common/util/i18n'
export default ({
  duck: { creators },
}: DuckCmpProps<ConfigFileReleaseHistoryDuck>): Column<ConfigFileReleaseHistoryItem>[] => [
  {
    key: 'fileName',
    header: i18n.t('名称'),
    render: x => <Text>{x.fileName}</Text>,
  },
  {
    key: 'namespace',
    header: i18n.t('命名空间'),
    render: x => <Text tooltip={x.namespace}>{x.namespace || '-'}</Text>,
  },
  {
    key: 'group',
    header: i18n.t('配置分组'),
    render: x => <Text tooltip={x.group}>{x.group || '-'}</Text>,
  },
  {
    key: 'releaseBy',
    header: i18n.t('操作人'),
    render: x => <Text>{x.modifyBy}</Text>,
  },
  {
    key: 'createtime',
    header: i18n.t('创建时间'),
    render: x => <Text>{x.createTime}</Text>,
  },
  {
    key: 'action',
    header: i18n.t('操作'),
    render: x => {
      return (
        <React.Fragment>
          <Action fn={dispatch => dispatch(creators.showDiff(x))}>{i18n.t('查看详情')}</Action>
        </React.Fragment>
      )
    },
  },
]
