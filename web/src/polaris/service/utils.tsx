import { Namespace, READ_ONLY_NAMESPACE } from './types'
import { ExternalLink, Modal, Table, notification } from 'tea-component'
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
    message: `标签展示`,
    description: (
      <>
        <LabelTable labels={labels}></LabelTable>
      </>
    ),
  })
}
let hasNologinTip = false
export const showNoLoginTip = () => {
  if (hasNologinTip) return
  const tcsConsole = `${window.location.protocol}//${window.location.host.replace('polaris', 'o')}`
  hasNologinTip = true
  notification.error({
    description: (
      <>
        北极星未登录，请前往<ExternalLink href={tcsConsole}>TCS控制台</ExternalLink>登录。
      </>
    ),
    duration: 0,
    onClose: () => {
      hasNologinTip = false
    },
  })
}
