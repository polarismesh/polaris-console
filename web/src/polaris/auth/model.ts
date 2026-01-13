import { apiRequest, getApiRequest, putApiRequest, ApiResponse } from '../common/util/apiRequest'
import { ttl, once } from '../common/helpers/cacheable'
import router from '../common/util/router'
import { PolarisTokenKey } from '../common/util/common'

const SuccessCode = 200000
/** 删除治理中心鉴权策略 */
export async function deleteGovernanceStrategies(params: DeleteGovernanceStrategiesParams[]) {
  const result = await apiRequest<DeleteGovernanceStrategiesResult>({
    action: 'core/v1/auth/strategies/delete',
    data: params,
  })
  return Number(result.code) === SuccessCode
}
/** **DeleteGovernanceStrategies入参**

删除治理中心鉴权策略  */
export interface DeleteGovernanceStrategiesParams {
  /** 鉴权策略ID列表 */
  id: string
}
/** **DeleteGovernanceStrategies出参**

删除治理中心鉴权策略 */
export interface DeleteGovernanceStrategiesResult {
  /** 执行结果 */
  result: boolean
}

/** 删除治理中心的用户 */
export async function deleteGovernanceUsers(params: DeleteGovernanceUsersParams[]) {
  const result = await apiRequest<DeleteGovernanceUsersResult>({ action: 'core/v1/users/delete', data: params })
  return result.responses.every(item => Number(item.code) === SuccessCode)
}
/** **DeleteGovernanceUsers入参**

删除治理中心的用户  */
export interface DeleteGovernanceUsersParams {
  /** 用户ID列表 */
  id: string
}
/** **DeleteGovernanceUsers出参**

删除治理中心的用户 */
export interface DeleteGovernanceUsersResult {
  /** 执行结果 */
  responses: ApiResponse[]
}

/** 查询治理中心鉴权策略列表 */
export async function describeGovernanceStrategies(params: DescribeGovernanceStrategiesParams) {
  const result = await getApiRequest<DescribeGovernanceStrategiesResult>({
    action: 'core/v1/auth/strategies',
    data: params,
  })
  return {
    totalCount: result.amount,
    content: result.authStrategies,
  }
}
/** **DescribeGovernanceStrategies入参**

查询治理中心鉴权策略列表  */
export interface DescribeGovernanceStrategiesParams {
  /** 分页查询偏移量 */
  offset?: number

  /** 查询条数 */
  limit?: number

  /** 策略名称，如果需要模糊搜索的话，最后加上一个 * */
  name?: string

  /** 用户 ID｜用户组 ID */
  principal_id?: string

  /** 1 为用户，2 为用户组 */
  principal_type?: number

  // 是否查询默认策略 1 为不查询
  default?: string

  res_id?: string

  res_type?: string
}
/** **DescribeGovernanceStrategies出参**

查询治理中心鉴权策略列表 */
export interface DescribeGovernanceStrategiesResult {
  /** 总数 */
  amount: number

  /** 策略列表 */
  authStrategies: AuthStrategy[]
}

/** 查询治理中心鉴权策略详细 */
export async function describeGovernanceStrategyDetail(params: DescribeGovernanceStrategyDetailParams) {
  const result = await getApiRequest<DescribeGovernanceStrategyDetailResult>({
    action: 'core/v1/auth/strategy/detail',
    data: params,
  })
  return { strategy: result.authStrategy }
}
/** **DescribeGovernanceStrategyDetail入参**

查询治理中心鉴权策略详细  */
export interface DescribeGovernanceStrategyDetailParams {
  /** 鉴权策略ID */
  id: string
}
/** **DescribeGovernanceStrategyDetail出参**

查询治理中心鉴权策略详细 */
export interface DescribeGovernanceStrategyDetailResult {
  /** 鉴权策略详细 */
  authStrategy: AuthStrategy
}

/** 查询治理中心用户列表 */
export async function describeGovernanceUsers(params: DescribeGovernanceUsersParams) {
  const result = await getApiRequest<DescribeGovernanceUsersResult>({
    action: 'core/v1/users',
    data: params,
  })
  return {
    totalCount: result.amount,
    content: result.users,
  }
}
/** **DescribeGovernanceUsers入参**

查询治理中心用户列表  */
export interface DescribeGovernanceUsersParams {
  /** 用户id */
  id?: string

