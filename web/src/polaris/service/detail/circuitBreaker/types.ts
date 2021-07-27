//主被调规则的目的地和源类型相反
export interface InboundItem {
  destinations: Destination[];
  sources: Source[];
}
export interface OutboundItem {
  destinations: Destination[];
  sources: Source[];
}

export interface Metadata {
  value: string;
  type?: MATCH_TYPE;
}
export enum BREAK_RESOURCE_TYPE {
  SUBSET = "SUBSET",
  INSTANCE = "INSTANCE",
}
export interface Destination {
  service?: string;
  namespace?: string;
  metadata: Record<string, Metadata>;
  metricWindow: string;
  metricPrecision: number;
  updateInterval: string;
  recover: Recover;
  policy: {
    errorRate: ErrorRate;
    slowRate: SlowRate;
    consecutive: ConsecutiveError;
  };
  resource: BREAK_RESOURCE_TYPE;
  comment: string;
  ctime: string;
  mtime: string;
  revision: string;
}
export interface Recover {
  sleepWindow: string;
  requestRateAfterHalfOpen?: Array<number>;
  outlierDetectWhen: OutlierDetectWhen;
}
export interface ErrorRate {
  enable: boolean;
  requestVolumeThreshold?: number;
  errorRateToPreserved?: number;
  errorRateToOpen?: number;
  specials?: any;
}
export interface SlowRate {
  enable: boolean;
  maxRt: number | string;
  slowRateToPreserved: number;
  slowRateToOpen: number;
}
export interface ConsecutiveError {
  enable: boolean;
  consecutiveErrorToOpen: number;
}
export interface Source {
  service?: string;
  namespace?: string;
  labels: Record<string, RouteMetadata>;
}

export interface SourceItem {
  service: string;
  namespace: string;
  labels?: Array<MetadataItem>;
}

export interface DestinationItem {
  service: string;
  namespace: string;
  metadata?: Array<MetadataItem>;
  recover: Recover;
  policy: PolicyItem[];
  resource: BREAK_RESOURCE_TYPE;
  resourceSetMark?: string;
  method?: {
    value: string;
  };
}

export interface PolicyItem
  extends Partial<ErrorRate & SlowRate & ConsecutiveError> {
  policyName: string;
}

export interface MetadataItem {
  key: string;
  value: string;
  type?: MATCH_TYPE;
}

export enum MATCH_TYPE {
  EXACT = "EXACT",
  REGEX = "REGEX",
}

export enum PolicyName {
  ErrorRate = "errorRate",
  SlowRate = "slowRate",
  ConsecutiveError = "consecutive",
}
export const PolicyMap = {
  [PolicyName.ErrorRate]: {
    text: "错误率",
    unit: "%",
  },
  // [PolicyName.SlowRate]: {
  //   text: "超时率",
  //   unit: "%"
  // },
  [PolicyName.ConsecutiveError]: {
    text: "连续错误率",
    unit: "个",
  },
};
export const PolicyNameOptions = [
  {
    text: PolicyMap[PolicyName.ErrorRate].text,
    value: PolicyName.ErrorRate,
  },
  {
    text: PolicyMap[PolicyName.ConsecutiveError].text,
    value: PolicyName.ConsecutiveError,
  },
];
export const BREAK_RESOURCE_TYPE_MAP = {
  [BREAK_RESOURCE_TYPE.INSTANCE]: {
    text: "实例",
  },
  [BREAK_RESOURCE_TYPE.SUBSET]: {
    text: "实例分组",
  },
};
export const BreakResourceOptions = [
  {
    text: BREAK_RESOURCE_TYPE_MAP[BREAK_RESOURCE_TYPE.INSTANCE].text,
    value: BREAK_RESOURCE_TYPE.INSTANCE,
  },
  {
    text: BREAK_RESOURCE_TYPE_MAP[BREAK_RESOURCE_TYPE.SUBSET].text,
    value: BREAK_RESOURCE_TYPE.SUBSET,
  },
];
export const MATCH_TYPE_MAP = {
  [MATCH_TYPE.EXACT]: {
    text: "精确",
  },
  [MATCH_TYPE.REGEX]: {
    text: "正则",
  },
};

