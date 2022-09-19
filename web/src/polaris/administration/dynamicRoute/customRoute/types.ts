// 接口类型
export enum RouteLabelMatchType {
  EXACT = 'EXACT',
  REGEX = 'REGEX',
}
export const RouteLabelMatchTypeOptions = [
  {
    value: RouteLabelMatchType.EXACT,
    text: '全匹配',
  },
  {
    value: RouteLabelMatchType.REGEX,
    text: '正则表达式',
  },
]
// 匹配规则类型
export enum RouteLabelType {
  CUSTOM = 'CUSTOM',
}
