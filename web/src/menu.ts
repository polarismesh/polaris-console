export const MenuConfig = {
  title: "服务治理中心",
  serviceManage: {
    isGroup: true,
    title: "服务管理",
    service: {
      title: "服务列表",
      icon: ["/static/img/service.svg", "/static/img/service.svg"],
    },
  },
  observability: {
    isGroup: true,
    title: "可观测性",
    "route-monitor": {
      title: "路由监控",
      icon: ["/static/img/route-monitor.svg", "/static/img/route-monitor.svg"],
    },
    "circuitBreaker-monitor": {
      title: "熔断监控",
      icon: [
        "/static/img/circuit-monitor.svg",
        "/static/img/circuit-monitor.svg",
      ],
    },
    "ratelimit-monitor": {
      title: "限流监控",
      icon: ["/static/img/limit-monitor.svg", "/static/img/limit-monitor.svg"],
    },
  },
};
