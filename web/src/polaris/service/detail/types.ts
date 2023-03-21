import i18n from '@src/polaris/common/util/i18n'

export enum TAB {
  Info = 'info',
  Instance = 'instance',
  Route = 'route',
  AccessLimit = 'AccessLimit',
  CircuitBreaker = 'circuitBreaker',
}
export const TAB_LABLES = {
  [TAB.Info]: i18n.t('服务信息'),
  [TAB.Instance]: i18n.t('服务实例'),
  [TAB.Route]: i18n.t('路由规则'),
  [TAB.AccessLimit]: i18n.t('限流规则'),
  [TAB.CircuitBreaker]: i18n.t('熔断规则'),
}

export interface ComposedId {
  name: string
  namespace: string
}
