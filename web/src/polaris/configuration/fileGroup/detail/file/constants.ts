import i18n from '@src/polaris/common/util/i18n'

export enum FileStatus {
  Success = 'success',
  Fail = 'failure',
  Edited = 'to-be-released',
}
export const FileStatusMap = {
  [FileStatus.Success]: {
    text: i18n.t('发布成功'),
    theme: 'success',
  },
  [FileStatus.Fail]: {
    text: i18n.t('发布失败'),
    theme: 'danger',
  },
  [FileStatus.Edited]: {
    text: i18n.t('编辑待发布'),
    theme: 'warning',
  },
}
