import {
  getApiRequest,
  putApiRequest,
  apiRequest,
} from "@src/polaris/common/util/apiRequest";
import { MetadataItem } from "../route/types";

export interface DescribeLimitRulesParams {
  namespace: string;
  service: string;
  offset: number;
  limit: number;
}
export enum LimitRange {
  GLOBAL = "GLOBAL",
  LOCAL = "LOCAL",
}
export enum LimitType {
  REJECT = "REJECT",
  WARMUP = "WARMUP",
  UNIRATE = "UNIRATE",
}
export interface LimitConfig {
  maxAmount: number;
  validDuration: number;
}
export enum LimitResource {
  QPS = "QPS",
  CONCURRENCY = "CONCURRENCY",
}
export interface RateLimit {
  id: string; // 规则id
  service: string; // 规则所属服务名
  namespace: string; // 规则所属命名空间
  priority: number; // 限流规则优先级
  resource: string; // 限流资源
  type: LimitRange; // 限流类型
  labels: Record<string, MetadataItem>;
  amounts: LimitConfig[];
  action: LimitType; // 限流器的行为
  disable: boolean; // 是否停用该限流规则，默认启用
  ctime: string; // 创建时间
  mtime: string; // 修改时间
  revision: string;
}

export interface DescribeLimitRulesResult {
  rateLimits: RateLimit[];
  amount: number;
}
export async function describeLimitRules(params: DescribeLimitRulesParams) {
  const res = await getApiRequest<DescribeLimitRulesResult>({
    action: "naming/v1/ratelimits",
    data: params,
  });
  return {
    list: res.rateLimits,
    totalCount: res.amount,
  };
}

export interface CreateLimitRulesParams {
  service: string; // 规则所属服务名
  namespace: string; // 规则所属命名空间
  priority: number; // 限流规则优先级
  resource: string; // 限流资源
  type: LimitRange; // 限流类型
  labels: Record<string, MetadataItem>;
  amounts: LimitConfig[];
  action: LimitType; // 限流器的行为
  disable: boolean; // 是否停用该限流规则，默认启用
  method: {
    value: string;
  };
  service_token: string;
}
export async function createRateLimit(params: CreateLimitRulesParams[]) {
  const res = await apiRequest<any>({
    action: "naming/v1/ratelimits",
    data: params,
  });
  return res;
}

export async function modifyRateLimit(params: CreateLimitRulesParams[]) {
  const res = await putApiRequest<any>({
    action: "naming/v1/ratelimits",
    data: params,
  });
  return res;
}
export interface DeleteRateLimitParams {
  id: string;
}
export async function deleteRateLimit(params: DeleteRateLimitParams[]) {
  const res = await apiRequest<any>({
    action: "naming/v1/ratelimits/delete",
    data: params,
  });
  return res;
}
