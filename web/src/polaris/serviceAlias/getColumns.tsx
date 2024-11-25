import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { Link } from 'react-router-dom'
import ServiceAliasPageDuck, { GovernanceAliasItem } from './PageDuck'
import { Column } from '../common/ducks/GridPage'
import { Bubble, Icon, Tag, Text } from 'tea-component'
import Action from '../common/duckComponents/grid/Action'
import { disableDeleteTip } from '../service/getColumns'
import { checkGlobalRegistry } from '../service/utils'

export default ({ duck: { creators } }: DuckCmpProps<ServiceAliasPageDuck>): Column<GovernanceAliasItem>[] => {
  return [
    {
      key: 'alias',
      header: '服务别名',
      render: x => (
        <Text>
          {x.alias}
          {checkGlobalRegistry(x) && (
            <Bubble content={disableDeleteTip}>
              <Icon type='convertip--blue' />
            </Bubble>
          )}
        </Text>
      ),
      required: true,
    },
    {
      key: 'alias_namespace',
      header: '命名空间',
      render: x => <Text>{x.alias_namespace}</Text>,
      required: true,
    },
    {
      key: 'toService',
      header: '指向服务',
      render: x => (
        <>
          <Link to={`/service-detail?name=${x.service}&namespace=${x.namespace}`} target={'_blank'} rel='noreferrer'>
            {x.service}
          </Link>
          <Tag style={{ verticalAlign: 'bottom', margin: '0 5px' }}>{x.namespace}</Tag>
        </>
      ),
    },
    {
      key: 'comment',
      header: '描述',
      render: x => <Text>{x.comment || '-'}</Text>,
    },
    {
      key: 'createTime',
      header: '创建时间',
      render: x => <Text tooltip={x.ctime}>{x.ctime || '-'}</Text>,
    },
    {
      key: 'modifyTime',
      header: '修改时间',
      render: x => <Text tooltip={x.mtime}>{x.mtime || '-'}</Text>,
    },
    {
      key: 'action',
      header: '操作',
      render: x => {
        const hasGlobalRegistry = checkGlobalRegistry(x)
        return (
          <React.Fragment>
            <Action
              disabled={!x.editable || hasGlobalRegistry}
              tip={!x.editable ? '无写权限' : hasGlobalRegistry ? disableDeleteTip : '编辑'}
              fn={dispatch => dispatch(creators.edit(x))}
            >
              {'编辑'}
            </Action>
            <Action
              disabled={x.deleteable === false}
              tip={x.deleteable === false ? '无写权限' : '删除'}
              fn={dispatch => dispatch(creators.remove([x.id]))}
            >
              {'删除'}
            </Action>
          </React.Fragment>
        )
      },
    },
  ]
}
