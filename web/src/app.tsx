import React, { useCallback } from 'react'
import { Layout, NavMenu, Menu, List } from 'tea-component'
import { Switch, Route, useHistory } from 'react-router-dom'
const { Header, Body, Sider, Content } = Layout
import { MenuConfig, MenuItemConfig } from './menu'
import { connectWithDuck } from './polaris/common/helpers'
import MonitorPage from '@src/polaris/monitor/Page'
import { CircuitBreakerMonitorDuck, RouteMonitorDuck, RatelimitMonitorDuck } from '@src/polaris/monitor/PageDuck'

import ServicePage from '@src/polaris/service/Page'
import ServicePageDuck from '@src/polaris/service/PageDuck'
const Service = connectWithDuck(ServicePage, ServicePageDuck)

import NamespacePage from '@src/polaris/namespace/Page'
import NamespacePageDuck from '@src/polaris/namespace/PageDuck'
const Namespace = connectWithDuck(NamespacePage, NamespacePageDuck)

import ServiceDetailPage from '@src/polaris/service/detail/Page'
import ServiceDetailDuck from '@src/polaris/service/detail/PageDuck'
const ServiceDetail = connectWithDuck(ServiceDetailPage, ServiceDetailDuck)
import RouteCreatePage from '@src/polaris/service/detail/route/operations/Create'
import RouteCreateDuck from '@src/polaris/service/detail/route/operations/CreateDuck'
const RouteCreate = connectWithDuck(RouteCreatePage, RouteCreateDuck)

import CircuitBreakerPage from '@src/polaris/service/detail/circuitBreaker/operations/Create'
import CircuitBreakerDuck from '@src/polaris/service/detail/circuitBreaker/operations/CreateDuck'
const CircuitBreaker = connectWithDuck(CircuitBreakerPage, CircuitBreakerDuck)

import FileGroupPage from '@src/polaris/configuration/fileGroup/Page'
import FileGroupPageDuck from '@src/polaris/configuration/fileGroup/PageDuck'
const FileGroup = connectWithDuck(FileGroupPage, FileGroupPageDuck)

import FileGroupDetailPage from '@src/polaris/configuration/fileGroup/detail/Page'
import FileGroupDetailPageDuck from '@src/polaris/configuration/fileGroup/detail/PageDuck'
const FileGroupDetail = connectWithDuck(FileGroupDetailPage, FileGroupDetailPageDuck)

import FileReleasePage from '@src/polaris/configuration/releaseHistory/Page'
import FileReleasePageDuck from '@src/polaris/configuration/releaseHistory/PageDuck'
const FileRelease = connectWithDuck(FileReleasePage, FileReleasePageDuck)

const CircuitBreakerMonitor = connectWithDuck(MonitorPage, CircuitBreakerMonitorDuck)
const RouteMonitor = connectWithDuck(MonitorPage, RouteMonitorDuck)
const RatelimitMonitor = connectWithDuck(MonitorPage, RatelimitMonitorDuck)

import UserPage from '@src/polaris/auth/user/Page'
import UserPageDuck from '@src/polaris/auth/user/PageDuck'
const User = connectWithDuck(UserPage, UserPageDuck)

import UserDetailPage from '@src/polaris/auth/user/detail/Page'
import UserDetailPageDuck from '@src/polaris/auth/user/detail/PageDuck'
const UserDetail = connectWithDuck(UserDetailPage, UserDetailPageDuck as any)

import UserGroupPage from '@src/polaris/auth/userGroup/Page'
import UserGroupPageDuck from '@src/polaris/auth/userGroup/PageDuck'
const UserGroup = connectWithDuck(UserGroupPage, UserGroupPageDuck)

import UserGroupDetailPage from '@src/polaris/auth/userGroup/detail/Page'
import UserGroupDetailPageDuck from '@src/polaris/auth/userGroup/detail/PageDuck'
const UserGroupDetail = connectWithDuck(UserGroupDetailPage, UserGroupDetailPageDuck as any)

import PolicyPage from '@src/polaris/auth/policy/Page'
import PolicyPageDuck from '@src/polaris/auth/policy/PageDuck'
const Policy = connectWithDuck(PolicyPage, PolicyPageDuck as any)

