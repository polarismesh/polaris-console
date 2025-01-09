import { delay } from 'redux-saga'
import { once, ttl } from '../common/helpers/cacheable'
import { apiRequest, getAllList, getApiRequest, putApiRequest } from '../common/util/apiRequest'
import { Service, Namespace } from './types'

export interface DescribeServicesParams {
  offset: number
  limit: number
  name?: string
  namespace?: string
  host?: string
  keys?: string
  values?: string
  business?: string
  department?: string
  only_exist_health_instance?: boolean
}
export interface OperateServicesResult {
  amount: number
  size: number
  services: Array<Service>
}

export interface CreateServicesParams {
  name: string
  namespace: string
  ports: string
  comment: string
  business: string
  metadata: Record<string, string>
  owners: string
  department: string
  user_ids?: string[]
  group_ids?: string[]
  export_to?: string[]
  sync_to_global_registry?: boolean
}

export interface ModifyServicesParams {
  name: string
  namespace: string
  ports: string
  comment: string
  business: string
  metadata: Record<string, string>
  owners: string
  cmdb_mod1: string
  cmdb_mod2: string
  cmdb_mod3: string
  department: string
  user_ids?: string[]
  group_ids?: string[]
  remove_user_ids?: string[]
  remove_group_ids?: string[]
  export_to?: string[]
  sync_to_global_registry?: boolean
}
export interface DescribeNamespacesResult {
  amount: number
  size: number
  namespaces: Array<Namespace>
}

export interface DeleteServicesParams {
  name: string
  namespace: string
}
export async function describeServices(params: DescribeServicesParams) {
  const res = await getApiRequest<OperateServicesResult>({
    action: 'naming/v1/services',
    data: params,
  })
  return {
    list: res.services,
    totalCount: res.amount,
  }
}
export async function describeServicesSilence(params: DescribeServicesParams) {
  const res = await getApiRequest<OperateServicesResult>({
    action: 'naming/v1/services',
    data: params,
    silence: true,
  })
  return {
    list: res.services,
    totalCount: res.amount,
  }
}
export async function fetchAllServices(params = {}) {
  await delay(5000)
  return getAllList(describeServicesSilence, {})(params)
}

export const cacheFetchAllServices = once(fetchAllServices, ttl(60 * 5 * 1000))
export async function modifyServices(params: ModifyServicesParams[]) {
  const res = await putApiRequest<OperateServicesResult>({
    action: 'naming/v1/services',
    data: params,
  })

  return res
}

export async function createService(params: CreateServicesParams[]) {
  const res = await apiRequest<OperateServicesResult>({
    action: 'naming/v1/services',
    data: params,
  })

  return res
}

export async function deleteService(params: DeleteServicesParams[]) {
  const res = await apiRequest<OperateServicesResult>({
    action: 'naming/v1/services/delete',
    data: params,
  })

  return res
}

export async function describeNamespaces() {
  const res = await getApiRequest<DescribeNamespacesResult>({
    action: 'naming/v1/namespaces',
    data: { limit: 100, offset: 0 },
  })

  return res.namespaces
}

export function DescribeGovernanceServiceContracts(params: DescribeGovernanceServiceContractsParams) {
  return getApiRequest<DescribeGovernanceServiceContractsResult>({
    action: '/naming/v1/service/contracts',
    data: params,
  })
}

export interface DescribeGovernanceServiceContractsParams {
  /** ID */
  id?: string

  /** 命名空间 */
  namespace?: string

  /** 服务名 */
  service?: string

  /** 契约名称 */
  name?: string

  /** 契约版本 */
  version?: string

  /** 契约协议 */
  protocol?: string

  /** 是否只展示基本信息 */
  brief?: boolean

  /** 分页偏移量 */
  offset: number

  /** 分页条数 */
  limit: number
}

/**
 * **DescribeGovernanceServiceContracts出参**
 *
 * 查询服务契约定义列表
 */
export interface DescribeGovernanceServiceContractsResult {
  /** 总数 */
  amount?: number

  /** 返回条数 */
  size?: number

  /** 契约定义列表 */
  data?: GovernanceServiceContract[]
}
/** 查询服务下契约版本列表 */
export function DescribeGovernanceServiceContractVersions(params: DescribeGovernanceServiceContractVersionsParams) {
  return getApiRequest<DescribeGovernanceServiceContractVersionsResult>({
    action: '/naming/v1/service/contract/versions',
    data: params,
  })
}

/**
 * **DescribeGovernanceServiceContractVersions入参**
 *
 * 查询服务下契约版本列表
 */
export interface DescribeGovernanceServiceContractVersionsParams {
  /** 命名空间 */
  namespace: string

  /** 服务名 */
  service: string
}

/**
 * **DescribeGovernanceServiceContractVersions出参**
 *
 * 查询服务下契约版本列表
 */
export interface DescribeGovernanceServiceContractVersionsResult {
  /** 服务契约版本列表 */
  data?: GovernanceServiceContractVersion[]
  amount: number
  size: number
}
/** 服务契约版本信息 */
export interface GovernanceServiceContractVersion {
  /** 契约版本 */
  version?: string

  /** 契约名称 */
  name?: string
}

/** 服务契约定义 */
export interface GovernanceServiceContract {
  /** 契约ID */
  id?: string

  /** 契约名称 */
  name?: string

  /** 所属服务命名空间 */
  namespace?: string

  /** 所属服务名称 */
  service?: string

  /** 协议 */
  protocol?: string

  /** 版本 */
  version?: string

  /** 信息摘要 */
  revision?: string

  /** 额外内容描述 */
  content?: string

  /** 创建时间 */
  ctime?: string

  /** 修改时间 */
  mtime?: string

  /** 契约接口列表 */
  interfaces?: GovernanceInterfaceDescription[]

  /**
   * 服务契约在线状态
   *
   * 1、Online：在线
   *
   * 2、Offline：离线
   */
  status?: string
}
/** 服务契约接口定义 */
export interface GovernanceInterfaceDescription {
  /** 契约接口ID */
  id?: string

  /** 方法名称 */
  method?: string

  /** 路径/接口名称 */
  path?: string

  /** 内容 */
  content?: string

  /** 创建来源 */
  source?: string

  /** 信息摘要 */
  revision?: string

  /** 创建时间 */
  ctime?: string

  /** 修改时间 */
  mtime?: string
}

/** 批量删除服务契约接口定义 */
export function DeleteGovernanceServiceContractInterfaces(params: DeleteGovernanceServiceContractInterfacesParams) {
  return apiRequest<DeleteGovernanceServiceContractInterfacesResult>({
    action: '/naming/v1/service/contract/methods/delete',
    data: params,
  })
}
/*
 * **DeleteGovernanceServiceContractInterfaces入参**
 *
 * 批量删除服务契约接口定义
 */
export interface DeleteGovernanceServiceContractInterfacesParams {
  /** 契约ID */
  id?: string

  /** 契约名称 */
  name?: string

  /** 所属服务命名空间 */
  namespace?: string

  /** 所属服务名称 */
  service?: string

  /** 协议 */
  protocol?: string

  /** 版本 */
  version?: string

  /** 额外内容描述 */
  content?: string

  /** 契约接口列表 */
  interfaces?: GovernanceInterfaceDescription[]
}

/**
 * **DeleteGovernanceServiceContractInterfaces出参**
 *
 * 批量删除服务契约接口定义
 */
export interface DeleteGovernanceServiceContractInterfacesResult {
  /** 是否成功 */
  result: boolean
}
