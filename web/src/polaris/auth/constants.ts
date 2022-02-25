import { AuthSubjectType } from './policy/Page'

export enum TAB {
  USER = 'user',
  USERGROUP = 'usergroup',
  POLICY = 'policy',
}
export const PrincipalTypeMap = {
  [AuthSubjectType.USER]: 1,
  [AuthSubjectType.USERGROUP]: 2,
}

export enum DescribeStrategyOption {
  NoDefault = 1,
  Default = 2,
}
const TAB_LABLES_MAP = {
  [TAB.USER]: '用户',
  [TAB.USERGROUP]: '用户组',
  [TAB.POLICY]: '权限策略',
}
export const AuthTabs = Object.keys(TAB_LABLES_MAP).map(id => ({
  id,
  label: TAB_LABLES_MAP[id],
}))
export enum UserSource {
  QCloud = 'QCloud',
  Polaris = 'Polaris',
}
