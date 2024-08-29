import { getApiRequest, putApiRequest, apiRequest } from '@src/polaris/common/util/apiRequest'
// import { MetadataItem } from '@src/polaris/service/detail/route/types'
import {
  LimitType,
  LimitAction,
  LimitMethodType,
  LimitArgumentsType,
  LimitFailover,
  LimitAmountsValidationUnit,
} from './types'

export interface DescribeLimitRulesParams {
  id?: string
  namespace?: string
  service?: string
  method?: string
  //brief为true时，则不返回规则详情，只返回规则列表概要信息，默认为false
  brief?: boolean
  //用来筛选规则的启用状态，true为已启用，false为未启用
  disable?: boolean
  name?: string
  offset: number
  limit: number
}

export interface LimitConfig {
  validDuration: string
  maxAmount: number
}

export interface LimitConfigForFormFilling {
  // table row的key值，由于没有唯一标识字段，所以用生成随机数的方法来做生成id做key，在新增列时生成id，避免重复渲染
  id: string
  maxAmount: number
  validDurationNum: number
  validDurationUnit: LimitAmountsValidationUnit
}

interface LimitMethodConfig {
  value: string //接口名称
  type: LimitMethodType
}

export interface LimitArgumentsConfig {
  type: LimitArgumentsType
  key: string
  // 由于后台历史原因，这部分的结构不能修改了，这边的value取为复杂类型，value为填充的具体值，type为操作类型
  value: {
    type: string
    value: string
  }
}

export interface LimitArgumentsConfigForFormFilling {
  // table row的key值，由于没有唯一标识字段，所以用生成随机数的方法来做生成id做key，在新增列时生成id，避免重复渲染
  id: string
  type: LimitArgumentsType
  key: string
  value: string
  operator: LimitMethodType
}

export interface RateLimit {
  id: string // 规则id
  name: string //规则名
  service: string // 规则所属服务名
  namespace: string // 规则所属命名空间
  type: LimitType // 限流类型
  arguments: LimitArgumentsConfig[]
  amounts: LimitConfig[]
  action: LimitAction // 限流器的行为
  disable: boolean // 是否停用该限流规则，默认启用
  ctime: string // 创建时间
  mtime: string // 修改时间
  etime: string // 启用时间
  revision: string
  method: LimitMethodConfig //接口定义
  regex_combine: boolean
  failover: LimitFailover
  max_queue_delay: number
  resource: string // 限流资源
  // priority: number // 限流规则优先级
  // labels: Record<string, MetadataItem>
  editable: boolean
  deleteable: boolean
}

export interface DescribeLimitRulesResult {
  rateLimits: RateLimit[]
  amount: number
}
export async function describeLimitRules(params: DescribeLimitRulesParams) {
  const res = await getApiRequest<DescribeLimitRulesResult>({
    action: 'naming/v1/ratelimits',
    data: params,
  })
  return {
    list: res.rateLimits,
    totalCount: res.amount,
  }
}

export interface CreateLimitRulesBaseParams {
  id?: string
  name: string // 规则名
  type: LimitType // 限流类型
  namespace: string // 规则所属命名空间
  service: string // 规则所属服务名
  method: LimitMethodConfig // 接口定义
  regex_combine: boolean //是否合并计算阈值
  action: LimitAction // 限流器效果【快速失败 ｜ 匀速排队】
  max_queue_delay: number // 匀速排队的最大排队时长
  failover: LimitFailover // 失败处理策略
  disable: boolean // 是否停用该限流规则，默认启用
  resource: string
}

export interface CreateLimitRulesParams extends CreateLimitRulesBaseParams {
  arguments: LimitArgumentsConfig[] // 请求匹配规则
  amounts: LimitConfig[] // 限流条件
}

export async function createRateLimit(params: CreateLimitRulesParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/ratelimits',
    data: params,
  })
  return res
}

export async function modifyRateLimit(params: CreateLimitRulesParams[]) {
  const res = await putApiRequest<any>({
    action: 'naming/v1/ratelimits',
    data: params,
  })
  return res
}
export interface DeleteRateLimitParams {
  id: string
}
export async function deleteRateLimit(params: DeleteRateLimitParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/ratelimits/delete',
    data: params,
  })
  return res
}
export interface EnableRateLimitParams {
  id: string
  disable: boolean
}
export async function enableRateLimit(params: EnableRateLimitParams[]) {
  const res = await putApiRequest<any>({
    action: 'naming/v1/ratelimits/enable',
    data: params,
  })
  return res
}

export async function checkGlobalRateLimitAvailable() {
  const { data } = await getApiRequest<any>({
    action: 'console/ability',
    data: {},
  })
  return data?.indexOf('distributed_limit') > -1
}
