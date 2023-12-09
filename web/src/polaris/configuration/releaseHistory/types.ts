export enum ConfigReleaseStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}
export const ConfigReleaseStatusMap = {
  [ConfigReleaseStatus.SUCCESS]: {
    text: '成功',
    theme: 'success',
  },
  [ConfigReleaseStatus.FAILURE]: {
    text: '失败',
    theme: 'danger',
  },
}
export enum ConfigReleaseType {
  PUBLISH = 'normal',
  ROLLBACK = 'rollback',
  DELETE = 'delete',
  CLEAN = 'clean',
  BETAING = 'betaing',
  CANCEL_BETA = 'cancel-gray',
}
export const ConfigReleaseTypeMap = {
  [ConfigReleaseType.PUBLISH]: '发布',
  [ConfigReleaseType.ROLLBACK]: '回滚',
  [ConfigReleaseType.DELETE]: '删除',
  [ConfigReleaseType.CLEAN]: '文件删除',
  [ConfigReleaseType.BETAING]: '灰度发布',
  [ConfigReleaseType.CANCEL_BETA]: '取消灰度发布',
}
