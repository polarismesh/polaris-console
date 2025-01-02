import { ConfigFileRelease } from '../../types'
import { apiRequest, getApiRequest, putApiRequest } from '@src/polaris/common/util/apiRequest'

/** 获取配置文件发布 */
export async function DescribeConfigFileRelease(params: DescribeConfigFileReleaseParams) {
  const res = await getApiRequest<DescribeConfigFileReleaseResult>({
    action: '/config/v1/configfiles/release',
    data: params,
  })
  return res
}

/**
 * **DescribeConfigFileRelease入参**
 *
 * 获取配置文件发布
 */
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

/** 获取配置文件发布 */
export async function DescribeConfigFileReleases(params: DescribeConfigFileReleasesParams) {
  const res = await getApiRequest<DescribeConfigFileReleasesResult>({
    action: '/config/v1/configfiles/releases',
    data: params,
  })
  return res
}

/**
 * **DescribeConfigFileReleases入参**
 *
 * 查询配置版本列表
 */
export interface DescribeConfigFileReleasesParams {
  /** 命名空间 */
  namespace?: string

  /** 配置分组 */
  group?: string

  /** 文件名称 */
  fileName?: string

  /** 只保护处于使用状态 */
  onlyUse?: boolean

  /** 发布名称 */
  releaseName?: string

  /** 条数 */
  limit: number

  /** 偏移量 */
  offset: number
}

/**
 * **DescribeConfigFileReleases出参**
 *
 * 查询配置版本列表
 */
export interface DescribeConfigFileReleasesResult {
  configFileReleases: ConfigFileRelease[]
  total: number
}

/** 查询某个配置所有版本信息 */
export async function DescribeConfigFileReleaseVersions(params: DescribeConfigFileReleaseVersionsParams) {
  const res = await getApiRequest<DescribeConfigFileReleaseVersionsResult>({
    action: '/config/v1/configfiles/release/versions',
    data: params,
  })
  return res
}

/**
 * **DescribeConfigFileReleaseVersions入参**
 *
 * 查询某个配置所有版本信息
 */
export interface DescribeConfigFileReleaseVersionsParams {
  /** 命名空间 */
  namespace?: string

  /** 配置分组 */
  group?: string

  /** 文件名称 */
  fileName?: string
}

/**
 * **DescribeConfigFileReleaseVersions出参**
 *
 * 查询某个配置所有版本信息
 */
export interface DescribeConfigFileReleaseVersionsResult {
  /** 版本信息 */
  releaseVersions?: ReleaseVersion[]
}

/** 配置发布版本信息 */
export interface ReleaseVersion {
  /** 名称 */
  name?: string

  /** 是否生效 */
  active?: boolean
}

/** 回滚配置发布 */
export async function RollbackConfigFileReleases(params: ConfigFileRelease[]) {
  const res = await putApiRequest<RollbackConfigFileReleasesResult>({
    action: '/config/v1/configfiles/releases/rollback',
    data: params,
  })
  return res
}

/**
 * **RollbackConfigFileReleases出参**
 *
 * 回滚配置发布
 */
export interface RollbackConfigFileReleasesResult {
  /** 回滚结果 */
  code: number
  info: string
}

/** 删除配置发布 */
export async function DeleteConfigFileReleases(params: ConfigFileReleaseDeletion[]) {
  const res = await apiRequest<DeleteConfigFileReleasesResult>({
    action: '/config/v1/configfiles/releases/delete',
    data: params,
  })
  return res
}

/**
 * **DeleteConfigFileReleases出参**
 *
 * 删除配置发布
 */
export interface DeleteConfigFileReleasesResult {
  /** 删除配置发布结果 */
  result?: boolean
}

/** 配置发布删除 */
export interface ConfigFileReleaseDeletion {
  /** 命名空间 */
  namespace?: string

  /** 配置分组 */
  group?: string

  /** 文件名称 */
  fileName?: string

  /** TSF版本 */
  name?: string
}
