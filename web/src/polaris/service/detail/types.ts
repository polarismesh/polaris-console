import { t } from 'i18next'
export enum TAB {
  Info = 'info',
  Instance = 'instance',
  Route = 'route',
  AccessLimit = 'AccessLimit',
  CircuitBreaker = 'circuitBreaker',
}
export const TAB_LABLES = {
  [TAB.Info]: t('服务信息'),
  [TAB.Instance]: t('服务实例'),
  [TAB.Route]: t('路由规则'),
  [TAB.AccessLimit]: t('限流规则'),
  [TAB.CircuitBreaker]: t('熔断规则'),
}

export interface ComposedId {
  name: string
  namespace: string
}
