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
  deleteable: boolean
  location: InstanceLocation
}

export enum HEALTH_STATUS {
  HEALTH = 'true',
  ABNORMAL = 'false',
  METRIC_HEALTH = 'health',
  METRIC_ABNORMAL = 'unhealth',
  METRIC_OFFLINE = 'offline',
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
    text: '心跳上报',
  },
}

export const HEALTH_STATUS_MAP = {
  [HEALTH_STATUS.HEALTH]: {
    text: '健康',
    theme: 'success',
  },
  [HEALTH_STATUS.ABNORMAL]: {
    text: '异常',
    theme: 'danger',
  },
  [HEALTH_STATUS.METRIC_HEALTH]: {
    text: '健康',
    theme: 'success',
  },
  [HEALTH_STATUS.METRIC_ABNORMAL]: {
    text: '异常',
    theme: 'danger',
  },
  [HEALTH_STATUS.METRIC_OFFLINE]: {
    text: '下线',
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
    text: '隔离',
    theme: 'danger',
  },
  [ISOLATE_STATUS.UNISOLATED]: {
    text: '不隔离',
    theme: 'text',
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
