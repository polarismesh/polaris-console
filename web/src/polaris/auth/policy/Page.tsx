import * as React from 'react'
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
} from 'tea-component'
import { autotip, scrollable } from 'tea-component/lib/table/addons'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { isOwner } from '@src/polaris/common/util/common'
import router from '@src/polaris/common/util/router'
import BasicLayout from '@src/polaris/common/components/BaseLayout'
import { AuthStrategy } from '../model'

export enum AuthSubjectType {
  USER = 'users',
  USERGROUP = 'groups',
}
export enum AuthResourceType {
  NAMESPACE = 'namespaces',
  SERVICE = 'services',
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
  [AuthResourceType.SERVICE]: { text: '服务', columnsRender: x => `${x.name}（${x.namespace}）` },
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

`,
)
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

  const handlers = getHandlers(props)
  const isInDetailpage = !!composedId?.principalId
  const countedAuthSubjectTabs = AuthSubjectTabs.map(item => ({
    ...item,
    label: `${item.label}(${currentAuthItem?.principals?.[item.id]?.length ?? 0})`,
  }))
  const defaultList = authList.filter(item => item.default_strategy)
  const customList = authList.filter(item => !item.default_strategy)
  const renderListItem = (item: AuthStrategy) => {
    return (
      <ListItem
        key={item.id}
        onClick={() => {
          handlers.fetchCurrentAuthItem(item.id)
        }}
        className={'auth-item'}
        current={item.id === currentAuthItem.id}
      >
        <Justify
          left={
            <Text overflow tooltip={item.name} reset>
              {item.name}
            </Text>
          }
          right={
            <Dropdown button={<Button type='icon' icon='more' />} appearance='pure'>
              <List type='option'>
                <ListItem onClick={() => handlers.modify(item.id)}>
                  <Text> {'编辑'}</Text>
                </ListItem>
                <ListItem onClick={() => handlers.delete(item.id)} disabled={item.default_strategy}>
                  {'删除'}
                </ListItem>
              </List>
            </Dropdown>
          }
        ></Justify>
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
          <section style={{ padding: '10px', backgroundColor: '#f9f9f9', height: '100%', maxHeight: '1000px' }}>
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
            </List>
            <List type={'option'} style={{ maxHeight: '50%' }}>
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
          </section>
        </Col>
        <Col span={18}>
          <Card bordered style={{ height: '100%', maxHeight: '1000px' }}>
            {currentAuthItem.id ? (
              <Card.Body
                title={currentAuthItem.name}
                operation={
                  !isInDetailpage &&
                  isOwner() && (
                    <>
                      <Button type='link' onClick={() => handlers.modify(currentAuthItem.id)}>
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
                <Card bordered>
                  <Card.Body>
                    <Text>{currentAuthItem.comment || '无备注'}</Text>
                  </Card.Body>
                </Card>
                <Card bordered>
                  <Card.Body title={'用户｜用户组'}>
                    <Tabs
                      tabs={countedAuthSubjectTabs}
                      activeId={showAuthSubjectType}
                      onActive={tab => setShowAuthSubjectType(tab.id as AuthSubjectType)}
                    >
                      {currentAuthItem.principals[showAuthSubjectType]?.length > 0 ? (
                        currentAuthItem.principals[showAuthSubjectType].map(userItem => {
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
              </Card.Body>
            ) : (
              <Card.Body title={'暂无选中策略'}></Card.Body>
            )}
          </Card>
        </Col>
      </Row>
    </>
  )
  return isInDetailpage ? (
    contentElement
  ) : (
    <BasicLayout title={'策略'} store={store} selectors={duck.selectors} header={<></>}>
      {contentElement}
    </BasicLayout>
  )
}
