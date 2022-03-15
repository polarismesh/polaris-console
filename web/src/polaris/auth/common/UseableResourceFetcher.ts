import Fetcher from '@src/polaris/common/ducks/Fetcher'
import {
  DescribePrincipalResourcesParams,
  describePrincipalResources,
  DescribePrincipalResourcesResult,
} from '../model'

export default class UseableResourceFetcher extends Fetcher {
  Data: DescribePrincipalResourcesResult
  Param: DescribePrincipalResourcesParams
  fetchConfigsKey: string
  async getDataAsync(param: this['Param']) {
    const res = await describePrincipalResources(param)
    return res
  }
}
