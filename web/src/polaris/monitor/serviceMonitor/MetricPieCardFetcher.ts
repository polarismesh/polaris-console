import Fetcher from '@src/polaris/common/ducks/Fetcher'
import { Data } from 'tea-chart'
import { getMonitorData } from '../models'

export interface DataPoint {
  time: string
  value: number
  metric?: string
}
export interface MetricConfig {
  name: string
  query: string
  dataFormatter?: Function
  color?: string
  unit?: string
  labelName?: string
}
export interface PieData extends Data {
  type: string
  value: number
  unit?: string
  labelName?: string
}
export class MetricPieCardFetcher extends Fetcher {
  Data: {
    pie: Array<PieData>
  }
  Param: {
    query: MetricConfig[]
    start: number
    end: number
    step: number
  }
  fetchConfigsKey: string
  async getDataAsync(param: this['Param']) {
    const fetchPromise = []
    for (const queryParam of param.query) {
      fetchPromise.push(
        getMonitorData({
          ...param,
          query: queryParam.query,
          step: param.step,
        }),
      )
    }
    const results = await Promise.all(fetchPromise)
    const pieData = []
    results.forEach((res, resIndex) => {
      const currentQuery = param.query[resIndex] as MetricConfig
      pieData.push({ type: currentQuery.name, value: res.length, ...currentQuery })
    })
    return { pie: pieData }
  }
}
