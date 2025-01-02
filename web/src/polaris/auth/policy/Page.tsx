import * as React from 'react'
import { useCallback } from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import Duck from './PageDuck'

import {
  Card,
  List,
  Text,
  Row,
  Col,
  ListItem,
  Button,
  Tabs,
  Table,
  Justify,
  Icon,
  Dropdown,
  SearchBox,
  Form,
  FormItem,
  FormText,
  Bubble,
  Alert,
} from 'tea-component'
import { autotip, scrollable } from 'tea-component/lib/table/addons'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { getOwnerUin, isOwner } from '@src/polaris/common/util/common'
import router from '@src/polaris/common/util/router'
import BasicLayout from '@src/polaris/common/components/BaseLayout'
import { AuthStrategy, describeAuthStatus } from '../model'
import UseableResource from '../common/UseableResource'

export enum AuthSubjectType {
  USER = 'user',
  USERGROUP = 'group',
}
export enum AuthResourceType {
  NAMESPACE = 'namespaces',
  SERVICE = 'services',
  CONFIGURATION = 'config_groups',
}
export const AUTH_SUBJECT_TYPE_MAP = {
  [AuthSubjectType.USER]: { text: '用户', urlKey: 'user' },
  [AuthSubjectType.USERGROUP]: { text: '用户组', urlKey: 'usergroup' },
}
export const AUTH_RESOURCE_TYPE_MAP = {
  [AuthResourceType.NAMESPACE]: {
    text: '命名空间',
    columnsRender: x => x.name,
  },
  [AuthResourceType.SERVICE]: {
    text: '服务',
    columnsRender: x => `${x.name}（${x.namespace}）`,
  },
  [AuthResourceType.CONFIGURATION]: {
    text: '配置分组',
    columnsRender: x => x.name,
  },
}
export const AuthSubjectTabs = Object.keys(AUTH_SUBJECT_TYPE_MAP).map(id => ({
  id,
  label: AUTH_SUBJECT_TYPE_MAP[id].text,
}))
export const AuthResourceTabs = Object.keys(AUTH_RESOURCE_TYPE_MAP).map(id => ({
  id,
  label: AUTH_RESOURCE_TYPE_MAP[id].text,
}))
insertCSS(
  'authItem',
  `.app-tse-list>.auth-item{
    padding: 15px 10px 15px 10px;
  }
  .auth-item {
    padding: 10px 10px !important;
  }
`,
)

const formatPolicyName = (name: string) => {
  let trimName = name
  if (name.indexOf('(用户组)') === 0) {
    trimName = name.replace('(用户组)', '')
  }
  if (name.indexOf('(用户)') === 0) {
    trimName = name.replace('(用户)', '')
  }
  return trimName
}

const getHandlers = memorize(({ creators }: Duck, dispatch) => ({
  create: () => dispatch(creators.create()),
  fetchCurrentAuthItem: v => dispatch(creators.fetchCurrentAuthItem(v)),
  modify: v => dispatch(creators.modify(v)),
  search: v => dispatch(creators.search(v)),
  setSearchword: v => dispatch(creators.setSearchword(v)),
  delete: v => dispatch(creators.delete(v)),
  reload: () => dispatch(creators.reload()),
}))