  /** 用户名称，模糊搜索最后加上 * 字符 */
  name?: string

  /**主账户ID */
  owner?: string

  /** 分页偏移量 */
  offset?: number

  /** 查询条数 */
  limit?: number

  /** 账户来源，QCloud | Polaris */
  source?: string

  /** 用户组ID */
  group_id?: string
}
/** **DescribeGovernanceUsers出参**

查询治理中心用户列表 */
export interface DescribeGovernanceUsersResult {
  /** 总数 */
  amount: number

  /** 用户列表 */
  users: User[]
}

/** 查询治理中心用户Token */
export async function describeGovernanceUserToken(params: DescribeGovernanceUserTokenParams) {
  const result = await getApiRequest<DescribeGovernanceUserTokenResult>({ action: 'core/v1/user/token', data: params })
  return result
}
/** **DescribeGovernanceUserToken入参**

查询治理中心用户Token  */
export interface DescribeGovernanceUserTokenParams {
  /** 用户ID */
  id: string
}
/** **DescribeGovernanceUserToken出参**

查询治理中心用户Token */
export interface DescribeGovernanceUserTokenResult {
  /** 用户 */
  user: User
}
/** **ModifyGovernanceServices出参**

修改治理中心服务 */
export type ModifyGovernanceServicesResult = {}

/** 修改治理中心鉴权策略 */
export async function modifyGovernanceStrategy(params: ModifyAuthStrategy[]) {
  const result = await putApiRequest<ModifyGovernanceStrategyResult>({
    action: 'core/v1/auth/strategies',
    data: params,
  })
  return result.responses.every(item => Number(item.code) === SuccessCode)
}
/** **ModifyGovernanceStrategy出参**

修改治理中心鉴权策略 */
export interface ModifyGovernanceStrategyResult {
  /** 执行结果 */
  responses: ApiResponse[]
}

/** 修改治理中心用户信息 */
export async function modifyGovernanceUser(params: ModifyGovernanceUserParams) {
  const result = await putApiRequest<ModifyGovernanceUserResult>({ action: 'core/v1/user', data: params })
  return Number(result.code) === SuccessCode
}
/** **ModifyGovernanceUser入参**

修改治理中心用户信息  */
export interface ModifyGovernanceUserParams {
  /** 用户 */
  id: string
  mobile?: string
  email?: string
  comment?: string
}
/** **ModifyGovernanceUser出参**

修改治理中心用户信息 */
export interface ModifyGovernanceUserResult {
  /** 请求结果 */
  result: boolean
}

/** 修改治理中心用户信息 */
export async function modifyGovernanceUserPassword(params: ModifyGovernanceUserPasswordParams) {
  const result = await putApiRequest<ModifyGovernanceUserPassWordResult>({
    action: 'core/v1/user/password',
    data: params,
  })
  return Number(result.code) === SuccessCode
}
/** **ModifyGovernanceUser入参**

修改治理中心用户信息  */
export interface ModifyGovernanceUserPasswordParams {
  /** 用户 */
  id: string
  old_password?: string
  new_password: string
}
/** **ModifyGovernanceUser出参**

修改治理中心用户信息 */
export interface ModifyGovernanceUserPassWordResult {
  /** 请求结果 */
  result: boolean
}

/** 更新治理中心用户Token */
export async function modifyGovernanceUserToken(params: ModifyGovernanceUserTokenParams) {
  const result = await putApiRequest<ModifyGovernanceUserTokenResult>({
    action: 'core/v1/user/token/status',
    data: params,
  })
  return Number(result.code) === SuccessCode
}
/** **ModifyGovernanceUserToken入参**

更新治理中心用户Token  */
export interface ModifyGovernanceUserTokenParams {
  /** 用户Token信息 */
  id: string
  token_enable: boolean
}
/** **ModifyGovernanceUserToken出参**

更新治理中心用户Token */
export interface ModifyGovernanceUserTokenResult {
  /** 执行结果 */
  result: boolean
}
/** 创建治理中心鉴权策略 */
export async function createGovernanceStrategy(params: CreateGovernanceStrategyParams) {
  const result = await apiRequest<CreateGovernanceStrategyResult>({ action: 'core/v1/auth/strategy', data: params })
  return Number(result.code) === SuccessCode
}
/** **CreateGovernanceStrategy入参**

创建治理中心鉴权策略  */
export interface CreateGovernanceStrategyParams {
  /** 策略名称 */
  name: string

