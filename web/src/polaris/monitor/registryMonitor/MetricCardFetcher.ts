import DynamicDuck from '@src/polaris/common/ducks/DynamicDuck'
import Fetcher from '@src/polaris/common/ducks/Fetcher'
import { getMonitorData } from '../models'
import moment from 'moment'

export interface DataPoint {
  time: string
  value: number
  metric?: string
}
export class DynamicMonitorFetcherDuck extends DynamicDuck {
  get ProtoDuck() {
    return MetricCardFetcher
  }
}
export interface MetricConfig {
  name: string
  query: string
  boardFunction?: Function
  asyncBoardFunction?: Function
  dataFormatter?: Function
  noLine?: boolean
  minStep?: number
  color?: string
  multiValue?: boolean
  multiMetricName?: string
}
export class MetricCardFetcher extends Fetcher {
  Data: {
    line: Array<DataPoint>
    board?: Array<{ name: string; value: number; unit: string }>
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
          step: queryParam.minStep ? Math.max(queryParam.minStep, param.step) : param.step,
        }),
      )
    }
    const results = await Promise.all(fetchPromise)
    let convertedData = []
    const boardData = []
    let resIndex = 0
    for (let resArray of results) {
      if (resArray.length === 0) convertedData = convertedData.concat([])
      const formattedArray = []
      const currentQuery = param.query[resIndex] as MetricConfig
      if (!currentQuery.multiValue) {
        resArray = [resArray[0]]
      }
      resArray.forEach(res => {
        const reduceValue = res?.values.reduce((prev, curr, currentIndex, currentArray) => {
          const [time, value] = curr
          if (value === 'NaN') {
            return
          }
          const timeString = moment(time * 1000).format('YYYY-MM-DD HH:mm:ss')
          const numVal = Number(value)
          const formattedValue = currentQuery.dataFormatter ? currentQuery.dataFormatter(numVal) : Number(numVal)
          formattedArray.push({
            time: timeString,
            value: formattedValue,
            metric: currentQuery?.multiValue ? res.metric[currentQuery.multiMetricName] : currentQuery?.name,
          })
          return currentQuery?.boardFunction?.(prev, curr, currentIndex, currentArray)
        }, 0)
        if (currentQuery.boardFunction) {
          boardData.push({ ...currentQuery, value: reduceValue })
        } else if (currentQuery.asyncBoardFunction) {
          boardData.push({ ...currentQuery, value: currentQuery?.asyncBoardFunction({ ...currentQuery, ...param }) })
        }
      })
      if (!currentQuery.noLine) convertedData = convertedData.concat(formattedArray)
      resIndex += 1
    }
    const asyncBoardData = boardData.filter(item => item.asyncBoardFunction)
    const asyncBoardDataRes = await Promise.all(asyncBoardData.map(item => item.value))
    asyncBoardData.forEach((item, index) => {
      item.value = asyncBoardDataRes[index]
    })
    return { line: convertedData, board: boardData }
  }
}
