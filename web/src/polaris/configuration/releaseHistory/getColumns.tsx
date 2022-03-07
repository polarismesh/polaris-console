import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ConfigFileReleaseHistoryDuck, { ConfigFileReleaseHistoryItem } from './PageDuck'
import { Text } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
export default ({
  duck: { creators },
}: DuckCmpProps<ConfigFileReleaseHistoryDuck>): Column<ConfigFileReleaseHistoryItem>[] => [
  {
    key: 'fileName',
    header: '名称',
    render: x => <Text>{x.fileName}</Text>,
  },
  {
    key: 'namespace',
    header: '命名空间',
    render: x => <Text tooltip={x.namespace}>{x.namespace || '-'}</Text>,
  },
  {
    key: 'group',
    header: '配置分组',
    render: x => <Text tooltip={x.group}>{x.group || '-'}</Text>,
  },
  {
    key: 'releaseBy',
    header: '操作人',
    render: x => <Text>{x.modifyBy}</Text>,
  },
  {
    key: 'createtime',
    header: '创建时间',
    render: x => <Text>{x.createTime}</Text>,
  },
  {
    key: 'action',
    header: '操作',
    render: x => {
      return (
        <React.Fragment>
          <Action fn={dispatch => dispatch(creators.showDiff(x))}>{'查看详情'}</Action>
        </React.Fragment>
      )
    },
  },
]
