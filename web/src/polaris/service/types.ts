import { BuildConfig } from '@src/buildConfig/Base'

export interface Service {
  id: string
  name: string
  namespace: string
  ports: string
  comment: string
  ctime: string
  mtime: string
  revision: string
  department: string
  business: string
  metadata: Record<string, string>
  editable: boolean
}

export interface Namespace {
  comment: string
  ctime: string
  mtime: string
  name: string
  owners?: string
  token: string
  editable: boolean
}

export const READ_ONLY_NAMESPACE = BuildConfig.readonlyNamespace