  /** 涉及的用户 or 用户组 */
  principals?: Principal

  /** 资源操作权限 */
  action?: string

  /** 简单描述 */
  comment?: string

  /** 主账户的UIN */
  owner?: string

  /** 策略关联的资源 */
  resources?: StrategyResource

  /** 鉴权规则来源 */
  source?: string

  /** 服务端接口 */
  functions?: string[]

  /** 策略生效的资源标签 */
  resource_labels?: string[]

  /** 策略资源标签 */
  metadata?: Record<string, string>
}
/** **CreateGovernanceStrategy出参**

创建治理中心鉴权策略 */
export interface CreateGovernanceStrategyResult {
  /** 执行结果 */
  result: boolean
}

/** 批量创建治理中心用户 */
export async function createGovernanceUsers(params: CreateGovernanceUsersParams[]) {
  const result = await apiRequest<CreateGovernanceUsersResult>({ action: 'core/v1/users', data: params })
  return result.responses.every(item => Number(item.code) === SuccessCode)
}
/** **CreateGovernanceUsers入参**

批量创建治理中心用户  */
export interface CreateGovernanceUsersParams {
  /** 用户列表 */
  name: string
  password: string
  comment: string
  mobile?: string
  email?: string
  source: string
}
/** **CreateGovernanceUsers出参**

批量创建治理中心用户 */
export interface CreateGovernanceUsersResult {
  /** 请求结果 */
  responses: ApiResponse[]
}
/** 创建单个治理中心用户组 */
export async function createGovernanceGroup(params: CreateUserGroup) {
  const result = await apiRequest<CreateGovernanceGroupResult>({ action: 'core/v1/usergroup', data: params })
  return Number(result.code) === SuccessCode
}
/** **CreateGovernanceGroup入参**

批量创建治理中心用户组  */
export interface CreateGovernanceGroupParams {
  /** 用户组名称 */
  name?: string

  /** 简单描述 */
  comment?: string

  /** 该用户组下的用户ID列表信息 */
  relation?: SimpleGroupRelation
}
/** **CreateGovernanceGroup出参**

批量创建治理中心用户组 */
export interface CreateGovernanceGroupResult {
  /** 请求结果 */
  result: boolean
}
/** 修改治理中心用户组信息 */
export async function modifyGovernanceGroup(params: ModifyGovernanceGroupParams[]) {
  const result = await putApiRequest<ModifyGovernanceGroupResult>({ action: 'core/v1/usergroups', data: params })
  return result.responses.every(item => Number(item.code) === SuccessCode)
}
/** **ModifyGovernanceGroup入参**

修改治理中心用户组信息  */
export type ModifyGovernanceGroupParams = ModifyUserGroup
/** **ModifyGovernanceGroup出参**

修改治理中心用户组信息 */
export interface ModifyGovernanceGroupResult {
  /** 请求结果 */
  responses: ApiResponse[]
}