import PolicyCreatePage from '@src/polaris/auth/policy/operation/Create'
import PolicyCreatePageDuck from '@src/polaris/auth/policy/operation/CreateDuck'
const PolicyCreate = connectWithDuck(PolicyCreatePage, PolicyCreatePageDuck as any)

import { userLogout, getUin, getLoginName } from './polaris/common/util/common'
import router from './polaris/common/util/router'

import ServiceAliasPage from '@src/polaris/serviceAlias/Page'
import ServiceAliasPageDuck from '@src/polaris/serviceAlias/PageDuck'
import { cacheCheckAuth } from './polaris/auth/model'
const ServiceAlias = connectWithDuck(ServiceAliasPage, ServiceAliasPageDuck)

import TestEnvRoutePage from '@src/polaris/administration/dynamicRoute/testEnvRoute/Page'
import GrayPublishPage from '@src/polaris/administration/dynamicRoute/graypublish/Page'

import AccessLimitingPage from '@src/polaris/administration/accessLimiting/Page'
import AccessLimitingPageDuck from '@src/polaris/administration/accessLimiting/PageDuck'
const AccessLimiting = connectWithDuck(AccessLimitingPage, AccessLimitingPageDuck)

import AccessLimitingDetailPage from '@src/polaris/administration/accessLimiting/detail/Page'
import AccessLimitingDetailPageDuck from '@src/polaris/administration/accessLimiting/detail/PageDuck'
const AccessLimitingDetail = connectWithDuck(AccessLimitingDetailPage, AccessLimitingDetailPageDuck)

import LimitRuleCreatePage from '@src/polaris/administration/accessLimiting/operations/Create'
import LimitRuleCreatePageDuck from '@src/polaris/administration/accessLimiting/operations/CreateDuck'
const LimitRuleCreate = connectWithDuck(LimitRuleCreatePage, LimitRuleCreatePageDuck)

import CustomRoutePage from '@src/polaris/administration/dynamicRoute/customRoute/Page'
import CustomRoutePageDuck from '@src/polaris/administration/dynamicRoute/customRoute/PageDuck'
const CustomRoute = connectWithDuck(CustomRoutePage, CustomRoutePageDuck)

import CustomRouteCreatePage from '@src/polaris/administration/dynamicRoute/customRoute/operations/Create'
import CustomRouteCreatePageDuck from '@src/polaris/administration/dynamicRoute/customRoute/operations/CreateDuck'
const CustomRouteCreate = connectWithDuck(CustomRouteCreatePage, CustomRouteCreatePageDuck as any)

import CustomRouteDetailPage from '@src/polaris/administration/dynamicRoute/customRoute/detail/Page'
import CustomRouteDetailPageDuck from '@src/polaris/administration/dynamicRoute/customRoute/detail/PageDuck'
const CustomRouteDetail = connectWithDuck(CustomRouteDetailPage, CustomRouteDetailPageDuck as any)

import AuditPage from '@src/polaris/service/Page'
import AuditPageDuck from '@src/polaris/service/PageDuck'
const Audit = connectWithDuck(AuditPage, AuditPageDuck)

import EventPage from '@src/polaris/service/Page'
import EventPageDuck from '@src/polaris/service/PageDuck'
const Event = connectWithDuck(EventPage, EventPageDuck)