export default function AuthPage(props: DuckCmpProps<Duck>) {
  const { duck, store } = props
  const { selector } = duck
  const { authList, currentAuthItem, composedId, searchword } = selector(store)
  const [showAuthSubjectType, setShowAuthSubjectType] = React.useState(AuthSubjectType.USER)
  const [showAuthResourceType, setShowAuthResourceType] = React.useState(AuthResourceType.NAMESPACE)
  const [collapseDefault, setCollapseDefault] = React.useState(true)
  const [collapseCustom, setCollapseCustom] = React.useState(true)

  const [authClientOpen, setAuthClientOpen] = React.useState(true)
  const [authConsoleOpen, setAuthConsoleOpen] = React.useState(true)
  const fetchAuth = useCallback(async () => {
    const { clientOpen, consoleOpen } = await describeAuthStatus({})
    setAuthClientOpen(clientOpen === 'true')
    setAuthConsoleOpen(consoleOpen === 'true')
  }, [])
  React.useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  let tempAuthStatus = ''
  if (authClientOpen && authConsoleOpen) {
    tempAuthStatus = '鉴权策略针对控制台接口以及客户端接口均生效'
  }
  if (authClientOpen && !authConsoleOpen) {
    tempAuthStatus = '鉴权策略仅针对客户端接口生效'
  }
  if (!authClientOpen && authConsoleOpen) {
    tempAuthStatus = '鉴权策略仅针对控制台接口生效'
  }
  if (!authClientOpen && !authConsoleOpen) {
    tempAuthStatus = '鉴权策略不生效'
  }
  const authStatusMsg = tempAuthStatus

  const handlers = getHandlers(props)
  const isInDetailpage = !!composedId?.principalId
  const countedAuthSubjectTabs = AuthSubjectTabs.map(item => ({
    ...item,
    label: `${item.label}(${currentAuthItem?.principals?.[`${item.id}s`]?.length ?? 0})`,
  }))
  const defaultList = authList.filter(item => item.default_strategy)
  const customList = authList.filter(item => !item.default_strategy)
  const isCurrAuthItemOwnerDefaultPrinciple =
    currentAuthItem?.default_strategy &&
    currentAuthItem?.principals?.users?.length === 1 &&
    currentAuthItem?.principals?.users?.[0]?.id === getOwnerUin()
  const renderListItem = (item: AuthStrategy) => {
    const principalType = item.name.indexOf('用户组') > -1 ? AuthSubjectType.USERGROUP : AuthSubjectType.USER
    const isActive = item.id === currentAuthItem.id
    const isOwnerDefaultPrinciple =
      item.default_strategy &&
      item?.principals?.users?.length === 1 &&
      item?.principals?.users?.[0]?.id === getOwnerUin()
    return (
      <ListItem
        key={item.id}
        onClick={() => {
          handlers.fetchCurrentAuthItem(item.id)
        }}
        className={'auth-item'}
        current={isActive}
      >
        <Text
          tooltip={formatPolicyName(item.name)}
          reset
          parent={'div'}
          theme={isActive ? 'primary' : 'text'}
          style={{ width: 'calc(100% - 32px)', display: 'inline-block' }}
        >
          {item.default_strategy && (
            <Bubble content={principalType === AuthSubjectType.USER ? '用户' : '用户组'}>
              {principalType === AuthSubjectType.USER ? (
                <img
                  style={{ verticalAlign: 'middle' }}
                  src={isActive ? 'static/img/user-icon-active.svg' : 'static/img/user-icon.svg'}
                />
              ) : (
                <img
                  style={{ verticalAlign: 'middle' }}
                  src={isActive ? 'static/img/usergroup-icon-active.svg' : 'static/img/usergroup-icon.svg'}
                />
              )}
            </Bubble>
          )}
          <Text overflow style={{ maxWidth: 'calc(100% - 32px)' }}>
            {formatPolicyName(item.name)}
          </Text>
        </Text>
        <Dropdown button={<Button type='icon' icon='more' />} appearance='pure'>
          <List type='option'>
            <ListItem onClick={() => handlers.modify(item.id)} disabled={isOwnerDefaultPrinciple}>
              <Text> {'编辑'}</Text>
            </ListItem>
            <ListItem onClick={() => handlers.delete(item.id)} disabled={item.default_strategy}>
              {'删除'}
            </ListItem>
          </List>
        </Dropdown>
      </ListItem>
    )
  }
  const contentElement = (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              {!isInDetailpage && isOwner() && (
                <Button type={'primary'} onClick={handlers.create}>
                  {'新建策略'}
                </Button>
              )}
            </>
          }
          right={<Button type={'icon'} icon={'refresh'} onClick={handlers.reload}></Button>}
        />
      </Table.ActionPanel>
      <Row>
        <Col span={6}>
          <div style={{ padding: '10px', backgroundColor: '#f9f9f9', height: '100%', maxHeight: '1000px' }}>
            <SearchBox
              value={searchword}
              onSearch={handlers.search}
              onClear={() => handlers.search('')}
              onChange={handlers.setSearchword}
            ></SearchBox>
            <List type={'option'} style={{ maxHeight: '50%' }}>
              <ListItem
                key={'collapse-button'}
                onClick={() => {
                  setCollapseDefault(!collapseDefault)
                }}
                className={'auth-item'}
                current={false}
              >
                <Icon type={collapseDefault ? 'arrowdown' : 'arrowup'} />
                默认策略（{defaultList.length}）
              </ListItem>
              {defaultList.filter(() => collapseDefault).map(renderListItem)}
              <ListItem
                key={'collapse-button'}
                onClick={() => {
                  setCollapseCustom(!collapseCustom)
                }}
                className={'auth-item'}
                current={false}
              >
                <Icon type={collapseCustom ? 'arrowdown' : 'arrowup'} />
                自定义策略（{customList.length}）
              </ListItem>
              {customList.filter(() => collapseCustom).map(renderListItem)}
            </List>
          </div>
        </Col>
        <Col span={18}>
          <Card bordered style={{ height: '100%', maxHeight: '1000px' }}>
            {currentAuthItem.id ? (
              <Card.Body
                title={formatPolicyName(currentAuthItem.name)}
                operation={
                  !isInDetailpage &&
                  isOwner() && (
                    <>
                      <Button
                        type='link'
                        onClick={() => handlers.modify(currentAuthItem.id)}
                        disabled={isCurrAuthItemOwnerDefaultPrinciple}
                      >
                        {'编辑'}
                      </Button>
                      <Button
                        type='link'
                        onClick={() => handlers.delete(currentAuthItem.id)}
                        disabled={currentAuthItem.default_strategy}
                      >
                        {'删除'}
                      </Button>
                    </>
                  )
                }
              >
                <Card bordered style={{ border: 'none' }}>
                  <Form>
                    <FormItem label={'备注'}>
                      <FormText>{currentAuthItem.comment || '无备注'}</FormText>
                    </FormItem>
                  </Form>
                </Card>
                <section style={{ borderTop: '1px solid #cfd5de', margin: '20px 0' }}></section>
                {isInDetailpage ? (
                  <Card bordered style={{ border: 'none' }}>
                    <Card.Body title={'可操作资源'}>
                      <UseableResource
                        resources={{
                          namespaces: currentAuthItem?.resources?.['namespaces'],
                          services: currentAuthItem?.resources?.['services'],
                          config_groups: currentAuthItem?.resources?.config_groups,
                        }}
                      />
                    </Card.Body>
                  </Card>
                ) : (
                  <>
                    <Card bordered>
                      <Card.Body title={'用户｜用户组'}>
                        <Tabs
                          tabs={countedAuthSubjectTabs}
                          activeId={showAuthSubjectType}
                          onActive={tab => setShowAuthSubjectType(tab.id as AuthSubjectType)}
                        >
                          {currentAuthItem.principals[`${showAuthSubjectType}s`]?.length > 0 ? ( //这里加s是为了适配接口
                            currentAuthItem.principals[`${showAuthSubjectType}s`].map(userItem => {
                              return isOwner() ? (
                                <Button
                                  type='link'
                                  onClick={() => {
                                    router.navigate(
                                      `/${AUTH_SUBJECT_TYPE_MAP[showAuthSubjectType].urlKey}-detail?id=${userItem.id}`,
                                    )
                                  }}
                                  key={userItem.id}
                                  style={{ margin: '20px 10px' }}
                                >
                                  {userItem.name}({userItem.id})
                                </Button>
                              ) : (
                                <Text key={userItem.id} style={{ margin: '20px 10px', display: 'inline-block' }}>
                                  {userItem.name}({userItem.id})
                                </Text>
                              )
                            })
                          ) : (
                            <Text style={{ margin: '20px 10px' }} parent={'p'}>
                              {'暂无对应授权对象'}
                            </Text>
                          )}
                        </Tabs>
                      </Card.Body>
                    </Card>
                    <Card bordered>
                      <Card.Body title={'资源'}>
                        <Tabs
                          tabs={AuthResourceTabs}
                          activeId={showAuthResourceType}
                          onActive={tab => setShowAuthResourceType(tab.id as AuthResourceType)}
                          style={{ marginBottom: '20px' }}
                        >
                          {currentAuthItem.resources[showAuthResourceType].length === 1 &&
                          currentAuthItem.resources[showAuthResourceType][0].id === '*' ? (
                            <section style={{ margin: '20px 10px' }}>
                              {`全部${AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].text}（含后续新增）`}
                            </section>
                          ) : (
                            <Table
                              bordered
                              records={currentAuthItem.resources[showAuthResourceType]}
                              columns={[
                                {
                                  key: 'name',
                                  header: '名称',
                                  render: AUTH_RESOURCE_TYPE_MAP[showAuthResourceType].columnsRender,
                                },
                                { key: 'auth', header: '权限', render: () => '读｜写' },
                              ]}
                              addons={[scrollable({ maxHeight: '300px' }), autotip({})]}
                              style={{ marginTop: '20px' }}
                            />
                          )}
                        </Tabs>
                      </Card.Body>
                    </Card>
                  </>
                )}
              </Card.Body>
            ) : (
              <Card.Body title={'暂无选中策略'}></Card.Body>
            )}
          </Card>
        </Col>
      </Row>
    </>
  )
  const [alertVisible, setAlertVisible] = React.useState(true)
  return isInDetailpage ? (
    contentElement
  ) : (
    <BasicLayout title={'策略'} store={store} selectors={duck.selectors} header={<></>}>
      <Card>
        <Card.Body>
          <Alert
            visible={alertVisible}
            onClose={() => setAlertVisible(false)}
            extra={
              <Button type='link' onClick={() => setAlertVisible(false)}>
                关闭
              </Button>
            }
          >
            {authStatusMsg}
          </Alert>
          {contentElement}
        </Card.Body>
      </Card>
    </BasicLayout>
  )
}
