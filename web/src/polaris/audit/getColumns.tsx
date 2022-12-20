import * as React from 'react'
import { Column } from '../common/ducks/GridPage'
import { DuckCmpProps } from 'saga-duck'
import ServicePageDuck from './PageDuck'
import { Text, Bubble } from 'tea-component'
import { OperationRecord } from './model'
import CopyableText from '../common/components/CopyableText'

export default ({ duck: { selectors }, store }: DuckCmpProps<ServicePageDuck>): Column<OperationRecord>[] => {
  const resourceTypeMap = selectors.resourceTypeMap(store)
  const operationTypeMap = selectors.operationTypeMap(store)

  return [
    {
      key: 'happen_time',
      header: '操作时间',
      render: (x) => x.happen_time,
    },
    {
      key: 'resource_type',
      header: '资源类型',
      render: (x) => <Text>{resourceTypeMap[x.resource_type] || x.resource_type}</Text>,
    },
    {
      key: 'namespace',
      header: '命名空间',
      render: (x) => <Text tooltip={x.namespace}>{x.namespace || '-'}</Text>,
    },
    {
      key: 'resource_name',
      header: '资源名称',
      render: (x) => <Text tooltip={x.resource_name}>{x.resource_name || '-'}</Text>,
    },
    {
      key: 'operation_type',
      header: '操作类型',
      render: (x) => (
        <Text tooltip={operationTypeMap[x.operation_type]}>
          {operationTypeMap[x.operation_type] || x.operation_type}
        </Text>
      ),
    },
    {
      key: 'operation_detail',
      header: '操作详情',
      render: (x) => (
        <Bubble content={x.operation_detail}>
          <CopyableText copyText={x.operation_detail} text={x.operation_detail}></CopyableText>
        </Bubble>
      ),
    },
    {
      key: 'operator',
      header: '操作人',
      render: (x) => <Text tooltip={x.operator}>{x.operator}</Text>,
    },
  ]
}
