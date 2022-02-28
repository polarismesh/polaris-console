import { ConfigFileGroup, KeyValuePair, ConfigFile, ConfigFileRelease } from './types'
import { getApiRequest, apiRequest, putApiRequest, deleteApiRequest } from '@src/polaris/common/util/apiRequest'

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
export interface ModifyConfigFileParams {
  name: string
  namespace: string
  group: string
  content?: string
  comment?: string
  tags?: Array<KeyValuePair>
  format?: string
  modifyBy?: string
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
    action: 'config/v1/configfiles/batch',
    data: params,
  })
  return res
}
export interface ReleaseConfigFileParams {
  name: string
  namespace: string
  group: string
  fileName: string
  comment?: string
  createBy?: string
}
export interface ReleaseConfigFileResult {
  configFileRelease: ConfigFileRelease
}
export async function releaseConfigFile(params: ReleaseConfigFileParams) {
  const res = await apiRequest<ReleaseConfigFileResult>({
    action: 'config/v1/configfiles/release',
    data: params,
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
