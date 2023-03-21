import i18n from '@src/polaris/common/util/i18n'

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
  [TAB.USER]: i18n.t('用户'),
  [TAB.USERGROUP]: i18n.t('用户组'),
  [TAB.POLICY]: i18n.t('权限策略'),
  [TAB.USEABLE_RESOURCE]: i18n.t('可操作资源'),
}
export const AuthTabs = Object.keys(TAB_LABLES_MAP).map(id => ({
  id,
  label: TAB_LABLES_MAP[id],
}))
export enum UserSource {
  QCloud = 'QCloud',
  Polaris = 'Polaris',
}
