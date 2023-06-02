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

export default purify(function (props: DuckCmpProps<Duck>) {
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
      title={`用户详情（${composedId?.id}）`}
      backRoute={'/user'}
    >
      {/* 内容区域一般使用 Card 组件显示内容 */}
      <Card>
        <Card.Body
          title={'用户信息'}
          operation={
            <>
              <Button
                type={'link'}
                onClick={() => {
                  dispatch(creators.modifyPassword())
                }}
              >
                修改密码
              </Button>
            </>
          }
        >
          <Form>
            <FormItem label={'账号名'}>
              <FormText>{data?.name}</FormText>
            </FormItem>
            <FormItem label={'账号ID'}>
              <FormText>{composedId?.id}</FormText>
            </FormItem>
            <FormItem label={'备注'}>
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
                      header: '状态',
                      render: x =>
                        x.token_enable ? (
                          <Text theme={'success'}>{'生效中'}</Text>
                        ) : (
                          <Text theme={'danger'}>{'已失效'}</Text>
                        ),
                    },
                    {
                      key: 'operation',
                      header: '操作',
                      render: x => (
                        <>
                          {getOwnerUin().toString() !== x.id && isOwner() && (
                            <Button type='link' onClick={() => dispatch(creators.toggleToken())}>
                              {token_enable ? '禁用' : '启用'}
                            </Button>
                          )}
                          <Button type='link' onClick={() => dispatch(creators.resetToken())}>
                            {'重置'}
                          </Button>
                        </>
                      ),
                    },
                  ]}
                ></Table>
              ) : (
                <FormText>{'仅主账号可查看Token'}</FormText>
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
                <section style={{ marginTop: '10px' }}>
                  <UserGroup duck={ducks.userGroup} store={store} dispatch={dispatch} />
                </section>
              </TabPanel>
              <TabPanel id={TAB.USEABLE_RESOURCE}>
                <section style={{ marginTop: '10px' }}>
                  <UseableResource resources={resourceData} />
                </section>
              </TabPanel>
              <TabPanel id={TAB.POLICY}>
                <section style={{ marginTop: '10px' }}>
                  <Policy duck={ducks.policy} store={store} dispatch={dispatch} />
                </section>
              </TabPanel>
            </Tabs>
          </Card.Body>
        </Card>
      )}
    </DetailPage>
  )
})
