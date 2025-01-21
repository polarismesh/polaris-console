import { FileFormat } from './operation/Create'

export enum FileStatus {
  Normal = 'normal',
  Success = 'success',
  Fail = 'failure',
  Edited = 'to-be-released',
  Betaing = 'betaing',
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
export const NeedCheckFormat = [FileFormat.YAML, FileFormat.JSON]
export enum ConfigFileMode {
  Default = 'CLIENT_SDK', //SDKonly
  FileMode = 'CLIENT_AGENT', //AgentOnly
  ShareMode = 'CLIENT_ALL', //both
}
export const ConfigFileModeMap = {
  [ConfigFileMode.Default]: '仅SDK读取',
  [ConfigFileMode.FileMode]: '仅Agent读取',
  [ConfigFileMode.ShareMode]: 'SDK和Agent同时读取',
}
export const ConfigFileModeOptions = [
  {
    value: String(ConfigFileMode.Default),
    text: ConfigFileModeMap[ConfigFileMode.Default],
    tooltip: 'SDK框架接入时，不感知配置文件编码、下发路径和后置脚本命令，无需配置。',
  },
  {
    value: String(ConfigFileMode.FileMode),
    text: ConfigFileModeMap[ConfigFileMode.FileMode],
  },
  {
    value: String(ConfigFileMode.ShareMode),
    text: ConfigFileModeMap[ConfigFileMode.ShareMode],
  },
]

export enum SaveFileEncoding {
  UTF8 = 'UTF-8',
  GBK = 'GBK',
}
export const SaveFileEncodingMap = {
  [SaveFileEncoding.UTF8]: 'utf-8',
  [SaveFileEncoding.GBK]: 'gbk',
}
export const SaveFileEncodingOptions = Object.keys(SaveFileEncoding).map((key: string) => {
  return {
    value: SaveFileEncoding[key],
    text: SaveFileEncodingMap[key],
  }
})
