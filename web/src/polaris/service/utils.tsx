import { t } from 'i18next'
import { Namespace, READ_ONLY_NAMESPACE } from './types'
import { Modal, Table } from 'tea-component'
import React from 'react'
import { scrollable } from 'tea-component/lib/table/addons'
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
    message: t('标签展示', {}),
    description: (
      <>
        <LabelTable labels={labels}></LabelTable>
      </>
    ),
  })
}