/** 更新治理中心用户组Token */
export async function modifyGovernanceGroupToken(params: ModifyGovernanceGroupTokenParams) {
  const result = await putApiRequest<ModifyGovernanceGroupTokenResult>({
    action: 'core/v1/usergroup/token/status',
    data: params,
  })
  return Number(result.code) === SuccessCode
}
/** **ModifyGovernanceGroupToken入参**

更新治理中心用户组Token  */
export interface ModifyGovernanceGroupTokenParams {
  /** 用户组Token信息 */
  id: string
  token_enable: boolean
}
/** **ModifyGovernanceGroupToken出参**

更新治理中心用户组Token */
export interface ModifyGovernanceGroupTokenResult {
  /** 执行结果 */
  result: boolean
}
/** 删除治理中心的用户组 */
export async function deleteGovernanceGroups(params: DeleteGovernanceGroupsParams[]) {
  const result = await apiRequest<DeleteGovernanceGroupsResult>({ action: 'core/v1/usergroups/delete', data: params })
  return Number(result.code) === SuccessCode
}
/** **DeleteGovernanceGroups入参**

删除治理中心的用户组  */
export interface DeleteGovernanceGroupsParams {
  /** 用户组ID列表 */
  id: string
}
/** **DeleteGovernanceGroups出参**

删除治理中心的用户组 */
export interface DeleteGovernanceGroupsResult {
  /** 执行结果 */
  result: boolean
}
/** 查询治理中心用户组Token */
export async function describeGovernanceGroupToken(params: DescribeGovernanceGroupTokenParams) {
  const result = await getApiRequest<DescribeGovernanceGroupTokenResult>({
    action: 'core/v1/usergroup/token',
    data: params,
  })
  return result
}
/** **DescribeGovernanceGroupToken入参**

查询治理中心用户组Token  */
export interface DescribeGovernanceGroupTokenParams {
  /** 用户组ID */
  id: string
}
/** **DescribeGovernanceGroupToken出参**

查询治理中心用户组Token */
export interface DescribeGovernanceGroupTokenResult {
  /** 用户组 */
  userGroup: UserGroup
}
/** 查询治理中心用户组详细 */
export async function describeGovernanceGroupDetail(params: DescribeGovernanceGroupDetailParams) {
  const result = await getApiRequest<DescribeGovernanceGroupDetailResult>({
    action: 'core/v1/usergroup/detail',
    data: params,
  })
  return result
}
/** **DescribeGovernanceGroupDetail入参**

查询治理中心用户组详细  */
export interface DescribeGovernanceGroupDetailParams {
  /** 用户组ID */
  id: string
}
/** **DescribeGovernanceGroupDetail出参**

查询治理中心用户组详细 */
export interface DescribeGovernanceGroupDetailResult {
  /** 用户组详细 */
  userGroup: UserGroup
}

/** 查询治理中心用户组列表 */
export async function describeGovernanceGroups(params: DescribeGovernanceGroupsParams) {
  const result = await getApiRequest<DescribeGovernanceGroupsResult>({ action: 'core/v1/usergroups', data: params })
  return {
    totalCount: result.amount,
    content: result.userGroups,
  }
}
/** **DescribeGovernanceGroups入参**

查询治理中心用户组列表  */
export interface DescribeGovernanceGroupsParams {
  id?: string
  /** 用户名称，模糊搜索最后加上 * 字符 */
  name?: string

  owner?: string

  /** 分页偏移量 */
  offset?: number

  /** 查询条数 */
  limit?: number

  /** 账户来源，QCloud | Polaris */
  source?: string

  /** 用户ID，填写用户ID时为查询该用户下的所有group */
  user_id?: string
}
/** **DescribeGovernanceGroups出参**

查询治理中心用户组列表 */
export interface DescribeGovernanceGroupsResult {
  /** 总数 */
  amount: number

  /** 用户组列表 */
  userGroups: UserGroup[]
}
/** 查询治理中心用户组列表 */
export async function describePrincipalResources(params: DescribePrincipalResourcesParams) {
  const result = await getApiRequest<DescribePrincipalResourcesResult>({
    action: 'core/v1/auth/principal/resources',
    data: params,
  })
  return result
}
/** **DescribeGovernanceGroups入参**

查询治理中心用户组列表  */
export interface DescribePrincipalResourcesParams {
  principal_id?: string
  /** 用户名称，模糊搜索最后加上 * 字符 */
  principal_type?: string
}
/** **DescribeGovernanceGroups出参**

查询治理中心用户组列表 */
export interface DescribePrincipalResourcesResult {
  resources: {
    /** 命名空间ID列表 */
    namespaces?: StrategyResourceEntry[]

    /** 服务ID列表 */
    services?: StrategyResourceEntry[]
  }
}
/** 重置治理中心用户Token */
export async function resetGovernanceUserToken(params: ResetGovernanceUserTokenParams) {
  const result = await putApiRequest<ResetGovernanceUserTokenResult>({
    action: 'core/v1/user/token/refresh',
    data: params,
  })
  return Number(result.code) === SuccessCode
}
/** **ResetGovernanceUserToken入参**

重置治理中心用户Token  */
export interface ResetGovernanceUserTokenParams {
  /** 用户ID */
  id: string
}
/** **ResetGovernanceUserToken出参**

重置治理中心用户Token */
export interface ResetGovernanceUserTokenResult {
  /** 执行结果 */
  result: boolean
}
/** 重置治理中心用户组Token */
export async function resetGovernanceGroupToken(params: ResetGovernanceGroupTokenParams) {
  const result = await putApiRequest<ResetGovernanceGroupTokenResult>({
    action: 'core/v1/usergroup/token/refresh',
    data: params,
  })
  return Number(result.code) === SuccessCode
}

