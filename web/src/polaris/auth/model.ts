import { apiRequest, getApiRequest, putApiRequest, SuccessCode, ApiResponse } from '../common/util/apiRequest'
import { ttl, once } from '../common/helpers/cacheable'

/** 删除治理中心鉴权策略 */
export async function deleteGovernanceStrategies(params: DeleteGovernanceStrategiesParams) {
  const result = await apiRequest<DeleteGovernanceStrategiesResult>({
    action: 'core/v1/auth/strategy/delete',
    data: params,
  })
  return Number(result.code) === SuccessCode
}
/** **DeleteGovernanceStrategies入参**

删除治理中心鉴权策略  */
export interface DeleteGovernanceStrategiesParams {
  /** 鉴权策略ID列表 */
  ids: string[]
}
/** **DeleteGovernanceStrategies出参**

删除治理中心鉴权策略 */
export interface DeleteGovernanceStrategiesResult {
  /** 执行结果 */
  result: boolean
}

/** 删除治理中心的用户 */
export async function deleteGovernanceUsers(params: DeleteGovernanceUsersParams) {
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
export async function modifyGovernanceStrategy(params: ModifyGovernanceStrategyParams[]) {
  const result = await putApiRequest<ModifyGovernanceStrategyResult>({
    action: 'core/v1/auth/strategies',
    data: params,
  })
  return result.responses.every(item => Number(item.code) === SuccessCode)
}
/** **ModifyGovernanceStrategy入参**

修改治理中心鉴权策略  */
export interface ModifyGovernanceStrategyParams {
  /** 策略名称 */
  id: string

  /** 涉及的用户 or 用户组 */
  principals?: Principal

  /** 资源操作权限 */
  action?: string

  /** 简单描述 */
  comment?: string

  /** 策略关联的资源 */
  resources?: StrategyResource
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
export async function deleteGovernanceGroups(params: DeleteGovernanceGroupsParams) {
  const result = await apiRequest<DeleteGovernanceGroupsResult>({ action: 'core/v1/usergroup/delete', data: params })
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

/** **CheckAuth**

检查策略是否已开启  */
export type CheckAuthParams = {}
/** **DeleteGovernanceStrategies出参**

检查策略是否已开启 */
export interface CheckAuthResult {
  /** 执行结果 */
  optionSwitch: {
    options: { auth: string }
  }
}

/** 检查策略是否已开启 */
export async function checkAuth(params: CheckAuthParams) {
  const result = await getApiRequest<CheckAuthResult>({ action: 'core/v1/auth/status', data: params })
  return result.optionSwitch.options.auth === 'true'
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
  name: string

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
}
/** 鉴权策略涉及的用户 or 用户组信息 */
export interface Principal {
  /** 用户ID列表 */
  users?: PrincipalEntry[]

  /** 用户组ID列表 */
  groups?: PrincipalEntry[]
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
  id: string

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
  action?: string[]

  /** 简单描述 */
  comment?: string

  /** 腾讯云主账户ID */
  owner?: string
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
