import { takeLatest } from 'redux-saga-catch'
import Base from '@src/polaris/common/ducks/DialogPure'
import VersionDiff from './VersionDiff'
import { ConfigFileRelease } from '../../../types'
import { DescribeConfigFileRelease, DescribeConfigFileReleaseVersions } from '../model'
import { createToPayload, reduceFromPayload } from 'saga-duck'
import { put, select } from 'redux-saga/effects'
import { showDialog } from '@src/polaris/common/helpers/showDialog'

interface Data {
  regionId: number
  instanceId: string
  currentRelease: ConfigFileRelease
}
export default class VersionDiffDuck extends Base {
  Data: Data

  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }
  *onShow() {
    const state = this.selector(yield select())
    yield* this.initData(state?.data)
  }
  get quickTypes() {
    enum Types {
      SET_VERSION_LIST,
      SET_VERSION_CONFIG_MAP,
      CHANGE_COMPARE,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      versionList: reduceFromPayload<any[]>(types.SET_VERSION_LIST, null),
      versionMap: reduceFromPayload(types.SET_VERSION_CONFIG_MAP, {}),
      comparedVersion: reduceFromPayload(types.CHANGE_COMPARE, ''),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      selectVersion: createToPayload(types.CHANGE_COMPARE),
    }
  }
  *initData(data: Data) {
    const { currentRelease } = data
    const { namespace, group, fileName, name, active } = currentRelease
    let res
    try {
      res = yield DescribeConfigFileReleaseVersions({
        namespace,
        group,
        fileName,
      })
    } catch (e) {
      console.log(e)
    }
    const { configFileReleases } = res
    const releaseList = configFileReleases
    yield put({
      type: this.types.SET_VERSION_LIST,
      payload: releaseList.map(item => ({
        ...item,
        text: item.active ? `当前使用版本(${item.name})` : item.name,
        value: item.name,
      })),
    })
    const currentReleaseIndex = releaseList.findIndex(item => item.name === name)
    let comparedVersion
    if (active) {
      if (releaseList?.length > 1) {
        comparedVersion = releaseList[1]?.name
      }
    } else {
      comparedVersion = releaseList[currentReleaseIndex + 1]?.name
    }
    if (comparedVersion) yield put({ type: this.types.CHANGE_COMPARE, payload: comparedVersion })
  }
  *saga() {
    const { types, selector } = this
    yield takeLatest(types.CHANGE_COMPARE, function*(action) {
      const version = action.payload
      const {
        data: { currentRelease },
        versionMap,
      } = selector(yield select())
      const { namespace, group } = currentRelease
      const { configFileRelease } = yield DescribeConfigFileRelease({
        namespace,
        group,
        release_name: version,
        name: currentRelease.fileName,
      })
      yield put({ type: types.SET_VERSION_CONFIG_MAP, payload: { ...versionMap, [version]: configFileRelease } })
    })
  }
  static show(data: any) {
    return new Promise(resolve => {
      showDialog(VersionDiff, VersionDiffDuck, function*(duck) {
        yield duck.show(data, function*() {
          resolve(true)
        })
      })
    })
  }
}
