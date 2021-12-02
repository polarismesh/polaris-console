import React from "react";
import { Layout, NavMenu, Menu } from "tea-component";
import { Switch, Route, useHistory } from "react-router-dom";
const { Header, Body, Sider, Content } = Layout;
import ServicePage from "@src/polaris/service/Page";
import ServicePageDuck from "@src/polaris/service/PageDuck";
const Service = connectWithDuck(ServicePage, ServicePageDuck);

import NamespacePage from "@src/polaris/namespace/Page";
import NamespacePageDuck from "@src/polaris/namespace/PageDuck";
const Namespace = connectWithDuck(NamespacePage, NamespacePageDuck);

import ServiceDetailPage from "@src/polaris/service/detail/Page";
import ServiceDetailDuck from "@src/polaris/service/detail/PageDuck";
const ServiceDetail = connectWithDuck(ServiceDetailPage, ServiceDetailDuck);
import RouteCreatePage from "@src/polaris/service/detail/route/operations/Create";
import RouteCreateDuck from "@src/polaris/service/detail/route/operations/CreateDuck";
const RouteCreate = connectWithDuck(RouteCreatePage, RouteCreateDuck);

import RateLimitCreatePage from "@src/polaris/service/detail/limit/operations/Create";
import RateLimitDuck from "@src/polaris/service/detail/limit/operations/CreateDuck";
const RateLimit = connectWithDuck(RateLimitCreatePage, RateLimitDuck);

import CircuitBreakerPage from "@src/polaris/service/detail/circuitBreaker/operations/Create";
import CircuitBreakerDuck from "@src/polaris/service/detail/circuitBreaker/operations/CreateDuck";
const CircuitBreaker = connectWithDuck(CircuitBreakerPage, CircuitBreakerDuck);
import { MenuConfig } from "./menu";
import { connectWithDuck } from "./polaris/common/helpers";
import insertCSS from "./polaris/common/helpers/insertCSS";
import MonitorPage from "@src/polaris/monitor/Page";
import { CircuitBreakerMonitorDuck, RouteMonitorDuck, RatelimitMonitorDuck } from "@src/polaris/monitor/PageDuck";
const CircuitBreakerMonitor = connectWithDuck(MonitorPage, CircuitBreakerMonitorDuck);
const RouteMonitor = connectWithDuck(MonitorPage, RouteMonitorDuck);
const RatelimitMonitor = connectWithDuck(MonitorPage, RatelimitMonitorDuck);

export default function root() {
  const history = useHistory();
  const [selected, setSelected] = React.useState(history.location.pathname.match(/^\/(\w+)/)?.[1]);
  const getMenuItemProps = (id) => ({
    selected: selected === id,
    onClick: () => {
      setSelected(id);
      history.push(`/${id}`);
    },
  });
  return (
    <Layout>
      <Header>
        <NavMenu
          left={
            <>
              <NavMenu.Item type="logo" style={{ width: "185px" }}>
                <img src={"/static/img/logo-polaris.png"} alt="logo" style={{ height: "27px" }} />
              </NavMenu.Item>
              <NavMenu.Item></NavMenu.Item>
            </>
          }
        />
      </Header>
      <Body>
        <Sider>
          <Menu collapsable theme="dark" title={MenuConfig.title}>
            {Object.keys(MenuConfig).map((item) => {
              // return <Menu.Item title={"服务列表"} />;

              if (MenuConfig[item].isGroup) {
                const subMenuConfig = { ...MenuConfig[item] };
                return (
                  <Menu.Group title={MenuConfig[item].title}>
                    {Object.keys(subMenuConfig).map((item) => {
                      const menuConfig = subMenuConfig[item];

                      if (typeof menuConfig !== "object") {
                        return null;
                      }

                      return <Menu.Item {...menuConfig} {...getMenuItemProps(item)} />;
                    })}
                  </Menu.Group>
                );
              }
              if (typeof MenuConfig[item] !== "object") {
                return;
              }
              return <Menu.Item {...MenuConfig[item]} {...getMenuItemProps(item)} />;
            })}
          </Menu>
        </Sider>
        <Content>
          <Switch>
            <Route exact path="/" component={Service} />
            <Route exact path="/namespace" component={Namespace} />
            <Route exact path="/service" component={Service} />
            <Route exact path="/service-detail" component={ServiceDetail} />
            <Route exact path="/route-create" component={RouteCreate} />
            <Route exact path="/ratelimit-create" component={RateLimit} />
            <Route exact path="/circuitBreaker-create" component={CircuitBreaker} />
            <Route exact path="/circuitBreaker-monitor" component={CircuitBreakerMonitor} />
            <Route exact path="/route-monitor" component={RouteMonitor} />
            <Route exact path="/ratelimit-monitor" component={RatelimitMonitor} />
          </Switch>
        </Content>
      </Body>
    </Layout>
  );
}
