import { ConfigFileGroup, KeyValuePair, ConfigFile, ConfigFileRelease, ClientLabel } from './types'
import { getApiRequest, apiRequest, putApiRequest, deleteApiRequest } from '@src/polaris/common/util/apiRequest'
import { object2FormData } from '@src/polaris/common/helpers/form'

export interface DescribeConfigFileGroupsParams {
  offset: number
  limit: number
  namespace?: string
  group?: string
  fileName?: string
}
export interface DescribeConfigFileGroupsResult {
  total: number
  configFileGroups: Array<ConfigFileGroup>
}
export async function describeConfigFileGroups(params: DescribeConfigFileGroupsParams) {
  const res = await getApiRequest<DescribeConfigFileGroupsResult>({
    action: 'config/v1/configfilegroups',
    data: params,
  })
  return {
    list: res.configFileGroups,
    totalCount: res.total,
  }
}
export interface CreateConfigFileGroupParams {
  name: string
  namespace: string
  comment?: string
  createBy?: string
  user_ids?: string[]
  group_ids?: string[]
  department?: string
  business?: string
  metadata?: Record<string, string>
}
export interface CreateConfigFileGroupResult {
  configFileGroup: ConfigFileGroup
}
export async function createConfigFileGroup(params: CreateConfigFileGroupParams) {
  const res = await apiRequest<CreateConfigFileGroupResult>({
    action: 'config/v1/configfilegroups',
    data: params,
  })
  return res
}
export interface ModifyConfigFileGroupParams {
  name: string
  namespace: string
  comment?: string
  user_ids?: string[]
  group_ids?: string[]
  remove_user_ids?: string[]
  remove_group_ids?: string[]
  department?: string
  business?: string
  metadata?: Record<string, string>
}
export interface ModifyConfigFileGroupResult {
  configFileGroup: ConfigFileGroup
}
export async function modifyConfigFileGroup(params: ModifyConfigFileGroupParams) {
  const res = await putApiRequest<ModifyConfigFileGroupResult>({
    action: 'config/v1/configfilegroups',
    data: params,
  })
  return res
}
export interface DeleteConfigFileGroupParams {
  group: string
  namespace: string
}
export type DeleteConfigFileGroupResult = {}
export async function deleteConfigFileGroups(params: DeleteConfigFileGroupParams) {
  const res = await deleteApiRequest<DeleteConfigFileGroupResult>({
    action: 'config/v1/configfilegroups',
    data: params,
  })
  return res
}
export interface CreateConfigFileParams {
  name: string
  namespace: string
  group: string
  content: string
  format: string
  comment: string
  tags: Array<KeyValuePair>
  createBy?: string
  encrypted: boolean
  encryptAlgo: string
  supported_client: string
  persistent?: {
    encoding: string
    path: string
    postCmd: string
  }
}
export interface CreateConfigFileResult {
  configFile: ConfigFile
  configFileGroup: ConfigFileGroup
}
export async function createConfigFile(params: CreateConfigFileParams) {
  const res = await apiRequest<CreateConfigFileResult>({
    action: 'config/v1/configfiles',
    data: params,
  })
  return res
}
export interface DescribeConfigFileDetailParams {
  name: string
  namespace: string
  group: string
}
export interface DescribeConfigFileDetailResult {
  configFileGroup: ConfigFileGroup
  configFile: ConfigFile
}
export async function describeConfigFileDetail(params: DescribeConfigFileDetailParams) {
  const res = await getApiRequest<DescribeConfigFileDetailResult>({
    action: 'config/v1/configfiles',
    data: params,
  })
  return res
}
export interface DescribeConfigFilesParams {
  offset: number
  limit: number
  namespace: string
  group: string
  name?: string
  tags?: string
}
export interface DescribeConfigFilesResult {
  total: number
  configFiles: Array<ConfigFile>
}
export async function describeConfigFiles(params: DescribeConfigFilesParams) {
  const res = await getApiRequest<DescribeConfigFilesResult>({
    action: 'config/v1/configfiles/search',
    data: params,
  })
  return {
    list: res.configFiles,
    totalCount: res.total,
  }
}
export async function describeConfigFilesByGroup(params: DescribeConfigFilesParams) {
  const res = await getApiRequest<DescribeConfigFilesResult>({
    action: 'config/v1/configfiles/by-group',
    data: params,
  })
  return {
    list: res.configFiles,
    totalCount: res.total,
  }
}

