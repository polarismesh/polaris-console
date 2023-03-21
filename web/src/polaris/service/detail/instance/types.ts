import i18n from '@src/polaris/common/util/i18n'

export interface InstanceLocation {
  region: string
  zone: string
  campus: string
}

export interface Instance {
  ctime: string
  enableHealthCheck: boolean
  healthy: number
  host: string
  id: string
  isolate: number
  logic_set: string
  mtime: string
  namespace: string
  port: number
  protocol: string
  revision: string
  service: string
  version: string
  vpc_id: string
  weight: number
  editable: boolean
  location: InstanceLocation
}

export enum HEALTH_STATUS {
  HEALTH = 'true',
  ABNORMAL = 'false',
}

export enum ISOLATE_STATUS {
  ISOLATE = 'true',
  UNISOLATED = 'false',
}

export enum HEALTH_CHECK_METHOD {
  HEARTBEAT = 'HEARTBEAT',
}

export const HEALTH_CHECK_METHOD_MAP = {
  [HEALTH_CHECK_METHOD.HEARTBEAT]: {
    text: i18n.t('心跳上报'),
  },
}

export const HEALTH_STATUS_MAP = {
  [HEALTH_STATUS.HEALTH]: {
    text: i18n.t('健康'),
    theme: 'success',
  },
  [HEALTH_STATUS.ABNORMAL]: {
    text: i18n.t('异常'),
    theme: 'danger',
  },
}

export const HEALTH_STATUS_OPTIONS = [
  {
    text: HEALTH_STATUS_MAP[HEALTH_STATUS.HEALTH].text,
    value: HEALTH_STATUS.HEALTH,
  },
  {
    text: HEALTH_STATUS_MAP[HEALTH_STATUS.ABNORMAL].text,
    value: HEALTH_STATUS.ABNORMAL,
  },
]

export const HEALTH_CHECK_METHOD_OPTIONS = [
  {
    text: HEALTH_CHECK_METHOD_MAP[HEALTH_CHECK_METHOD.HEARTBEAT].text,
    value: HEALTH_CHECK_METHOD.HEARTBEAT,
  },
]

export const ISOLATE_STATUS_MAP = {
  [ISOLATE_STATUS.ISOLATE]: {
    text: i18n.t('隔离'),
    theme: 'danger',
  },
  [ISOLATE_STATUS.UNISOLATED]: {
    text: i18n.t('不隔离'),
    theme: '',
  },
}

export interface HEALTH_CHECK_STRUCT {
  type: number
  heartbeat: {
    ttl: number
  }
}

export enum BATCH_EDIT_TYPE {
  WEIGHT = 'weight',
  ISOLATE = 'isolate',
  HEALTHY = 'healthy',
}