export interface RouteMetadata {
  value: string;
  type?: MATCH_TYPE;
}

export enum RuleType {
  Inbound = "inbounds",
  Outbound = "outbounds",
}

export const RULE_TYPE_STATUS_MAP = {
  [RuleType.Inbound]: {
    text: "被调规则",
  },
  [RuleType.Outbound]: {
    text: "主调规则",
  },
};

export const RULE_TYPE_OPTIONS = [
  {
    text: RULE_TYPE_STATUS_MAP[RuleType.Inbound].text,
    value: RuleType.Inbound,
  },
  {
    text: RULE_TYPE_STATUS_MAP[RuleType.Outbound].text,
    value: RuleType.Outbound,
  },
];

export const MATCH_TYPE_OPTIONS = [
  {
    text: MATCH_TYPE_MAP[MATCH_TYPE.EXACT].text,
    value: MATCH_TYPE.EXACT,
  },
  {
    text: MATCH_TYPE_MAP[MATCH_TYPE.REGEX].text,
    value: MATCH_TYPE.REGEX,
  },
];
export enum OutlierDetectWhen {
  NEVER = "NEVER",
  ON_RECOVER = "ON_RECOVER",
  ALWAYS = "ALWAYS",
}
export const OUTLIER_DETECT_MAP = {
  [OutlierDetectWhen.NEVER]: {
    text: "关闭",
  },
  [OutlierDetectWhen.ON_RECOVER]: {
    text: "仅用于恢复",
  },
  [OutlierDetectWhen.ALWAYS]: {
    text: "用于熔断和恢复",
  },
};

export const OUTLIER_DETECT_MAP_OPTIONS = [
  {
    text: OUTLIER_DETECT_MAP[OutlierDetectWhen.NEVER].text,
    value: OutlierDetectWhen.NEVER,
  },
  {
    text: OUTLIER_DETECT_MAP[OutlierDetectWhen.ON_RECOVER].text,
    value: OutlierDetectWhen.ON_RECOVER,
  },
  {
    text: OUTLIER_DETECT_MAP[OutlierDetectWhen.ALWAYS].text,
    value: OutlierDetectWhen.ALWAYS,
  },
];
export const getTemplateCircuitBreakerInbounds = () => `{
  "sources": [
      {
          "service": "*",
          "namespace": "*",
          "labels": {
              "labelKey": {
                 "type": "EXACT",
                  "value": "labelValue"
              }
          }
      }
  ],
  "destinations": [
      {
          "resource": "INSTANCE",
          "recover": {
              "sleepWindow": "1s",
              "outlierDetectWhen": "ON_RECOVER"
          },
          "policy": {
              "errorRate": {
                  "enable": true,
                  "errorRateToOpen": 50
              },
             "consecutive": {
                  "enable": true,
                  "consecutiveErrorToOpen": 10
              }

          },
          "method": {
             "type": "EXACT",
              "value": "methodName"
          }
      }
  ]
}
`;

export const getTemplateCircuitBreakerOutbounds = () => `{
  "sources": [
      {
          "labels": {
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
          "resource": "INSTANCE",
          "recover": {
              "sleepWindow": "1s",
              "outlierDetectWhen": "ON_RECOVER"
          },
          "policy": {
              "errorRate": {
                  "enable": true,
                  "requestVolumeThreshold": 10,
                  "errorRateToOpen": 50
              },
             "consecutive": {
                  "enable": true,
                  "consecutiveErrorToOpen": 10
              }
          },
          "method": {
             "type": "EXACT",
              "value": "methodName"
          }
      }
  ]
}

`;
