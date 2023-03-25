import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import Duck from './PageDuck'
import { Text, Button, Dropdown, List, ListItem } from 'tea-component'

import { UserGroup } from '../model'
import { Column } from '@src/polaris/common/ducks/GridPage'
import { isOwner } from '@src/polaris/common/util/common'
import { Link } from 'react-router-dom'

export default ({ duck: { creators, selector }, store, dispatch }: DuckCmpProps<Duck>): Column<UserGroup>[] => {
  const { composedId } = selector(store)
  const isInDetailpage = !!composedId?.userId
  return [
    {
      key: 'name',
      header: '用户组名称',
      render: x => (
        <Link style={{ display: 'block' }} data-event={'nav'} to={`/usergroup-detail?id=${x.id}`}>
          <Text>{x.name}</Text>
        </Link>
      ),
      required: true,
    },
    {
      key: 'userCount',
      header: '用户数量',
      render: x => <Text>{x.user_count}</Text>,
    },
    {
      key: 'comment',
      header: '备注',
      render: x => <Text>{x.comment}</Text>,
    },
    {
      key: 'createTime',
      header: '创建时间',
      render: x => <Text>{x.ctime}</Text>,
    },
    ...(isInDetailpage
      ? []
      : [
          {
            key: 'operation',
            header: '操作',
            render: x => (
              <>
                {isOwner() && (
                  <Button type='link' onClick={() => dispatch(creators.edit(x))}>
                    {'编辑'}
                  </Button>
                )}
                <Button type='link' onClick={() => dispatch(creators.showToken(x))}>
                  {'查看Token'}
                </Button>
                {isOwner() && (
                  <Dropdown appearence='link' button={'更多'}>
                    <List type='option'>
                      <ListItem onClick={() => dispatch(creators.auth(x))}>
                        <Text> {'授权'}</Text>
                      </ListItem>
                      <ListItem onClick={() => dispatch(creators.delete(x))}>{'删除'}</ListItem>
                    </List>
                  </Dropdown>
                )}
              </>
            ),
          },
        ]),
  ]
}
