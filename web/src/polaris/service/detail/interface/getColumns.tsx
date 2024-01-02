import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ServiceAliasPageDuck from './PageDuck'
import { Text } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { GovernanceInterfaceDescription, GovernanceServiceContract } from '../../model'

export default ({
  duck: { creators },
}: DuckCmpProps<ServiceAliasPageDuck>): Column<
  GovernanceInterfaceDescription & Partial<GovernanceServiceContract>
>[] => {
  return [
    {
      key: 'url',
      header: '路径',
      render: x => <Text>{x.path}</Text>,
    },
    {
      key: 'method',
      header: '方法',
      render: x => <Text>{x.method}</Text>,
    },
    {
      key: 'status',
      header: '状态',
      render: x => <Text>{x.status}</Text>,
    },
    {
      key: 'protocol',
      header: '协议',
      render: x => <Text>{x.protocol}</Text>,
    },
    {
      key: 'source',
      header: '来源',
      render: x => <Text>{x.source}</Text>,
    },
    {
      key: 'action',
      header: '操作',
      render: x => {
        return (
          <React.Fragment>
            <Action fn={dispatch => dispatch(creators.showDetail(x))}>{'查看详情'}</Action>
            <Action fn={dispatch => dispatch(creators.remove([x.id]))}>{'删除'}</Action>
          </React.Fragment>
        )
      },
    },
  ]
}
