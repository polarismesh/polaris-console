import { apiRequest, getApiRequest, putApiRequest } from '@src/polaris/common/util/apiRequest'
import { FaultDetectRule } from './types'

export interface DescribeFaultDetectsParams {
  brief: boolean
  offset: number
  limit: number
  id?: string
  name?: string
  service?: string
  serviceNamespace?: string
  dstService?: string
  dstNamespace?: string
  dstMethod?: string
  description?: string
}
export interface DescribeFaultDetectsResult {
  data: FaultDetectRule[]
  amount: number
  size: number
}
export async function DescribeFaultDetects(params: DescribeFaultDetectsParams) {
  const res = await getApiRequest<DescribeFaultDetectsResult>({
    action: 'naming/v1/faultdetectors',
    data: params,
  })
  return {
    list: res.data,
    totalCount: res.amount,
  }
}

export type CreateFaultDetectParams = FaultDetectRule
export async function createFaultDetect(params: CreateFaultDetectParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/faultdetectors',
    data: params,
  })
  return res
}

export async function modifyFaultDetect(params: CreateFaultDetectParams[]) {
  const res = await putApiRequest<any>({
    action: 'naming/v1/faultdetectors',
    data: params,
  })
  return res
}
export interface DeleteFaultDetectParams {
  id: string
}
export async function deleteFaultDetect(params: DeleteFaultDetectParams[]) {
  const res = await apiRequest<any>({
    action: 'naming/v1/faultdetectors/delete',
    data: params,
  })
  return res
}
