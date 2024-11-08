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
  deleteable: boolean
  healthy_instance_count?: string
  total_instance_count?: string
  sync_to_global_registry?: boolean
  export_to?: string[]
}

export interface Namespace {
  comment: string
  ctime: string
  mtime: string
  name: string
  owners?: string
  token: string
  editable: boolean
  deleteable: boolean
  total_service_count?: number
  total_health_instance_count?: number
  total_instance_count?: number
  service_export_to?: string[]
  sync_to_global_registry: boolean
}

export const READ_ONLY_NAMESPACE = BuildConfig.readonlyNamespace
