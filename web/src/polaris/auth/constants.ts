import { AuthSubjectType } from './policy/Page'

export enum TAB {
  USER = 'user',
  USERGROUP = 'usergroup',
  USEABLE_RESOURCE = 'resource',
  POLICY = 'policy',
}
export const PrincipalTypeMap = {
  [AuthSubjectType.USER]: 'user',
  [AuthSubjectType.USERGROUP]: 'group',
}

export enum DescribeStrategyOption {
  NoDefault = '0',
  Default = '1',
  Mix = '',
}
const TAB_LABLES_MAP = {
  [TAB.USER]: '用户',
  [TAB.USERGROUP]: '用户组',
  [TAB.POLICY]: '权限策略',
  [TAB.USEABLE_RESOURCE]: '可操作资源',
}
export const AuthTabs = Object.keys(TAB_LABLES_MAP).map(id => ({
  id,
  label: TAB_LABLES_MAP[id],
}))
export enum UserSource {
  QCloud = 'QCloud',
  Polaris = 'Polaris',
}
