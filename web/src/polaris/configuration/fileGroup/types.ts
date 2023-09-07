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
  format: string
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
