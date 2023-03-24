import Fetcher from '@src/polaris/common/ducks/Fetcher'
import { getMonitorData } from '../models'
import { roundToN } from './types'

export interface MetricConfig {
  name: string
  query: string
}
export interface TagData {
  code: string
  value: number
  percent: number
}
export class MetricTagCardFetcher extends Fetcher {
  Data: Array<TagData>
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
    const retCodeSumArray = results?.[0].map(res => {
      const retCode = res.metric['callee_result_code']
      const totalNum = res.values.reduce((prev, curr) => {
        const [, value] = curr
        prev += Number(value)
        return prev
      }, 0)
      return {
        code: retCode,
        value: totalNum,
      }
    })
    const AllRequestCount = retCodeSumArray.reduce((prev, curr) => {
      return prev + curr.value
    }, 0)
    const retCodeArray = retCodeSumArray.map(item => ({
      code: item.code,
      value: item.value,
      percent: roundToN((item.value / AllRequestCount) * 100, 2),
    }))
    return retCodeArray
  }
}
