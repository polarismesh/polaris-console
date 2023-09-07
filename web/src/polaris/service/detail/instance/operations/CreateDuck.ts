import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { put, select } from 'redux-saga/effects'
import { resolvePromise } from 'saga-duck/build/helper'
import { createInstances, CreateInstanceParams, modifyInstances, ModifyInstanceParams } from '../model'
import { Instance, BATCH_EDIT_TYPE, InstanceLocation } from '../types'
import { KeyValuePair } from '@src/polaris/configuration/fileGroup/types'

export interface DialogOptions {
  isModify: boolean
  service: string
  namespace: string
  instance?: Instance
  instances?: Instance[]
  batchEditType?: BATCH_EDIT_TYPE
}
export const enableNearbyString = 'internal-enable-nearby'
export const convertMetaData = (metaData: Record<string, string>): Array<KeyValuePair> => {
  return Object.entries(metaData).map(([key, value]) => ({ key, value }))
}

function convertLocation(loc: InstanceLocation) {
  return {
    location_campus: loc.campus,
    location_region: loc.region,
    location_zone: loc.zone,
  }
}

const generateParams = params => {
  const {
    host,
    port,
    weight,
    protocol,
    version,
    metadata,
    healthy,
    isolate,
    enableHealthCheck,
    healthCheckMethod,
    ttl,
    service,
    namespace,
    location_region,
    location_zone,
    location_campus,
  } = params
  const metadataObject = metadata.reduce((preV: Record<string, string>, curV: KeyValuePair) => {
    preV[curV.key] = curV.value
    return preV
  }, {})

  const operateRequests = [] as CreateInstanceParams[]
  const splitRegex = /,|;|\n|\s/
  const hosts = host.split(splitRegex)
  const ports = port.split(splitRegex)
  hosts.forEach(host => {
    if (!host) return
    ports.forEach(port => {
      if (!port) return
      operateRequests.push({
        host,
        port: Number(port),
        weight,
        protocol,
        version,
        metadata: metadataObject,
        healthy,
        isolate,
        enable_health_check: enableHealthCheck,
        health_check: enableHealthCheck
          ? {
              type: healthCheckMethod,
              heartbeat: {
                ttl,
              },
            }
          : undefined,
        service,
        namespace,
        location: {
          region: location_region,
          zone: location_zone,
          campus: location_campus,
        },
      })
    })
  })
  return operateRequests
}
const generateModifyParams = params => {
  const {
    weight,
    protocol,
    version,
    metadata,
    healthy,
    isolate,
    enableHealthCheck,
    healthCheckMethod,
    ttl,
    service,
    namespace,
    instance,
    location_region,
    location_zone,
    location_campus,
  } = params
  const metadataObject = metadata.reduce((preV: Record<string, string>, curV: KeyValuePair) => {
    preV[curV.key] = curV.value
    return preV
  }, {})

  if (instance?.id) {
    return [
      {
        weight,
        protocol,
        version,
        metadata: metadataObject,
        healthy,
        isolate,
        enable_health_check: enableHealthCheck,
        health_check: enableHealthCheck
          ? {
              type: healthCheckMethod,
              heartbeat: {
                ttl,
              },
            }
          : undefined,
        service,
        namespace,
        location: {
          region: location_region,
          zone: location_zone,
          campus: location_campus,
        },
        id: instance.id,
      },
    ] as ModifyInstanceParams[]
  }
}

const generateBatchModifyParams = params => {
  const modifyPart = params[params.batchEditType]
  const modifyParams = params.instances.map(instance => {
    const {
      weight,
      protocol,
      version,
      healthy,
      isolate,
      metadata,
      service,
      namespace,
      id,
      healthCheck,
      enableHealthCheck,
      location,
    } = instance
    return {
      weight,
      protocol,
      version,
      metadata,
      healthy,
      isolate,
      enable_health_check: enableHealthCheck,
      health_check: healthCheck,
      service,
      namespace,
      id,
      location,
      [params.batchEditType]: modifyPart,
    }
  })
  return modifyParams
}
export default class CreateDuck extends FormDialog {
  Options: DialogOptions
  get Form() {
    return CreateForm
  }
  get quickTypes() {
    enum Types {
      SET_NAMESPACE_LIST,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  *beforeSubmit() {
    const {
      ducks: { form },
    } = this
    yield put(form.creators.setAllTouched(true))
    const firstInvalid = yield select(form.selectors.firstInvalid)
    if (firstInvalid) {
      throw false
    }
  }
  *onSubmit() {
    const {
      selectors,
      ducks: { form },
    } = this
    const options = selectors.options(yield select())
    const values = form.selectors.values(yield select())

    if (options.batchEditType && options.instances) {
      const res = yield* resolvePromise(modifyInstances(generateBatchModifyParams({ ...values, ...options })))
      return res
    }
    if (options.isModify) {
      const res = yield* resolvePromise(modifyInstances(generateModifyParams({ ...values, ...options })))
      return res
    } else {
      const res = yield* resolvePromise(createInstances(generateParams({ ...values, ...options })))
      return res
    }
  }

  *onShow() {
    yield* super.onShow()
    const {
      selectors,
      ducks: { form },
    } = this
    const options = selectors.options(yield select())
    const data = selectors.data(yield select())
    yield put(form.creators.setMeta(options))
    yield put(
      form.creators.setValues({
        weight: 100,
        healthy: true,
        enableHealthCheck: false,
        ...data,
        metadata: convertMetaData(((data.metadata as unknown) as Record<string, string>) || {}),
        ...(options.instance
          ? {
              healthCheckMethod: options.instance.healthCheck?.type,
              ttl: options.instance.healthCheck?.heartbeat?.ttl,
            }
          : {}),
        ...convertLocation((data as any).location ?? {}),
      }),
    )
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export interface Values {
  host: string
  port: string
  weight: number
  protocol: string
  version: string
  metadata: Array<KeyValuePair>
  healthy: boolean
  isolate: boolean
  enableHealthCheck: boolean
  healthCheckMethod: string
  ttl: number
  location_region: string
  location_zone: string
  location_campus: string
}
class CreateForm extends Form {
  Values: Values
  Meta: {}
  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}
const validator = CreateForm.combineValidators<Values, {}>({
  host(v) {
    if (!v) {
      return '请填写IP'
    }
  },
  port(v) {
    if (!v) {
      return '请填写端口'
    }
  },
  weight(v) {
    if (v === undefined) {
      return '请填写权重'
    }
  },
  healthCheckMethod(v, meta) {
    if (!meta.enableHealthCheck) {
      return
    }
    if (!v) {
      return '请选择检查方式'
    }
  },
  ttl(v, meta) {
    if (!meta.enableHealthCheck) {
      return
    }
    if (!v) {
      return '请填写TTL'
    }
  },
})
