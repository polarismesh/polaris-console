/**
 * 公有云、私有云（TCE）、独立版（TStack）差异配置
 */
import BuildConfig from './Base'
import Public from './Public'
import TCS from './TCS'
import Base from './Base'

export let buildConfig: BuildConfig
switch (process.env.BUILD_TYPE) {
  case 'public':
    buildConfig = new Public()
    break
  case 'tcs':
    buildConfig = new TCS()
    break
  default:
    buildConfig = new Base()
}

export default buildConfig
