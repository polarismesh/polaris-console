import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import Duck, { UserItem } from './PageDuck'
import { Text, Button, Dropdown, List, ListItem } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import { isOwner, getUin, getOwnerUin } from '@src/polaris/common/util/common'
import i18n from '@src/polaris/common/util/i18n'

export default ({ duck: { creators }, dispatch }: DuckCmpProps<Duck>): Column<UserItem>[] => {
  return [
    {
      key: 'name',
      header: i18n.t('用户名'),
      render: x => {
        const canRead = isOwner() || getUin().toString() === x.id
        return canRead ? (
          <a style={{ display: 'block' }} data-event={'nav'} href={`/#/user-detail?id=${x.id}`}>
            <Text>
              {x.name}
              {getUin().toString() === x.id && i18n.t('（当前登录）')}
            </Text>
          </a>
        ) : (
          <Text>
            {x.name} {getUin().toString() === x.id && i18n.t('（当前登录）')}
          </Text>
        )
      },
      required: true,
    },
    {
      key: 'userType',
      header: i18n.t('用户类型'),
      render: x => <Text>{getOwnerUin().toString() === x.id ? i18n.t('主账号') : i18n.t('子账号')}</Text>,
    },
    {
      key: 'id',
      header: i18n.t('用户id'),
      render: x => <Text>{x.id}</Text>,
    },
    {
      key: 'createTime',
      header: i18n.t('创建时间'),
      render: x => <Text>{x.ctime}</Text>,
    },
    {
      key: 'operation',
      header: i18n.t('操作'),
      render: x => (
        <>
          {isOwner() && (
            <Button type='link' disabled={getOwnerUin().toString() === x.id} onClick={() => dispatch(creators.auth(x))}>
              {i18n.t('授权')}
            </Button>
          )}
          <Button
            type='link'
            onClick={() => dispatch(creators.showToken(x))}
            disabled={!(isOwner() || getUin().toString() === x.id)}
          >
            {i18n.t('查看Token')}
          </Button>
          {isOwner() && (
            <Dropdown appearence='link' button={i18n.t('更多')}>
              <List type='option'>
                <ListItem onClick={() => dispatch(creators.attach(x))}>
                  <Text> {i18n.t('关联用户组')}</Text>
                </ListItem>
                <ListItem onClick={() => dispatch(creators.delete([x]))} disabled={getOwnerUin().toString() === x.id}>
                  {i18n.t('删除')}
                </ListItem>
              </List>
            </Dropdown>
          )}
        </>
      ),
    },
  ]
}
