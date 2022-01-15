import { APIRequestOption, ApiResponse } from '@src/polaris/common/util/apiRequest'
import axios from 'axios'

interface PromethusResponse<T> {
  data: T
  status: string
}
export interface MonitorFetcherData {
  metrics: Record<string, string>
  values: Array<Array<number>>
}
export async function getPromethusApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    //tips.showLoading({});
    const res = await axios.get<PromethusResponse<T>>(action, {
      params: data,
      ...opts,
    })
    if (res.data.status !== 'success') {
      throw res.data
    }
    return res.data
  } catch (e) {
    console.error(e)
  } finally {
    //tips.hideLoading();
  }
}
export interface DeleteInstancesParams {
  id: string
}
export interface GetMonitorDataParams {
  query: string
  start: number
  end: number
  step: number
}
export interface GetLabelDataParams {
  match?: string[]
  start?: number
  end?: number
  labelKey: string
}
export async function getMonitorData(params: GetMonitorDataParams) {
  const res = await getPromethusApiRequest<{ result: MonitorFetcherData[] }>({
    action: `/api/v1/query_range`,
    data: params,
  })
  return res.data.result
}
export async function getLabelData(params: GetLabelDataParams) {
  let searchParams = new URLSearchParams()

  if (params.match) {
    params.match.forEach((match) => searchParams.append('match[]', match))
    searchParams.append('start', params.start.toString())
    searchParams.append('end', params.end.toString())
  }
  const res = await getPromethusApiRequest<string[]>({
    action: `/api/v1/label/${params.labelKey}/values`,
    data: searchParams,
  })
  return res.data
}
