export const MenuConfig = {
  title: '服务治理中心',
  serviceManage: {
    isGroup: true,
    title: '服务管理',
    service: {
      title: '服务列表',
      icon: ['/static/img/service.svg', '/static/img/service.svg'],
    },
    namespace: {
      title: '命名空间',
      icon: ['/static/img/namespace.svg', '/static/img/namespace.svg'],
    },
  },
  configuration: {
    isGroup: true,
    title: '配置中心',
    filegroup: {
      title: '配置分组',
      icon: ['/static/img/route-monitor.svg', '/static/img/route-monitor.svg'],
    },
    'file-release-history': {
      title: '发布历史',
      icon: ['/static/img/circuit-monitor.svg', '/static/img/circuit-monitor.svg'],
    },
  },
  auth: {
    isGroup: true,
    title: '权限控制',
    user: {
      title: '用户',
      icon: ['/static/img/route-monitor.svg', '/static/img/route-monitor.svg'],
    },
    usergroup: {
      title: '用户组',
      icon: ['/static/img/circuit-monitor.svg', '/static/img/circuit-monitor.svg'],
    },
    policy: {
      title: '策略',
      icon: ['/static/img/circuit-monitor.svg', '/static/img/circuit-monitor.svg'],
    },
  },
  observability: {
    isGroup: true,
    title: '可观测性',
    'route-monitor': {
      title: '路由监控',
      icon: ['/static/img/route-monitor.svg', '/static/img/route-monitor.svg'],
    },
    'circuitBreaker-monitor': {
      title: '熔断监控',
      icon: ['/static/img/circuit-monitor.svg', '/static/img/circuit-monitor.svg'],
    },
    'ratelimit-monitor': {
      title: '限流监控',
      icon: ['/static/img/limit-monitor.svg', '/static/img/limit-monitor.svg'],
    },
  },
}
