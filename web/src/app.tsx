import React from 'react'
import { Layout, NavMenu, Menu } from 'tea-component'
import { Switch, Route, useHistory } from 'react-router-dom'
const { Header, Body, Sider, Content } = Layout
import { MenuConfig } from './menu'
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

import RateLimitCreatePage from '@src/polaris/service/detail/limit/operations/Create'
import RateLimitDuck from '@src/polaris/service/detail/limit/operations/CreateDuck'
const RateLimit = connectWithDuck(RateLimitCreatePage, RateLimitDuck)

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

export default function root() {
  const history = useHistory()
  const [selected, setSelected] = React.useState(history.location.pathname.match(/^\/(\w+)/)?.[1])
  const getMenuItemProps = id => ({
    selected: selected === id,
    onClick: () => {
      setSelected(id)
      history.push(`/${id}`)
    },
  })
  return (
    <Layout>
      <Header>
        <NavMenu
          left={
            <>
              <NavMenu.Item type='logo' style={{ width: '185px' }}>
                <img src={'/static/img/logo-polaris.png'} alt='logo' style={{ height: '27px' }} />
              </NavMenu.Item>
              <NavMenu.Item></NavMenu.Item>
            </>
          }
          right={
            <NavMenu.Item type='default'>
              <a
                href={
                  'https://polarismesh.cn/zh/doc/%E7%AE%80%E4%BB%8B/%E5%8C%97%E6%9E%81%E6%98%9F%E6%98%AF%E4%BB%80%E4%B9%88.html#%E5%8C%97%E6%9E%81%E6%98%9F%E6%98%AF%E4%BB%80%E4%B9%88'
                }
                target={'_blank'}
                rel='noreferrer'
              >
                文档
              </a>
            </NavMenu.Item>
          }
        />
      </Header>
      <Body>
        <Sider>
          <Menu collapsable theme='dark' title={MenuConfig.title}>
            {Object.keys(MenuConfig).map((item, index) => {
              // return <Menu.Item title={"服务列表"} />;

              if (MenuConfig[item].isGroup) {
                const subMenuConfig = { ...MenuConfig[item] }
                return (
                  <Menu.Group title={MenuConfig[item].title}>
                    {Object.keys(subMenuConfig).map(item => {
                      const menuConfig = subMenuConfig[item]

                      if (typeof menuConfig !== 'object') {
                        return null
                      }

                      return <Menu.Item key={index} {...menuConfig} {...getMenuItemProps(item)} />
                    })}
                  </Menu.Group>
                )
              }
              if (typeof MenuConfig[item] !== 'object') {
                return
              }
              return <Menu.Item key={index} {...MenuConfig[item]} {...getMenuItemProps(item)} />
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
            <Route exact path='/ratelimit-create' component={RateLimit} />
            <Route exact path='/circuitBreaker-create' component={CircuitBreaker} />
            <Route exact path='/circuitBreaker-monitor' component={CircuitBreakerMonitor} />
            <Route exact path='/route-monitor' component={RouteMonitor} />
            <Route exact path='/ratelimit-monitor' component={RatelimitMonitor} />
            <Route exact path='/filegroup' component={FileGroup} />
            <Route exact path='/filegroup-detail' component={FileGroupDetail} />
            <Route exact path='/file-release-history' component={FileRelease} />
          </Switch>
        </Content>
      </Body>
    </Layout>
  )
}