/** **DescribeGovernanceGroupDetail入参**

查询治理中心用户组详细  */
export interface LoginUserParams {
  /** 用户组ID */
  name: string
  password: string
  owner: string
}
/** **DescribeGovernanceGroupDetail出参**

查询治理中心用户组详细 */
export interface LoginUserResult {
  /** 用户组详细 */
  loginResponse: LoginResponse
}

/** 查询治理中心用户组列表 */
export async function loginUser(params: LoginUserParams) {
  const result = await apiRequest<LoginUserResult>({ action: 'core/v1/user/login', data: params })
  return result
}

export interface InitAdminUserParams {
  /** 用户组ID */
  name: string
  password: string
}

export async function initAdminUser(params: InitAdminUserParams) {
  const result = await apiRequest<any>({ action: 'maintain/v1/mainuser/create', data: params })
  return result
}

/* 查询治理中心用户组详细 */
export type DescribeAdminUserResult = {
  /** 用户组详细 */
  user: User
}

export async function checkExistAdminUser() {
  const result = await getApiRequest<DescribeAdminUserResult>({ action: 'maintain/v1/mainuser/exist' })
  return result
}

/** **CheckAuth**

检查策略是否已开启  */
export type CheckAuthParams = {}
/** **DeleteGovernanceStrategies出参**

检查策略是否已开启 */
export interface CheckAuthResult {
  /** 执行结果 */
  optionSwitch: {
    options: { auth: string; clientOpen: string; consoleOpen: string }
  }
}

/** 检查策略是否已开启 */
export async function checkAuth(params: CheckAuthParams) {
  if (!window.localStorage.getItem(PolarisTokenKey)) {
    router.navigate('/login')
    return false
  }
  const result = await getApiRequest<CheckAuthResult>({ action: 'core/v1/auth/status', data: params })
  return result.optionSwitch.options.auth === 'true'
}

export async function describeAuthStatus(params: CheckAuthParams) {
  const result = await getApiRequest<CheckAuthResult>({ action: 'core/v1/auth/status', data: params })
  return result.optionSwitch.options
}

export const cacheCheckAuth = once(checkAuth, ttl(30 * 60 * 1000))

/** **ResetGovernanceGroupToken入参**

重置治理中心用户组Token  */
export interface ResetGovernanceGroupTokenParams {
  /** 用户组ID */
  id: string
}
/** **ResetGovernanceGroupToken出参**

重置治理中心用户组Token */
export interface ResetGovernanceGroupTokenResult {
  /** 执行结果 */
  result: boolean
}
/** 鉴权策略 */
export interface AuthStrategy {
  /** 策略唯一ID */
  id?: string

  /** 策略名称 */
  name?: string

  /** 涉及的用户 or 用户组 */
  principals?: Principal

  /** 资源操作权限 */
  action?: string

  /** 简单描述 */
  comment?: string

  /** 主账户的UIN */
  owner?: string

  /** 创建时间 */
  ctime?: string

  /** 修改时间 */
  mtime?: string

  /** 策略关联的资源 */
  resources?: StrategyResource

  default_strategy?: boolean

  /** 鉴权规则来源 */
  source?: string

  /** 服务端接口 */
  functions?: string[]

  /** 策略生效的资源标签 */
  resource_labels?: string[]

  /** 策略资源标签 */
  metadata?: Record<string, string>
}
/** 鉴权策略涉及的用户 or 用户组信息 */
export interface Principal {
  /** 用户ID列表 */
  users?: PrincipalEntry[]

  /** 用户组ID列表 */
  groups?: PrincipalEntry[]

  /** 角色ID列表 */
  roles?: PrincipalEntry[]
}
/** 鉴权策略资源信息 */
export interface StrategyResource {
  /** 鉴权策略ID */
  strategy_id?: string

  /** 命名空间ID列表 */
  namespaces?: StrategyResourceEntry[]

  /** 服务ID列表 */
  services?: StrategyResourceEntry[]

  /** 配置组ID列表 */
  config_groups?: StrategyResourceEntry[]

  /** 路由规则ID列表 */
  route_rules?: StrategyResourceEntry[]

