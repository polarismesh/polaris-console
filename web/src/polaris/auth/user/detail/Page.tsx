import { Trans, useTranslation } from 'react-i18next'
import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import { Card, Form, Text, FormItem, Table, Button, FormText, Tabs, TabPanel } from 'tea-component'

import Duck from './PageDuck'
import CopyableText from '@src/polaris/common/components/CopyableText'
import { TAB, AuthTabs } from '../../constants'
import UserGroup from '../../userGroup/Page'
import Policy from '../../policy/Page'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { isOwner, getUin, getOwnerUin } from '@src/polaris/common/util/common'
import UseableResource from '../../common/UseableResource'

export default purify(function(props: DuckCmpProps<Duck>) {
  const { t } = useTranslation()

  const { duck, store, dispatch } = props
  const { selectors, selector, creators, ducks } = duck
  const composedId = selectors.composedId(store)
  const [tokenVisible, setTokenVisible] = React.useState(false)
  const [showAuthTabType, setShowAuthTabType] = React.useState(TAB.USERGROUP)
  const { data, authOpen } = selector(store)
  if (!data) return <noscript />
  const { comment, auth_token, token_enable, email, mobile } = data
  const resourceData = ducks.useableResource.selectors.data(store)
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={t('用户详情（{{attr0}}）', {
        attr0: composedId?.id,
      })}
      backRoute={'/user'}
    >
      {/* 内容区域一般使用 Card 组件显示内容 */}
      <Card>
        <Card.Body
          title={t('用户信息')}
          operation={
            <>
              <Button
                type={'link'}
                onClick={() => {
                  dispatch(creators.modify())
                }}
              >
                <Trans>编辑</Trans>
              </Button>
              <Button
                type={'link'}
                onClick={() => {
                  dispatch(creators.modifyPassword())
                }}
              >
                <Trans>修改密码</Trans>
              </Button>
            </>
          }
        >
          <Form>
            <FormItem label={t('账号名')}>
              <FormText>{data?.name}</FormText>
            </FormItem>
            <FormItem label={t('账号ID')}>
              <FormText>{composedId?.id}</FormText>
            </FormItem>
            <FormItem label={t('备注')}>
              <FormText>
                {comment || '-'}{' '}
                <Button
                  type={'icon'}
                  icon={'pencil'}
                  onClick={() => {
                    dispatch(creators.modifyComment())
                  }}
                ></Button>
              </FormText>
            </FormItem>
            <FormItem label={t('手机号')}>
              <FormText>{mobile || '-'} </FormText>
            </FormItem>
            <FormItem label={t('邮箱')}>
              <FormText>{email || '-'} </FormText>
            </FormItem>
            <FormItem label={'Token'}>
              {isOwner() || getUin().toString() === composedId.id ? (
                <Table
                  bordered
                  records={[
                    {
                      id: composedId.id,
                      auth_token,
                      token_enable,
                    },
                  ]}
                  columns={[
                    {
                      key: 'auth_token',
                      header: (
                        <>
                          <Text>Token</Text>
                          <Button
                            type={'icon'}
                            icon={tokenVisible ? 'hide' : 'show'}
                            onClick={() => setTokenVisible(!tokenVisible)}
                          />
                        </>
                      ),
                      render: x => (
                        <CopyableText
                          text={tokenVisible ? x.auth_token : '*'.repeat(x.auth_token?.length)}
                          copyText={x.auth_token}
                        ></CopyableText>
                      ),
                    },
                    {
                      key: 'token_enable',
                      header: t('状态'),
                      render: x =>
                        x.token_enable ? (
                          <Text theme={'success'}>{t('生效中')}</Text>
                        ) : (
                          <Text theme={'danger'}>{t('已失效')}</Text>
                        ),
                    },
                    {
                      key: 'operation',
                      header: t('操作'),
                      render: x => (
                        <>
                          {getOwnerUin().toString() !== x.id && isOwner() && (
                            <Button type='link' onClick={() => dispatch(creators.toggleToken())}>
                              {token_enable ? t('禁用') : t('启用')}
                            </Button>
                          )}
                          <Button type='link' onClick={() => dispatch(creators.resetToken())}>
                            {t('重置')}
                          </Button>
                        </>
                      ),
                    },
                  ]}
                ></Table>
              ) : (
                <FormText>{t('仅主账号可查看Token')}</FormText>
              )}
            </FormItem>
          </Form>
        </Card.Body>
      </Card>
      {authOpen && (
        <Card>
          <Card.Body>
            <Tabs
              tabs={AuthTabs.filter(item => item.id !== TAB.USER)}
              activeId={showAuthTabType}
              onActive={tab => setShowAuthTabType(tab.id as TAB)}
            >
              <TabPanel id={TAB.USERGROUP}>
                <UserGroup duck={ducks.userGroup} store={store} dispatch={dispatch} />
              </TabPanel>
              <TabPanel id={TAB.USEABLE_RESOURCE}>
                <UseableResource resources={resourceData} />
              </TabPanel>
              <TabPanel id={TAB.POLICY}>
                <Policy duck={ducks.policy} store={store} dispatch={dispatch} />
              </TabPanel>
            </Tabs>
          </Card.Body>
        </Card>
      )}
    </DetailPage>
  )
})
