import * as React from 'react'
import { Column } from '../common/ducks/GridPage'
import { DuckCmpProps } from 'saga-duck'
import ServicePageDuck from './PageDuck'
import { Text } from 'tea-component'
import { EventRecord } from './model'

export default ({ duck: { selectors }, store }: DuckCmpProps<ServicePageDuck>): Column<EventRecord>[] => {
  const eventTypeMap = selectors.eventTypeMap(store)
  return [
    {
      key: 'event_type',
      header: '事件类型',
      render: (x) => eventTypeMap[x.event_type] || x.event_type,
    },
    {
      key: 'namespace',
      header: '命名空间',
      render: (x) => <Text>{x.namespace || '-'}</Text>,
    },
    {
      key: 'service',
      header: '服务',
      render: (x) => <Text tooltip={x.service}>{x.service || '-'}</Text>,
    },
    {
      key: 'instance_id',
      header: '影响对象',
      render: (x) => <Text tooltip={x.instance_id}>{x.instance_id || '-'}</Text>,
    },
    {
      key: 'event_time',
      header: '更新时间',
      render: (x) => <Text tooltip={x.event_time}>{x.event_time || '-'}</Text>,
    },
  ]
}