  /** 泳道规则ID列表 */
  lane_rules?: StrategyResourceEntry[]

  /** 熔断规则ID列表 */
  circuitbreaker_rules?: StrategyResourceEntry[]

  /** 主动探测规则ID列表 */
  faultdetect_rules?: StrategyResourceEntry[]

  /** 限流规则ID列表 */
  ratelimit_rules?: StrategyResourceEntry[]

  /** 用户ID列表 */
  users?: StrategyResourceEntry[]

  /** 用户组ID列表 */
  user_groups?: StrategyResourceEntry[]

  /** 资源鉴权规则ID列表 */
  auth_policies?: StrategyResourceEntry[]

  /** 角色ID列表 */
  roles?: StrategyResourceEntry[]
}
/** 资源 */
export interface StrategyResourceEntry {
  /** 资源Id，如果是全部的话，那么ID就是 * */
  id?: string

  /** 命名空间 */
  namespace?: string

  /** 服务名｜配置分组名 */
  name?: string
}
/** 用户组 */
export interface UserGroup {
  /** 用户组ID */
  id?: string

  /** 用户组名称 */
  name?: string

  /** 对应主账户UIN */
  owner?: string

  /** 该用户组的授权Token */
  auth_token?: string

  /** 该用户组的授权Token是否可用 */
  token_enable?: boolean

  /** 简单描述 */
  comment?: string

  /** 该用户组下的用户ID列表信息 */
  relation?: GroupRelation

  /** 创建时间 */
  ctime?: string

  /** 修改时间 */
  mtime?: string

  user_count?: number
}
export interface CreateUserGroup {
  /** 用户组ID */
  id?: string

  /** 用户组名称 */
  name?: string

  /** 简单描述 */
  comment?: string

  /** 该用户组下的用户ID列表信息 */
  relation?: GroupRelation
}

/** 用户-用户组关系 */
export interface SimpleGroupRelation {
  /** 用户组ID */
  group_id?: string

  /** 用户ID数组 */
  users?: { id: string }[]
}

/** 用户-用户组关系 */
export interface GroupRelation {
  /** 用户组ID */
  group_id?: string

  /** 用户ID数组 */
  users?: User[]
}
/** 修改用户组 */
export interface ModifyUserGroup {
  /** 用户组ID */
  id: string

  /** 简单描述 */
  comment?: string

  /** 添加的用户ID列表 */
  add_relations?: GroupRelation

  /** 移除的用户ID列表 */
  remove_relations?: GroupRelation
}
/** 用户 */
export interface User {
  /** 用户ID */
  id?: string

  /** 用户名称，对应云上的话应该是UIN */
  name?: string

  /** 对应主账户的UIN */
  owner?: string

  /** 用户来源 */
  source?: string

  /** 用户鉴权Token */
  auth_token?: string

  /** 该token是否被禁用 */
  token_enable?: boolean

  /** 该账户的简单描述 */
  comment?: string

  /** 该账户的创建时间 */
  ctime?: string

  /** 该账户的最近一次修改时间 */
  mtime?: string

  email?: string

  mobile?: string
}
/** 修改鉴权策略 */
export interface ModifyAuthStrategy {
  /** 策略ID */
  id: string

  /** 新增关联的用户、用户组信息 */
  add_principals?: Principal

  /** 移除关联的用户、用户组信息 */
  remove_principals?: Principal

  /** 新增关联的资源信息 */
  add_resources?: StrategyResource

  /** 移除关联的资源信息 */
  remove_resources?: StrategyResource

  /** 鉴权策略动作 */
  action?: string

  /** 简单描述 */
  comment?: string

  /** 腾讯云主账户ID */
  owner?: string

  /** 鉴权规则来源 */
  source?: string

  /** 服务端接口 */
  functions?: string[]

  /** 策略生效的资源标签 */
  resource_labels?: StrategyResourceLabel[]

  /** 策略资源标签 */
  metadata?: Record<string, string>
}

export interface StrategyResourceLabel {
  /** 标签键 */
  key?: string
  /** 标签值 */
  value?: string
  /** 比较类型 */
  compare_type?: string
}

export interface PrincipalEntry {
  /** 用户ID｜用户组ID */
  id: string

