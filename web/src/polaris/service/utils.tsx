import { Namespace, READ_ONLY_NAMESPACE } from './types'
import { Modal } from 'tea-component'
import React from 'react'
import LabelTable from '../common/components/LabelTable'
import { ConfigFileGroup } from '../configuration/fileGroup/types'

export const isReadOnly = (namespace: string) => {
  return READ_ONLY_NAMESPACE.indexOf(namespace) !== -1
}

export const isReadOnlyNamespace = (namespace: Namespace) => {
  return !namespace.editable
}

export const isReadOnlyConfigGroup = (group: ConfigFileGroup) => {
  return !group.editable
}

export const showAllLabels = labels => {
  Modal.confirm({
    message: `标签展示`,
    description: (
      <>
        <LabelTable labels={labels}></LabelTable>
      </>
    ),
  })
}
export const InternalSyncKey = 'internal-sync-from-local-registry'
export const checkGlobalRegistry = x => {
  const hasSyncGlobal = Object.entries(x.metadata).find(([key, value]) => key === InternalSyncKey && value === 'true')
  return !!hasSyncGlobal
}
