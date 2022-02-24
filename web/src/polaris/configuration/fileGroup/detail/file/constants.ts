export enum FileStatus {
  Success = 'success',
  Fail = 'failure',
  Edited = 'to-be-released',
}
export const FileStatusMap = {
  [FileStatus.Success]: {
    text: '发布成功',
    theme: 'success',
  },
  [FileStatus.Fail]: {
    text: '发布失败',
    theme: 'danger',
  },
  [FileStatus.Edited]: {
    text: '编辑待发布',
    theme: 'warning',
  },
}
