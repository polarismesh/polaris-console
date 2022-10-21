import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import Duck, { UserItem } from './PageDuck'
import { Text, Button, Dropdown, List, ListItem } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import { isOwner, getUin, getOwnerUin } from '@src/polaris/common/util/common'
import { t } from 'i18next'

export default ({ duck: { creators }, dispatch }: DuckCmpProps<Duck>): Column<UserItem>[] => {
  return [
    {
      key: 'name',
      header: t('用户名'),
      render: (x) => {
        const canRead = isOwner() || getUin().toString() === x.id
        return canRead ? (
          <a style={{ display: 'block' }} data-event={'nav'} href={`/#/user-detail?id=${x.id}`}>
            <Text>
              {x.name}
              {getUin().toString() === x.id && t('（当前登录）')}
            </Text>
          </a>
        ) : (
          <Text>
            {x.name} {getUin().toString() === x.id && t('（当前登录）')}
          </Text>
        )
      },
      required: true,
    },
    {
      key: 'userType',
      header: t('用户类型'),
      render: (x) => <Text>{getOwnerUin().toString() === x.id ? t('主账号') : t('子账号')}</Text>,
    },
    {
      key: 'id',
      header: t('用户id'),
      render: (x) => <Text>{x.id}</Text>,
    },
    {
      key: 'createTime',
      header: t('创建时间'),
      render: (x) => <Text>{x.ctime}</Text>,
    },
    {
      key: 'operation',
      header: t('操作'),
      render: (x) => (
        <>
          {isOwner() && (
            <Button type='link' disabled={getOwnerUin().toString() === x.id} onClick={() => dispatch(creators.auth(x))}>
              {t('授权')}
            </Button>
          )}
          <Button
            type='link'
            onClick={() => dispatch(creators.showToken(x))}
            disabled={!(isOwner() || getUin().toString() === x.id)}
          >
            {t('查看Token')}
          </Button>
          {isOwner() && (
            <Dropdown appearence='link' button={t('更多')}>
              <List type='option'>
                <ListItem onClick={() => dispatch(creators.attach(x))}>
                  <Text> {t('关联用户组')}</Text>
                </ListItem>
                <ListItem onClick={() => dispatch(creators.delete([x]))} disabled={getOwnerUin().toString() === x.id}>
                  {t('删除')}
                </ListItem>
              </List>
            </Dropdown>
          )}
        </>
      ),
    },
  ]
}
