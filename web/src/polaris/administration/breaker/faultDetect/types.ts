import { KeyValuePair } from '@src/polaris/configuration/fileGroup/types'

export interface FaultDetectRule {
  id?: string
  name: string
  description: string
  targetService: {
    namespace: string
    service: string
    method: {
      type: string
      value: string
    }
  }
  interval: number
  timeout: number
  port: number
  // 协议，支持HTTP, TCP, UPD
  protocol: string
  httpConfig?: {
    method: string
    url: string
    headers: KeyValuePair[]
    body: string
  }
  tcpConfig?: {
    send: string
    receive: string[]
  }
  udpConfig?: {
    send: string
    receive: string[]
  }
  ctime?: string
  mtime?: string
  editable: boolean
  deleteable: boolean
}
export enum FaultDetectProtocol {
  HTTP = 'HTTP',
  TCP = 'TCP',
  UDP = 'UDP',
}
export const FaultDetectProtocolOptions = Object.keys(FaultDetectProtocol).map(item => ({ text: item, value: item }))
export enum FaultDetectHttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  OPTION = 'OPTION',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  CONNECT = 'CONNECT',
  TRACE = 'TRACE',
}
export const FaultDetectHttpMethodOptions = Object.keys(FaultDetectHttpMethod).map(item => ({
  text: item,
  value: item,
}))
export const BlockHttpBodyMethod = [
  FaultDetectHttpMethod.GET,
  FaultDetectHttpMethod.DELETE,
  FaultDetectHttpMethod.HEAD,
] as string[]
