//主被调规则的目的地和源类型相反
export interface InboundItem {
  destinations: Destination[]
  sources: Source[]
}
export interface OutboundItem {
  destinations: Destination[]
  sources: Source[]
}
export interface Destination {
  service: string
  namespace: string
  metadata: Record<string, RouteMetadata>
  priority: number
  weight: number
  isolate: boolean
}
export interface Source {
  service: string
  namespace: string
  metadata: Record<string, RouteMetadata>
}

export interface SourceItem {
  service: string
  namespace: string
  metadata: Array<MetadataItem>
}

export interface DestinationItem {
  service: string
  namespace: string
  metadata: Array<MetadataItem>
  priority: number
  weight: number
  isolate: boolean
}

export interface MetadataItem {
  key: string
  value: string
  type?: MATCH_TYPE
}

export enum MATCH_TYPE {
  EXACT = 'EXACT',
  REGEX = 'REGEX',
}

export const MATCH_TYPE_MAP = {
  [MATCH_TYPE.EXACT]: {
    text: '精确',
  },
  [MATCH_TYPE.REGEX]: {
    text: '正则',
  },
}

export interface RouteMetadata {
  value: string
  type?: MATCH_TYPE
}

export enum RuleType {
  Inbound = 'inbounds',
  Outbound = 'outbounds',
}

export const RULE_TYPE_STATUS_MAP = {
  [RuleType.Inbound]: {
    text: '被调规则',
  },
  [RuleType.Outbound]: {
    text: '主调规则',
  },
}

export const RULE_TYPE_OPTIONS = [
  {
    text: RULE_TYPE_STATUS_MAP[RuleType.Inbound].text,
    value: RuleType.Inbound,
  },
  {
    text: RULE_TYPE_STATUS_MAP[RuleType.Outbound].text,
    value: RuleType.Outbound,
  },
]

export enum EditType {
  Table = 'table',
  Json = 'json',
}

export const EDIT_TYPE_MAP = {
  [EditType.Table]: {
    text: '图表编辑',
  },
  // [EditType.Json]: {
  //   text: "JSON编辑",
  // },
}

export const EDIT_TYPE_OPTION = Object.keys(EDIT_TYPE_MAP).map(key => ({
  text: EDIT_TYPE_MAP[key].text,
  value: key,
}))
export const MATCH_TYPE_OPTIONS = [
  {
    text: MATCH_TYPE_MAP[MATCH_TYPE.EXACT].text,
    value: MATCH_TYPE.EXACT,
  },
  {
    text: MATCH_TYPE_MAP[MATCH_TYPE.REGEX].text,
    value: MATCH_TYPE.REGEX,
  },
]

export const getTemplateRouteInbounds = (namespace, service) => `[
  {
    "sources": [
      {
        "service": "*",
        "namespace": "*",
        "metadata": {
          "labelKey": {
            "value": "labelValue",
            "type": "EXACT"
          }
        }
      }
    ],
    "destinations": [
      {
        "service": "${service}",
        "namespace": "${namespace}",
        "metadata": {
          "env": {
            "value": "test"
          }
        },
        "priority": 0,
        "weight": 100,
        "isolate": false
      }
    ]
  }
]
`

export const getTemplateRouteOutbounds = (namespace, service) => `[
  {
    "sources": [
      {
        "service": "${service}",
        "namespace": "${namespace}",

        "metadata": {
          "labelKey": {
            "type": "EXACT",
            "value": "labelValue"
          }
        }
      }
    ],
    "destinations": [
      {
        "service": "*",
        "namespace": "*",
        "metadata": {
          "env": {
            "value": "test"
          }
        },
        "priority": 0,
        "weight": 100,
        "isolate": false
      }
    ]
  }
]
`
