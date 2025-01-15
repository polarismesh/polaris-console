export interface ConfigFileGroup {
  id: string
  name: string
  namespace: string
  comment: string
  createTime: string
  createBy: string
  modifyTime: string
  modifyBy: string
  fileCount: number
  editable: boolean
  deleteable: boolean
  department?: string
  business?: string
  metadata?: ConfigFileGroupTag[]
}
export interface ConfigFile {
  name: string
  namespace: string
  group: string
  content: string
  format: string
  comment: string
  status: string
  tags: Array<KeyValuePair>
  createTime: string
  createBy: string
  modifyTime: string
  modifyBy: string
  releaseTime: string
  releaseBy: string
  encrypted: boolean
  encryptAlgo: string
  supported_client: string
  persistent: {
    encoding: string
    path: string
    postCmd: string
  }
}
export interface KeyValuePair {
  key: string
  value?: string
}
export interface ConfigFileRelease {
  name: string
  namespace: string
  group: string
  fileName: string
  content: string
  comment: string
  md5: string
  version: string
  tags: Array<KeyValuePair>
  createTime: string
  createBy: string
  modifyTime: string
  modifyBy: string
  releaseDescription?: string
  releaseStatus?: string
  active: string
  releaseType?: string
  format: string
  betaLabels: ClientLabel[]
  id: string
}
export interface ConfigFileReleaseHistory {
  id: string
  name: string
  namespace: string
  group: string
  fileName: string
  content: string
  format: string
  comment: string
  md5: string
  type: string
  status: string
  tags: Array<KeyValuePair>
  createTime: string
  createBy: string
  modifyTime: string
  modifyBy: string
  releaseDescription?: string
  releaseStatus?: string
  releaseReason?: string
}
export interface ConfigFileGroupTag {
  key?: string
  value?: string
}

export interface ClientLabel {
  key?: string
  value: {
    type: string
    value: string
    value_type: string
  }
}

export interface ClientLabelView {
  key_type: string
  key: string
  type: string
  value: string
  value_type: string
}

// 匹配规则类型
export enum ClientLabelType {
  CLIENT_ID = 'CLIENT_ID',
  // CLIENT_LANGUAGE = 'CLIENT_LANGUAGE',
  CLIENT_IP = 'CLIENT_IP',
  CUSTOM = 'CUSTOM',
}

export const ClientLabelTypeOptions = [
  // {
  //   value: ClientLabelType.CLIENT_ID,
  //   text: '客户端ID',
  // },
  {
    value: ClientLabelType.CLIENT_IP,
    text: '客户端IP',
  },
  // {
  //   value: ClientLabelType.CLIENT_LANGUAGE,
  //   text: '请求头(HEADER)',
  // },
  {
    value: ClientLabelType.CUSTOM,
    text: '自定义',
  },
]
export const ClientLabelTextMap = ClientLabelTypeOptions.reduce((map, curr) => {
  map[curr.value] = curr.text
  return map
}, {})

export enum ClientLabelMatchType {
  EXACT = 'EXACT',
  REGEX = 'REGEX',
  NOT_EQUALS = 'NOT_EQUALS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  RANGE = 'RANGE',
}
export const ClientLabelMatchTypeOptions = [
  {
    value: ClientLabelMatchType.EXACT,
    text: '等于',
  },
  {
    value: ClientLabelMatchType.REGEX,
    text: '正则表达式匹配',
  },
  {
    value: ClientLabelMatchType.NOT_EQUALS,
    text: '不等于',
  },
  {
    value: ClientLabelMatchType.IN,
    text: '包含',
  },
  {
    value: ClientLabelMatchType.NOT_IN,
    text: '不包含',
  },
]
export const ClientLabelMatchMap = ClientLabelMatchTypeOptions.reduce((map, curr) => {
  map[curr.value] = curr.text
  return map
}, {})