export interface ModifyConfigFileParams {
  name: string
  namespace: string
  group: string
  content?: string
  comment?: string
  tags?: Array<KeyValuePair>
  format?: string
  modifyBy?: string
  encrypted: boolean
  encryptAlgo: string
  supported_client: string
  persistent: {
    encoding: string
    path: string
    postCmd: string
  }
}
export interface ModifyConfigFileResult {
  configFile: ConfigFile
}
export async function modifyConfigFile(params: ModifyConfigFileParams) {
  const res = await putApiRequest<ModifyConfigFileResult>({
    action: 'config/v1/configfiles',
    data: params,
  })
  return res
}
export interface DeleteConfigFileParams {
  group: string
  namespace: string
  name: string
  deleteBy?: string
}
export type DeleteConfigFileResult = {}
export async function deleteConfigFiles(params: DeleteConfigFileParams) {
  const res = await deleteApiRequest<DeleteConfigFileResult>({
    action: 'config/v1/configfiles',
    data: params,
  })
  return res
}
export interface ReleaseConfigFileParams {
  name?: string
  namespace: string
  group: string
  fileName: string
  comment?: string
  createBy?: string
  releaseDescription?: string
  betaLabels?: ClientLabel[]
  releaseType?: string
}
export interface ReleaseConfigFileResult {
  configFileRelease: ConfigFileRelease
}
export async function releaseConfigFile(params: ReleaseConfigFileParams) {
  const res = await apiRequest<ReleaseConfigFileResult>({
    action: 'config/v1/configfiles/release',
    data: params,
    opts: {
      headers: {
        'X-Polaris-Config-Release-Strict': 'true',
      },
    },
  })
  return res
}
export interface DescribeLastReleaseConfigFileParams {
  name: string
  namespace: string
  group: string
}
export interface DescribeLastReleaseConfigFileResult {
  configFileRelease: ConfigFileRelease
}
export async function describeLastReleaseConfigFile(params: DescribeLastReleaseConfigFileParams) {
  const res = await getApiRequest<DescribeLastReleaseConfigFileResult>({
    action: 'config/v1/configfiles/release',
    data: params,
  })
  return res
}

export interface DescribeConfigFileReleaseParams {
  /** 命名空间名称 */
  namespace: string

  /** 配置分组名称 */
  group: string

  /** 配置文件版本 */
  release_name: string

  /** 配置文件名称 */
  name: string
}

/**
 * **DescribeConfigFileRelease出参**
 *
 * 获取配置文件发布
 */
export interface DescribeConfigFileReleaseResult {
  /** 配置文件发布详情 */
  configFileRelease: ConfigFileRelease
}
export async function checkReleaseVersionExist(params: DescribeConfigFileReleaseParams) {
  const res = await getApiRequest<DescribeConfigFileReleaseResult>({
    action: '/config/v1/configfiles/release',
    data: params,
  })
  if (res.configFileRelease) {
    return true
  }
  return false
}

export interface StopBetaReleaseConfigFileParams {
  file_name: string
  namespace: string
  group: string
}
export type StopConfigFileBetaReleaseResult = {}
export async function stopBetaReleaseConfigFile(params: StopBetaReleaseConfigFileParams[]) {
  const res = await apiRequest<StopConfigFileBetaReleaseResult>({
    action: 'config/v1/configfiles/releases/stopbeta',
    data: params,
  })
  return res
}

export interface ConfigFileTemplate {
  id: string
  name: string
  content: string
  format: string
  comment: string
  createTime: string
  createBy: string
  modifyTime: string
  modifyBy: string
}
export type DescribeConfigFileTemplatesParams = {}
export interface DescribeConfigFileTemplatesResult {
  configFileTemplates: ConfigFileTemplate
}

export async function describeConfigFileTemplates(params: DescribeConfigFileTemplatesParams) {
  const res = await getApiRequest<DescribeConfigFileTemplatesResult>({
    action: 'config/v1/configfiletemplates',
    data: params,
  })
  return res
}

export interface ExportConfigFilesParams {
  namespace: string
  groups: string[]
  names?: string[]
}

export async function exportConfigFile(params: ExportConfigFilesParams) {
  const res = await apiRequest<Blob>({
    action: 'config/v1/configfiles/export',
    data: params,
    opts: {
      responseType: 'blob',
    },
  })

  return res
}

export type TConflictHandling = 'skip' | 'overwrite'

export interface ImportConfigFilesParams {
  namespace: string
  group?: string
  conflict_handling: string
  config: File
}

export interface IFileTag {
  key: string
  value: string
}

export interface IImportConfigFileResultItem {
  id: string
  name: string
  namespace: string
  group: string
  content: string
  format: string
  comment: string
  status: string
  tags: IFileTag[]
  createTime: string
  createBy: string
  modifyTime: string
  modifyBy: string
  releaseTime: string
  releaseBy: string
  encrypt: string
}

export interface IImportConfigFilesResult {
  createConfigFiles: IImportConfigFileResultItem[]
  skipConfigFiles: IImportConfigFileResultItem[]
  overwriteConfigFiles: IImportConfigFileResultItem[]
}

export async function importConfigFile(params: ImportConfigFilesParams) {
  const res = await apiRequest<IImportConfigFilesResult>({
    action: 'config/v1/configfiles/import',
    data: object2FormData(params),
    opts: {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  })

  return res
}

export interface ConfigFileEncryptAlgorithm {
  algorithms: string[]
}

export async function describeConfigFileEncryptAlgorithms() {
  const res = await getApiRequest<ConfigFileEncryptAlgorithm>({
    action: 'config/v1/configfiles/encryptalgorithm',
  })
  return res
}
