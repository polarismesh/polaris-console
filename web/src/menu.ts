import buildConfig from './buildConfig'
export interface MenuItemConfig {
  id: string
  title: string
  icon: string
  subMenus: MenuItemConfig[]
}

export const MenuConfig: MenuItemConfig = {
  id: 'polaris',
  title: '北极星服务治理',
  icon: null,
  subMenus: [
    {
      id: 'namespace',
      title: '命名空间',
      icon: 'static/img/namespace.svg',
      subMenus: null,
    },
    {
      id: 'serviceManage',
      title: '注册中心',
      icon: null,
      subMenus: [
        {
          id: 'service',
          title: '服务列表',
          icon: 'static/img/service.svg',
          subMenus: null,
        },
        {
          id: 'alias',
          title: '服务别名',
          icon: 'static/img/service.svg',
          subMenus: null,
        },
      ],
    },
    {
      id: 'administration',
      title: '服务网格',
      icon: '',
      subMenus: [
        {
          id: 'dynamic-route',
          title: '动态路由',
          icon: 'static/img/dynamic-route.svg',
          subMenus: [
            {
              id: 'custom-route',
              title: '自定义路由',
              icon: 'static/img/dynamic-route.svg',
              subMenus: null,
            },
            {
              id: 'test-env-route',
              title: '测试环境路由',
              icon: 'static/img/dynamic-route.svg',
              subMenus: null,
            },
            {
              id: 'gray-publish',
              title: '灰度发布',
              icon: 'static/img/dynamic-route.svg',
              subMenus: null,
            },
          ],
        },
        {
          id: 'accesslimit',
          title: '访问限流',
          icon: 'static/img/dynamic-route.svg',
          subMenus: null,
        },
      ],
    },
    buildConfig.configuration && {
      id: 'configuration',
      title: '配置中心',
      icon: null,
      subMenus: [
        {
          id: 'filegroup',
          title: '配置分组',
          icon: 'static/img/route-monitor.svg',
          subMenus: null,
        },
        {
          id: 'file-release-history',
          title: '发布历史',
          icon: 'static/img/route-monitor.svg',
          subMenus: null,
        },
      ],
    },
    {
      id: 'observability',
      title: '可观测性',
      icon: null,
      subMenus: [
        {
          id: 'route-monitor',
          title: '路由监控',
          icon: 'static/img/circuit-monitor.svg',
          subMenus: null,
        },
        {
          id: 'circuitBreaker-monitor',
          title: '熔断监控',
          icon: 'static/img/circuit-monitor.svg',
          subMenus: null,
        },
        {
          id: 'ratelimit-monitor',
          title: '限流监控',
          icon: 'static/img/circuit-monitor.svg',
          subMenus: null,
        },
        {
          id: 'audit',
          title: '操作记录',
          icon: 'static/img/circuit-monitor.svg',
          subMenus: null,
        },
        {
          id: 'event',
          title: '事件中心',
          icon: 'static/img/circuit-monitor.svg',
          subMenus: null,
        },
        {
          id: 'alert',
          title: '业务监控',
          icon: 'static/img/circuit-monitor.svg',
          subMenus: null,
        },
      ],
    },
    {
      id: 'auth',
      title: '权限控制',
      icon: null,
      subMenus: [
        {
          id: 'user',
          title: '用户',
          icon: 'static/img/user-icon.svg',
          subMenus: null,
        },
        {
          id: 'usergroup',
          title: '用户组',
          icon: 'static/img/user-icon.svg',
          subMenus: null,
        },
        {
          id: 'policy',
          title: '策略',
          icon: 'static/img/user-icon.svg',
          subMenus: null,
        },
      ],
    },
  ],
}
