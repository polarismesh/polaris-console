import { getApiRequest } from './apiRequest'

export enum LicenseStatus {
  LICENSE_OK = 200000,
  LICENSE_LEFT_30_DAY = 500800,
  LICENSE_EXPIRE_30_DAY = 500802,
  LICENSE_FORBIDDEN = 500810,
}

export interface DescribeLicenseStatusResult {
  code: number
  warnMsg: string
}
export type DescribeLicenseStatusParams = {}
export async function describeLicenseStatus(params: DescribeLicenseStatusParams) {
  const res = await getApiRequest<DescribeLicenseStatusResult>({
    action: 'license/status',
    data: params,
    noError: true,
  })
  return res
}
