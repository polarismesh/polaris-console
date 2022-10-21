import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import Duck from './PageDuck'
import { Text, Button, Dropdown, List, ListItem } from 'tea-component'

import { UserGroup } from '../model'
import { Column } from '@src/polaris/common/ducks/GridPage'
import { isOwner } from '@src/polaris/common/util/common'
import { t } from 'i18next'

export default ({ duck: { creators, selector }, store, dispatch }: DuckCmpProps<Duck>): Column<UserGroup>[] => {
  const { composedId } = selector(store)
  const isInDetailpage = !!composedId?.userId
  return [
    {
      key: 'name',
      header: t('用户组名称'),
      render: (x) => (
        <a style={{ display: 'block' }} data-event={'nav'} href={`/#/usergroup-detail?id=${x.id}`}>
          <Text>{x.name}</Text>
        </a>
      ),
      required: true,
    },
    {
      key: 'userCount',
      header: t('用户数量'),
      render: (x) => <Text>{x.user_count}</Text>,
    },
    {
      key: 'comment',
      header: t('备注'),
      render: (x) => <Text>{x.comment}</Text>,
    },
    {
      key: 'createTime',
      header: t('创建时间'),
      render: (x) => <Text>{x.ctime}</Text>,
    },
    ...(isInDetailpage
      ? []
      : [
          {
            key: 'operation',
            header: t('操作'),
            render: (x) => (
              <>
                {isOwner() && (
                  <Button type='link' onClick={() => dispatch(creators.edit(x))}>
                    {t('编辑')}
                  </Button>
                )}
                <Button type='link' onClick={() => dispatch(creators.showToken(x))}>
                  {t('查看Token')}
                </Button>
                {isOwner() && (
                  <Dropdown appearence='link' button={t('更多')}>
                    <List type='option'>
                      <ListItem onClick={() => dispatch(creators.auth(x))}>
                        <Text> {t('授权')}</Text>
                      </ListItem>
                      <ListItem onClick={() => dispatch(creators.delete(x))}>{t('删除')}</ListItem>
                    </List>
                  </Dropdown>
                )}
              </>
            ),
          },
        ]),
  ]
}
