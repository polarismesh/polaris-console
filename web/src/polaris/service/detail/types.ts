export enum TAB {
  Info = 'info',
  Instance = 'instance',
  Route = 'router',
  AccessLimit = 'ratelimiter',
  CircuitBreaker = 'circuitbreaker',
  Interface = 'interface',
}
export const TAB_LABLES = {
  [TAB.Info]: '服务信息',
  [TAB.Instance]: '服务实例',
  [TAB.Interface]: '接口列表',
  [TAB.Route]: '路由规则',
  [TAB.AccessLimit]: '限流规则',
  [TAB.CircuitBreaker]: '熔断规则',
}

export interface ComposedId {
  name: string
  namespace: string
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  OPTION = 'OPTION',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  CONNECT = 'CONNECT',
  TRACE = 'TRACE',
}
export const MethodOptions = Object.keys(HttpMethod).map(item => ({ text: item, value: item }))

export enum Protocol {
  HTTP = 'HTTP',
  TCP = 'TCP',
  UDP = 'UDP',
}
export const ProtocolOptions = Object.keys(Protocol).map(item => ({ text: item, value: item }))
