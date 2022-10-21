import BaseConfig from './Base'
export default class BuildConfig extends BaseConfig {
  get readonlyNamespace() {
    return []
  }
  /**
   * 业务路由
   */
  get promethusHost() {
    return '119.91.66.54:9090'
  }
  get observabiliy() {
    return false
  }
  get monitoring() {
    return false
  }
  get configuration() {
    return true
  }
  get useDefaultPwd() {
    return false
  }
  get useCmdbDetail() {
    return false
  }
  get license() {
    return false
  }
  get checkGlobalRateLimit() {
    return true
  }
}
