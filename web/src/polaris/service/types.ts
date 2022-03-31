import BuildConfig from '@src/buildConfig/index'

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
  healthy_instance_count?: string
  total_instance_count?: string
}

export interface Namespace {
  comment: string
  ctime: string
  mtime: string
  name: string
  owners?: string
  token: string
  editable: boolean
  total_service_count?: number
  total_health_instance_count?: number
  total_instance_count?: number
}

export const READ_ONLY_NAMESPACE = BuildConfig.readonlyNamespace
