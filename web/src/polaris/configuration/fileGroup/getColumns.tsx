import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ConfigFileGroupDuck, { ConfigFileGroupItem } from './PageDuck'
import { Text } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { Link } from 'react-router-dom'

export default ({ duck: { creators } }: DuckCmpProps<ConfigFileGroupDuck>): Column<ConfigFileGroupItem>[] => [
  {
    key: 'name',
    header: '名称',
    render: x => (
      <Text>
        <Link to={`/filegroup-detail?group=${x.name}&namespace=${x.namespace}`}>{x.name}</Link>
      </Text>
    ),
  },
  {
    key: 'namespace',
    header: '命名空间',
    render: x => <Text tooltip={x.namespace}>{x.namespace || '-'}</Text>,
  },
  {
    key: 'department',
    header: '部门',
    render: x => <Text tooltip={x.department}>{x.department || '-'}</Text>,
  },
  {
    key: 'business',
    header: '业务',
    render: x => <Text tooltip={x.business}>{x.business || '-'}</Text>,
  },
  {
    key: 'comment',
    header: '备注',
    render: x => <Text tooltip={x.comment}>{x.comment || '-'}</Text>,
  },
  {
    key: 'config',
    header: '配置文件数',
    render: x => <Text tooltip={x.fileCount}>{x.fileCount || '-'}</Text>,
  },
  {
    key: 'ctime',
    header: '创建时间',
    render: x => <Text>{x.createTime}</Text>,
  },
  {
    key: 'action',
    header: '操作',
    render: x => {
      return (
        <React.Fragment>
          <Action
            fn={dispatch => dispatch(creators.edit(x))}
            disabled={x.editable === false}
            tip={x.editable === false ? '无权限' : '编辑'}
          >
            {'编辑'}
          </Action>
          <Action
            fn={dispatch => dispatch(creators.remove(x))}
            disabled={x.deleteable === false}
            tip={x.deleteable === false ? '无权限' : '编辑'}
          >
            {'删除'}
          </Action>
        </React.Fragment>
      )
    },
  },
]
