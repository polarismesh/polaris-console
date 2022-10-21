import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ConfigFileReleaseHistoryDuck, { ConfigFileReleaseHistoryItem } from './PageDuck'
import { Text } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { t } from 'i18next'
export default ({
  duck: { creators },
}: DuckCmpProps<ConfigFileReleaseHistoryDuck>): Column<ConfigFileReleaseHistoryItem>[] => [
  {
    key: 'fileName',
    header: t('名称'),
    render: (x) => <Text>{x.fileName}</Text>,
  },
  {
    key: 'namespace',
    header: t('命名空间'),
    render: (x) => <Text tooltip={x.namespace}>{x.namespace || '-'}</Text>,
  },
  {
    key: 'group',
    header: t('配置分组'),
    render: (x) => <Text tooltip={x.group}>{x.group || '-'}</Text>,
  },
  {
    key: 'releaseBy',
    header: t('操作人'),
    render: (x) => <Text>{x.modifyBy}</Text>,
  },
  {
    key: 'createtime',
    header: t('创建时间'),
    render: (x) => <Text>{x.createTime}</Text>,
  },
  {
    key: 'action',
    header: t('操作'),
    render: (x) => {
      return (
        <React.Fragment>
          <Action fn={(dispatch) => dispatch(creators.showDiff(x))}>{t('查看详情')}</Action>
        </React.Fragment>
      )
    },
  },
]