export default function root() {
  const history = useHistory()
  const [selected, setSelected] = React.useState(history.location.pathname.match(/^\/(\w+)/)?.[1] || 'service')
  const getMenuItemProps = (id) => ({
    selected: selected === id,
    onClick: () => {
      setSelected(id)
      history.push(`/${id}`)
    },
  })
  const [authOpen, setAuthOpen] = React.useState(null)
  const fetchAuth = useCallback(async () => {
    const authOpen = await cacheCheckAuth({})
    setAuthOpen(authOpen)
  }, [])
  React.useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  function recursiveRenderMenuItem(menuItem: MenuItemConfig) {
    if (!menuItem) {
      return <noscript />
    }

    if (menuItem.id === 'policy' && !authOpen) {
      return <noscript />
    }

    return menuItem.subMenus ? (
      <Menu.SubMenu title={menuItem.title} icon={menuItem.icon} key={menuItem.id}>
        {menuItem.subMenus.map((o) => recursiveRenderMenuItem(o))}
      </Menu.SubMenu>
    ) : (
      <Menu.Item
        title={menuItem.title}
        icon={menuItem.icon}
        {...getMenuItemProps(menuItem.id)}
        key={menuItem.id}
      ></Menu.Item>
    )
  }
  return (
    <>
      <Layout>
        <Header>
          <NavMenu
            left={
              <>
                <NavMenu.Item type='logo' style={{ width: '185px' }}>
                  <img src={'static/img/logo-polaris.png'} alt='logo' style={{ height: '27px' }} />
                </NavMenu.Item>
                <NavMenu.Item></NavMenu.Item>
              </>
            }
            right={
              <>
                <NavMenu.Item type='default'>
                  <a
                    href={
                      'https://polarismesh.cn/docs/%E5%8C%97%E6%9E%81%E6%98%9F%E6%98%AF%E4%BB%80%E4%B9%88/%E7%AE%80%E4%BB%8B'
                    }
                    target={'_blank'}
                    rel='noreferrer'
                  >
                    文档
                  </a>
                </NavMenu.Item>
                <NavMenu.Item
                  type='dropdown'
                  overlay={(close) => (
                    <List type='option'>
                      <List.Item
                        onClick={() => {
                          router.navigate(`/user-detail?id=${getUin()}`)
                          close()
                        }}
                      >
                        账号信息
                      </List.Item>
                      <List.Item
                        onClick={() => {
                          userLogout()
                          close()
                        }}
                      >
                        退出
                      </List.Item>
                    </List>
                  )}
                >
                  {getLoginName()}
                </NavMenu.Item>
              </>
            }
          />
        </Header>
        <Body>
          <Sider>
            <Menu collapsable theme='dark' title={MenuConfig.title}>
              {MenuConfig.subMenus.map((o) => {
                if (o.subMenus) {
                  return (
                    <Menu.Group key={o.id} title={o.title}>
                      {o.subMenus.map((item) => recursiveRenderMenuItem(item))}
                    </Menu.Group>
                  )
                } else {
                  return <Menu.Item title={o.title} icon={o.icon} {...getMenuItemProps(o.id)} key={o.id}></Menu.Item>
                }
              })}
            </Menu>
          </Sider>
          <Content>
            <Switch>
              <Route exact path='/' component={Service} />
              <Route exact path='/namespace' component={Namespace} />
              <Route exact path='/service' component={Service} />
              <Route exact path='/service-detail' component={ServiceDetail} />
              <Route exact path='/route-create' component={RouteCreate} />
              <Route exact path='/accesslimit-create' component={LimitRuleCreate} />
              <Route exact path='/circuitBreaker-create' component={CircuitBreaker} />
              <Route exact path='/circuitBreaker-monitor' component={CircuitBreakerMonitor} />
              <Route exact path='/route-monitor' component={RouteMonitor} />
              <Route exact path='/ratelimit-monitor' component={RatelimitMonitor} />
              <Route exact path='/filegroup' component={FileGroup} />
              <Route exact path='/filegroup-detail' component={FileGroupDetail} />
              <Route exact path='/file-release-history' component={FileRelease} />
              <Route exact path='/user' component={User} />
              <Route exact path='/usergroup' component={UserGroup} />
              <Route exact path='/policy' component={Policy} />
              <Route exact path='/user-detail' component={UserDetail} />
              <Route exact path='/usergroup-detail' component={UserGroupDetail} />
              <Route exact path='/policy-create' component={PolicyCreate} />
              <Route exact path='/alias' component={ServiceAlias} />
              <Route exact path='/test-env-route' component={TestEnvRoutePage} />
              <Route exact path='/gray-publish' component={GrayPublishPage} />
              <Route exact path='/accesslimit' component={AccessLimiting} />
              <Route exact path='/accesslimit-detail' component={AccessLimitingDetail} />
              <Route exact path='/custom-route' component={CustomRoute} />
              <Route exact path='/custom-route-create' component={CustomRouteCreate} />
              <Route exact path='/custom-route-detail' component={CustomRouteDetail} />
              <Route exact path='/audit' component={Audit} />
              <Route exact path='/event' component={Event} />
            </Switch>
          </Content>
        </Body>
      </Layout>
    </>
  )
}
