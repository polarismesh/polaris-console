import Fetcher from '@src/polaris/common/ducks/Fetcher'
import { DescribePrincipalResourcesParams, describePrincipalResources, StrategyResourceEntry } from '../model'

export default class UseableResourceFetcher extends Fetcher {
  Data: { namespaces?: StrategyResourceEntry[]; services?: StrategyResourceEntry[] }
  Param: DescribePrincipalResourcesParams
  fetchConfigsKey: string
  async getDataAsync(param: this['Param']) {
    const res = await describePrincipalResources(param)
    return res.resources
  }
}