  /** 用户名｜用户组名 */
  name?: string
}
export interface LoginResponse {
  token: string
  name: string
  role: string
  user_id: string
  owner_id: string
}

/** 查询治理中心接口列表 */
export async function describeServerFunctions() {
  const result = await getApiRequest<ServerFunctionGroup[]>({
    action: 'maintain/v1/server/functions',
  })
  for (let i = 0; i < result.length; ++i) {
    result[i].id = result[i].name
  }
  return {
    list: result,
    totalCount: result.length,
  }
}

/** 查询服务接口列表 */
export interface ServerFunctionGroup {
  id: string
  name: string
  functions: string[]
}

export interface ServerFunction {
  id: string
  name: string
  desc: string
}

export function getServerFunctionDesc(group: string, name: string) {
  for (const i in ServerFunctionZhDesc) {
    if (ServerFunctionZhDesc[i].hasOwnProperty(name)) {
      return ServerFunctionZhDesc[i][name]
    }
  }
  return '未知'
}

export const ServerFunctionZhDesc = {
  Client: {
    RegisterInstance: '注册实例',
    DeregisterInstance: '注销实例',
    ReportServiceContract: '上报服务契约',
    DiscoverServices: '查询服务列表',
    DiscoverInstances: '查询服务实例',
    UpdateInstance: '更新服务实例',
    DiscoverRouterRule: '查询自定义路由规则',
    DiscoverRateLimitRule: '查询限流规则',
    DiscoverCircuitBreakerRule: '查询熔断规则',
    DiscoverFaultDetectRule: '查询探测规则',
    DiscoverServiceContract: '查询服务契约',
    DiscoverLaneRule: '查询泳道规则',
    DiscoverConfigFile: '查询配置文件',
    WatchConfigFile: '监听配置文件',
    DiscoverConfigFileNames: '查询配置分组下已发布的文件列表',
    DiscoverConfigGroups: '查询配置分组列表',
  },
  Namespace: {
    CreateNamespace: '创建单个命名空间',
    CreateNamespaces: '批量创建命名空间',
    DeleteNamespaces: '批量删除命名空间',
    UpdateNamespaces: '批量更新命名空间',
    DescribeNamespaces: '查询命名空间列表',
  },
  Service: {
    CreateServices: '批量创建服务',
    DeleteServices: '批量删除服务',
    UpdateServices: '批量更新服务',
    DescribeAllServices: '查询全部服务列表',
    DescribeServices: '查询服务列表',
    DescribeServicesCount: '查询服务总数',
    CreateServiceAlias: '批量创建服务别名',
    DeleteServiceAliases: '批量删除服务别名',
    UpdateServiceAlias: '批量更新服务别名',
    DescribeServiceAliases: '查询服务别名列表',
  },
  ServiceContract: {
    CreateServiceContracts: '批量创建服务契约',
    DescribeServiceContracts: '查询服务契约列表',
    DescribeServiceContractVersions: '查询服务契约版本列表',
    DeleteServiceContracts: '批量删除服务契约',
    CreateServiceContractInterfaces: '在某个契约版本下创建接口列表',
    AppendServiceContractInterfaces: '在某个契约版本下追加或覆盖接口列表',
    DeleteServiceContractInterfaces: '在某个契约版本下删除接口列表',
  },
  Instance: {
    CreateInstances: '批量创建服务实例',
    DeleteInstances: '批量删除服务实例',
    DeleteInstancesByHost: '根据 IP 批量删除服务实例',
    UpdateInstances: '批量更新服务实例',
    UpdateInstancesIsolate: '批量更新服务实例隔离状态',
    DescribeInstances: '查询服务实例列表',
    DescribeInstancesCount: '查询服务实例总数',
    DescribeInstanceLabels: '查询服务实例标签集合',
    CleanInstance: '清理服务实例',
    BatchCleanInstances: '批量清理服务实例',
    DescribeInstanceLastHeartbeat: '查询服务实例的最后一次心跳时间',
  },
  RouteRule: {
    CreateRouteRules: '批量创建自定义路由',
    DeleteRouteRules: '批量删除自定义路由',
    UpdateRouteRules: '批量更新自定义路由',
    EnableRouteRules: '批量启用/禁用自定义路由',
    DescribeRouteRules: '查询自定义路由规则列表',
  },
  RateLimitRule: {
    CreateRateLimitRules: '批量创建限流规则',
    DeleteRateLimitRules: '批量删除批量创建限流规则',
    UpdateRateLimitRules: '批量更新批量创建限流规则',
    EnableRateLimitRules: '批量启用/禁用批量创建限流规则',
    DescribeRateLimitRules: '查询批量创建限流规列表',
  },
  CircuitBreakerRule: {
    CreateCircuitBreakerRules: '批量创建熔断规则',
    DeleteCircuitBreakerRules: '批量删除熔断规则',
    EnableCircuitBreakerRules: '批量启用/禁用熔断规则',
    UpdateCircuitBreakerRules: '批量更新熔断规则',
    DescribeCircuitBreakerRules: '查询熔断规则列表',
  },
  FaultDetectRule: {
    CreateFaultDetectRules: '批量创建探测规则',
    DeleteFaultDetectRules: '批量删除探测规则',
    UpdateFaultDetectRules: '批量更新探测规则',
    EnableFaultDetectRules: '批量启用/禁用探测规则',
    DescribeFaultDetectRules: '查询探测规则列表',
  },
  LaneRule: {
    CreateLaneGroups: '批量创建泳道组',
    DeleteLaneGroups: '批量删除泳道组',
    UpdateLaneGroups: '批量更新泳道组',
    EnableLaneGroups: '批量启用/禁用泳道组',
    DescribeLaneGroups: '查询泳道组规则列表',
  },
  ConfigGroup: {
    CreateConfigFileGroup: '创建配置分组',
    DeleteConfigFileGroup: '删除配置分组',
    UpdateConfigFileGroup: '更新配置分组',
    DescribeConfigFileGroups: '查询配置分组列表',
  },
  ConfigFile: {
    PublishConfigFile: '发布配置文件',
    CreateConfigFile: '创建配置文件',
    UpdateConfigFile: '更新配置文件',
    DeleteConfigFile: '删除配置文件',
    DescribeConfigFileRichInfo: '查询单个配置文件详细',
    DescribeConfigFiles: '查询配置文件列表',
    BatchDeleteConfigFiles: '批量删除配置文件',
    ExportConfigFiles: '导出配置文件',
    ImportConfigFiles: '导入配置文件',
    DescribeConfigFileReleaseHistories: '查询配置文件发布历史',
    DescribeAllConfigFileTemplates: '查询配置模版列表',
    DescribeConfigFileTemplate: '查询单个配置模版',
    CreateConfigFileTemplate: '创建配置模版',
  },
  ConfigRelease: {
    RollbackConfigFileReleases: '批量回滚配置发布',
    DeleteConfigFileReleases: '批量删除已发布配置版本',
    StopGrayConfigFileReleases: '批量停止灰度发布配置版本',
    DescribeConfigFileRelease: '查询单个配置发布版本详细',
    DescribeConfigFileReleases: '查询配置发布列表',
    DescribeConfigFileReleaseVersions: '查询某一配置文件的发布版本列表',
    UpsertAndReleaseConfigFile: '创建/更新并发布配置文件',
  },
  User: {
    CreateUsers: '批量创建用户',
    DeleteUsers: '批量更新用户',
    DescribeUsers: '查询用户列表',
    DescribeUserToken: '查询用户的Token',
    EnableUserToken: '启用/禁用用户Token',
    ResetUserToken: '重置用户Token',
    UpdateUser: '更新用户信息',
    UpdateUserPassword: '更新用户密码',
  },
  UserGroup: {
    CreateUserGroup: '创建用户组',
    UpdateUserGroups: '更新用户组',
    DeleteUserGroups: '删除用户组',
    DescribeUserGroups: '查询用户组列表',
    DescribeUserGroupDetail: '查询用户组详细信息',
    DescribeUserGroupToken: '查询用户组的Token',
    EnableUserGroupToken: '启用/禁用用户组Token',
    ResetUserGroupToken: '重置用户组Token',
  },
  AuthPolicy: {
    CreateAuthPolicy: '创建鉴权策略',
    UpdateAuthPolicies: '更新鉴权策略',
    DeleteAuthPolicies: '删除鉴权策略',
    DescribeAuthPolicies: '查询鉴权策略列表',
    DescribeAuthPolicyDetail: '查询鉴权策略详细',
    DescribePrincipalResources: '查询可授权资源列表',
  },
}
