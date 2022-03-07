import { getApiRequest } from '@src/polaris/common/util/apiRequest'
import { ConfigFileReleaseHistory } from '../fileGroup/types'

export interface DescribeConfigFileReleaseHistoriesParams {
  offset: number
  limit: number
  namespace: string
  group?: string
  name?: string
  endId?: string
}
export interface DescribeConfigFileReleaseHistoriesResult {
  total: number
  configFileReleaseHistories: Array<ConfigFileReleaseHistory>
}
export async function describeConfigFileReleaseHistories(params: DescribeConfigFileReleaseHistoriesParams) {
  const res = await getApiRequest<DescribeConfigFileReleaseHistoriesResult>({
    action: 'config/v1/configfiles/releasehistory',
    data: params,
  })
  return {
    list: res.configFileReleaseHistories,
    totalCount: res.total,
  }
}
