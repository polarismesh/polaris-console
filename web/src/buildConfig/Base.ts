export default class BuildConfig {
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
    return true
  }
  get monitoring() {
    return true
  }
  get configuration() {
    return true
  }
  get useDefaultPwd() {
    return true
  }
  get useCmdbDetail() {
    return true
  }
  get license() {
    return false
  }
  get checkGlobalRateLimit() {
    return false
  }
  get useCls() {
    return false
  }
}
