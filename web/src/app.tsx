import React, { useCallback } from 'react'
import { Layout, NavMenu, Menu, List, notification } from 'tea-component'
import { Switch, Route, useHistory } from 'react-router-dom'
const { Header, Body, Sider, Content } = Layout
import { MenuConfig, MenuItemConfig } from './menu'
import { connectWithDuck } from './polaris/common/helpers'
import MonitorPage from '@src/polaris/monitor/Page'
import FlowMonitorDuck from '@src/polaris/monitor/FlowMonitorDuck'

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

import FileGroupDetailPage from '@src/polaris/configuration/fileGroup/detail/Page'
import FileGroupDetailPageDuck from '@src/polaris/configuration/fileGroup/detail/PageDuck'
const FileGroupDetail = connectWithDuck(FileGroupDetailPage, FileGroupDetailPageDuck)

import ConfigurationPage from '@src/polaris/configuration/Page'
import ConfigurationPageDuck from '@src/polaris/configuration/PageDuck'
const Configuration = connectWithDuck(ConfigurationPage, ConfigurationPageDuck)

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

import { userLogout, getUin, getLoginName, handleInfo } from './polaris/common/util/common'
import router from './polaris/common/util/router'

import ServiceAliasPage from '@src/polaris/serviceAlias/Page'
import ServiceAliasPageDuck from '@src/polaris/serviceAlias/PageDuck'
import { cacheCheckAuth, describeAuthStatus } from './polaris/auth/model'
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

import AlertPage from '@src/polaris/alert/Page'
import AlertPageDuck from '@src/polaris/alert/PageDuck'
const Alert = connectWithDuck(AlertPage, AlertPageDuck)

import AlertDetailPage from '@src/polaris/alert/detail/Page'
import AlertDetailPageDuck from '@src/polaris/alert/detail/PageDuck'
const AlertDetail = connectWithDuck(AlertDetailPage, AlertDetailPageDuck)

const FlowMonitor = connectWithDuck(MonitorPage, FlowMonitorDuck)
import CircuitBreakerPage from '@src/polaris/administration/breaker/Page'
import CircuitBreakerPageDuck from '@src/polaris/administration/breaker/PageDuck'
const CircuitBreaker = connectWithDuck(CircuitBreakerPage, CircuitBreakerPageDuck)

import CircuitBreakerCreatePage from '@src/polaris/administration/breaker/operations/Create'
import CircuitBreakerCreatePageDuck from '@src/polaris/administration/breaker/operations/CreateDuck'
const CircuitBreakerCreate = connectWithDuck(CircuitBreakerCreatePage, CircuitBreakerCreatePageDuck)

import FaultDetectCreatePage from '@src/polaris/administration/breaker/faultDetect/operations/Create'
import FaultDetectCreatePageDuck from '@src/polaris/administration/breaker/faultDetect/operations/CreateDuck'
const FaultDetectCreate = connectWithDuck(FaultDetectCreatePage, FaultDetectCreatePageDuck)

import RegistryMonitorPage from '@src/polaris/monitor/registryMonitor/Page'
import RegistryMonitorPageDuck from '@src/polaris/monitor/registryMonitor/PageDuck'
const RegistryMonitor = connectWithDuck(RegistryMonitorPage, RegistryMonitorPageDuck)
import { cacheCheckFeature, FeatureDisplayType } from './polaris/common/util/checkFeature'
import insertCSS from './polaris/common/helpers/insertCSS'
import ServiceMonitorPage from '@src/polaris/monitor/serviceMonitor/Page'
import ServiceMonitorPageDuck from '@src/polaris/monitor/serviceMonitor/PageDuck'
const ServiceMonitor = connectWithDuck(ServiceMonitorPage, ServiceMonitorPageDuck)

insertCSS(
  `menu`,
  `
  .block-menu-item .tea-menu__item{
    cursor: not-allowed !important;
    background-color: #979797 !important;
  }
  .block-menu-item .tea-menu__item::hover{
    cursor: not-allowed !important;
    background-color: #979797 !important;
  }
`,
)

export default function root() {
  const history = useHistory()
  const [selected, setSelected] = React.useState(history.location.pathname.replace('/', '') || 'service')
  const getMenuItemProps = id => ({
    selected: selected === id,
    onClick: () => {
      setSelected(id)
      history.push(`/${id}`)
    },
  })

  const [feature, setFeature] = React.useState([])
  const fetchFeature = useCallback(async () => {
    const feature = await cacheCheckFeature()
    setFeature(feature)
  }, [])
  React.useEffect(() => {
    fetchFeature()
  }, [fetchFeature])
  function recursiveRenderMenuItem(menuItem: MenuItemConfig) {
    if (!menuItem) {
      return <noscript />
    }

    // if (menuItem.id === 'policy' && !authOpen) {
    //   return <noscript />
    // }
    const currentFeature = feature?.find(item => item.name === menuItem.featureKey)
    if (menuItem.featureKey && currentFeature) {
      if (currentFeature.display === FeatureDisplayType.hidden) {
        return <noscript />
      }
      if (currentFeature.display === FeatureDisplayType.block) {
        return (
          <Menu.Item
            title={menuItem.title}
            icon={menuItem.icon}
            className={'block-menu-item'}
            onClick={() => {
              notification.warning({ description: handleInfo(currentFeature.tip) || '暂不支持此功能' })
            }}
          ></Menu.Item>
        )
      }
    }
    return menuItem.subMenus ? (
      <Menu.SubMenu title={menuItem.title} icon={menuItem.icon} key={menuItem.id} defaultOpened>
        {menuItem.subMenus.map(o => recursiveRenderMenuItem(o))}
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
                  overlay={close => (
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
              {MenuConfig.subMenus.map(o => {
                if (o.subMenus) {
                  const allHidden = o.subMenus.every(subMenuItem => {
                    const currentFeature = feature?.find(item => item.name === subMenuItem.featureKey)
                    return currentFeature?.display === FeatureDisplayType.hidden
                  })
                  if (allHidden) {
                    return <noscript />
                  }
                  return (
                    <Menu.Group key={o.id} title={o.title}>
                      {o.subMenus.map(item => recursiveRenderMenuItem(item))}
                    </Menu.Group>
                  )
                } else {
                  return recursiveRenderMenuItem(o)
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
              <Route exact path='/flow-monitor' component={FlowMonitor} />
              <Route exact path='/configuration' component={Configuration} />
              <Route exact path='/filegroup-detail' component={FileGroupDetail} />
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
              <Route exact path='/alert' component={Alert} />
              <Route exact path='/alert-detail' component={AlertDetail} />
              <Route exact path='/circuitBreaker-create' component={CircuitBreakerCreate} />
              <Route exact path='/circuitBreaker' component={CircuitBreaker} />
              <Route exact path='/faultDetect-create' component={FaultDetectCreate} />
              <Route exact path='/registry-monitor' component={RegistryMonitor} />
              <Route exact path='/service-monitor' component={ServiceMonitor} />
            </Switch>
          </Content>
        </Body>
      </Layout>
    </>
  )
}
