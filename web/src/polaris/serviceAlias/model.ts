import { apiRequest, getApiRequest, putApiRequest } from '../common/util/apiRequest'

/** 查询治理中心服务别名列表 */
export async function describeGovernanceAliases(params: DescribeGovernanceAliasesParams) {
  const result = await getApiRequest<DescribeGovernanceAliasesResult>({
    action: 'naming/v1/service/aliases',
    data: params,
  })
  return {
    totalCount: result.amount,
    content: result.aliases,
  }
}
/** **DescribeGovernanceAliases入参**
  
  查询治理中心服务别名列表  */
export interface DescribeGovernanceAliasesParams {
  /** 服务别名所指向的服务名。 */
  service?: string

  /** 服务别名所指向的命名空间名。 */
  namespace?: string

  /** 服务别名。 */
  alias?: string

  /** 服务别名命名空间。 */
  alias_namespace?: string

  /** 服务别名描述。 */
  comment?: string

  /** 偏移量，默认为0。 */
  offset?: number

  /** 返回数量，默认为20，最大值为100。 */
  limit?: number
}
/** **DescribeGovernanceAliases出参**
  
  查询治理中心服务别名列表 */
export interface DescribeGovernanceAliasesResult {
  /** 服务别名总数量。 */
  amount: number

  /** 服务别名列表。 */
  aliases: GovernanceAlias[]
}
/** 服务别名结构信息 */
export interface GovernanceAlias {
  /** 服务别名 */
  alias: string

  /** 服务别名命名空间 */
  alias_namespace: string

  /** 服务别名指向的服务名 */
  service: string

  /** 服务别名指向的服务命名空间 */
  namespace: string

  /** 服务别名的描述信息 */
  comment?: string

  /** 服务别名创建时间 */
  ctime?: string

  /** 服务别名修改时间 */
  mtime?: string

  /** 服务别名是否可编辑 */
  editable?: boolean

  /** 服务别名是否可删除 */
  deleteable?: boolean

  /** 同步全局命名中心 */
  sync_to_global_registry?: boolean
}

/** 创建治理中心服务别名 */
export function createGovernanceAlias(params: CreateGovernanceAliasParams) {
  return apiRequest<CreateGovernanceAliasResult>({ action: 'naming/v1/service/alias', data: params })
}
/** **CreateGovernanceAlias入参**
  
  创建治理中心服务别名  */
export interface CreateGovernanceAliasParams {
  /** 服务别名 */
  alias: string

  /** 服务别名命名空间 */
  alias_namespace: string

  /** 服务别名所指向的服务名 */
  service: string

  /** 服务别名所指向的命名空间 */
  namespace: string

  /** 服务别名描述 */
  comment?: string
}
/** **CreateGovernanceAlias出参**
  
  创建治理中心服务别名 */
export interface CreateGovernanceAliasResult {
  /** 创建是否成功。 */
  result: boolean
}

/** 修改治理中心服务别名 */
export function modifyGovernanceAlias(params: ModifyGovernanceAliasParams) {
  return putApiRequest<ModifyGovernanceAliasResult>({ action: 'naming/v1/service/alias', data: params })
}
/** **ModifyGovernanceAlias入参**
  
  修改治理中心服务别名  */
export interface ModifyGovernanceAliasParams {
  /** 服务别名 */
  alias: string

  /** 服务别名命名空间 */
  alias_namespace: string

  /** 服务别名所指向的服务名 */
  service: string

  /** 服务别名所指向的命名空间 */
  namespace: string

  /** 服务别名描述 */
  comment?: string
}
/** **ModifyGovernanceAlias出参**
  
  修改治理中心服务别名 */
export interface ModifyGovernanceAliasResult {
  /** 创建是否成功。 */
  result: boolean
}

/** 删除治理中心服务别名 */
export function deleteGovernanceAliases(params: DeleteGovernanceAliasesParams) {
  return apiRequest<DeleteGovernanceAliasesResult>({ action: 'naming/v1/service/aliases/delete', data: params })
}
/** **DeleteGovernanceAliases入参**
  
  删除治理中心服务别名  */
export type DeleteGovernanceAliasesParams = { alias: string; alias_namespace: string }[]

/** **DeleteGovernanceAliases出参**
  
  删除治理中心服务别名 */
export interface DeleteGovernanceAliasesResult {
  /** 创建是否成功。 */
  result: boolean
}
