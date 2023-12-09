export enum FileStatus {
  Normal = 'normal',
  Success = 'success',
  Fail = 'failure',
  Edited = 'to-be-released',
  Betaing = "betaing"
}
export const FileStatusMap = {
  [FileStatus.Normal]: {
    text: '发布成功',
    theme: 'success',
  },
  [FileStatus.Success]: {
    text: '发布成功',
    theme: 'success',
  },
  [FileStatus.Fail]: {
    text: '发布失败',
    theme: 'danger',
  },
  [FileStatus.Betaing]: {
    text: '灰度发布中',
    theme: 'warning',
  },
  [FileStatus.Edited]: {
    text: '编辑待发布',
    theme: 'warning',
  },
}
