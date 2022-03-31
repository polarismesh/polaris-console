import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import { Card, Form, Text, FormItem, Table, Button, FormText, Tabs, TabPanel } from 'tea-component'

import Duck from './PageDuck'
import { TAB, AuthTabs } from '../../constants'
import User from '../../user/Page'
import Policy from '../../policy/Page'
import DetailPage from '@src/polaris/common/duckComponents/DetailPage'
import { getUin, isOwner } from '@src/polaris/common/util/common'
import CopyableText from '@src/polaris/common/components/CopyableText'
import UseableResource from '../../common/UseableResource'

export default purify(function(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selectors, selector, creators, ducks } = duck
  const composedId = selectors.composedId(store)
  const [tokenVisible, setTokenVisible] = React.useState(false)
  const [showAuthTabType, setShowAuthTabType] = React.useState(TAB.USER)
  const { data } = selector(store)
  if (!data) return <noscript />
  const { comment, auth_token, token_enable } = data
  const isUserInGroup = !!data?.relation?.users?.find(item => item.id === getUin().toString())
  const canReadToken = isUserInGroup || isOwner()
  const resourceData = ducks.useableResource.selectors.data(store)
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={`用户组详情(${data?.name})`}
      backRoute={'/usergroup'}
    >
      <Card>
        <Card.Body>
          <Form>
            <FormItem label={'用户组名'}>
              <FormText>{data?.name}</FormText>
            </FormItem>
            <FormItem label={'用户组ID'}>
              <FormText>{composedId?.id}</FormText>
            </FormItem>
            <FormItem label={'备注'}>
              <FormText>
                {comment || '-'}
                <Button
                  type={'icon'}
                  icon={'pencil'}
                  disabled={!isOwner()}
                  onClick={() => {
                    dispatch(creators.modifyComment())
                  }}
                ></Button>
              </FormText>
            </FormItem>
            <FormItem label={'Token'}>
              <Table
                bordered
                records={[
                  {
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
                          disabled={!canReadToken}
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
                  ...(isOwner()
                    ? [
                        {
                          key: 'operation',
                          header: '操作',
                          render: () => (
                            <>
                              <Button type='link' onClick={() => dispatch(creators.toggleToken())}>
                                {token_enable ? '禁用' : '启用'}
                              </Button>
                              <Button type='link' onClick={() => dispatch(creators.resetToken())}>
                                {'重置'}
                              </Button>
                            </>
                          ),
                        },
                      ]
                    : []),
                ]}
              ></Table>
            </FormItem>
          </Form>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Tabs
            tabs={AuthTabs.filter(item => item.id !== TAB.USERGROUP)}
            activeId={showAuthTabType}
            onActive={tab => setShowAuthTabType(tab.id as TAB)}
          >
            <TabPanel id={TAB.USER}>
              <User duck={ducks.user} store={store} dispatch={dispatch} />
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
    </DetailPage>
  )
})
