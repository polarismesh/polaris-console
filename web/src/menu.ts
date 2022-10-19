import buildConfig from './buildConfig'
import { t } from 'i18next';
export interface MenuItemConfig {
  id: string
  title: string
  icon: string
  subMenus: MenuItemConfig[]
}

export const MenuConfig: MenuItemConfig = {
  id: 'polaris',
  title: t('北极星服务治理'),
  icon: null,
  subMenus: [
    {
      id: 'namespace',
      title: t('命名空间'),
      icon: '/static/img/namespace.svg',
      subMenus: null,
    },
    {
      id: 'serviceManage',
      title: t('注册中心'),
      icon: null,
      subMenus: [
        {
          id: 'service',
          title: t('服务列表'),
          icon: '/static/img/service.svg',
          subMenus: null,
        },
        {
          id: 'alias',
          title: t('服务别名'),
          icon: '/static/img/service.svg',
          subMenus: null,
        },
      ],
    },
    {
      id: 'administration',
      title: t('服务网格'),
      icon: '',
      subMenus: [
        {
          id: 'dynamic-route',
          title: t('动态路由'),
          icon: '/static/img/dynamic-route.svg',
          subMenus: [
            {
              id: 'custom-route',
              title: t('自定义路由'),
              icon: '/static/img/dynamic-route.svg',
              subMenus: null,
            },
            {
              id: 'test-env-route',
              title: t('测试环境路由'),
              icon: '/static/img/dynamic-route.svg',
              subMenus: null,
            },
            {
              id: 'gray-publish',
              title: t('灰度发布'),
              icon: '/static/img/dynamic-route.svg',
              subMenus: null,
            },
          ],
        },
        {
          id: 'accesslimit',
          title: t('访问限流'),
          icon: '/static/img/dynamic-route.svg',
          subMenus: null,
        },
      ],
    },
    buildConfig.configuration && {
      id: 'configuration',
      title: t('配置中心'),
      icon: null,
      subMenus: [
        {
          id: 'filegroup',
          title: t('配置分组'),
          icon: '/static/img/route-monitor.svg',
          subMenus: null,
        },
        {
          id: 'file-release-history',
          title: t('发布历史'),
          icon: '/static/img/route-monitor.svg',
          subMenus: null,
        },
      ],
    },
    {
      id: 'observability',
      title: t('可观测性'),
      icon: null,
      subMenus: [
        {
          id: 'route-monitor',
          title: t('路由监控'),
          icon: '/static/img/circuit-monitor.svg',
          subMenus: null,
        },
        {
          id: 'circuitBreaker-monitor',
          title: t('熔断监控'),
          icon: '/static/img/circuit-monitor.svg',
          subMenus: null,
        },
        {
          id: 'ratelimit-monitor',
          title: t('限流监控'),
          icon: '/static/img/circuit-monitor.svg',
          subMenus: null,
        },
      ],
    },
    {
      id: 'auth',
      title: t('权限控制'),
      icon: null,
      subMenus: [
        {
          id: 'user',
          title: t('用户'),
          icon: '/static/img/user-icon.svg',
          subMenus: null,
        },
        {
          id: 'usergroup',
          title: t('用户组'),
          icon: '/static/img/user-icon.svg',
          subMenus: null,
        },
        {
          id: 'policy',
          title: t('策略'),
          icon: '/static/img/user-icon.svg',
          subMenus: null,
        },
      ],
    },
  ],
}
