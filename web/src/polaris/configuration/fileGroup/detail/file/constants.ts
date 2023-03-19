import { t } from 'i18next'
export enum FileStatus {
  Success = 'success',
  Fail = 'failure',
  Edited = 'to-be-released',
}
export const FileStatusMap = {
  [FileStatus.Success]: {
    text: t('发布成功'),
    theme: 'success',
  },
  [FileStatus.Fail]: {
    text: t('发布失败'),
    theme: 'danger',
  },
  [FileStatus.Edited]: {
    text: t('编辑待发布'),
    theme: 'warning',
  },
}
