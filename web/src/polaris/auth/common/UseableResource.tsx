import * as React from 'react'
import { purify } from 'saga-duck'
import { Table, Justify, Segment, SearchBox } from 'tea-component'
import { Link } from 'react-router-dom'
import { autotip } from 'tea-component/lib/table/addons'
import { StrategyResourceEntry } from '../model'
import { t } from 'i18next'

const ResourceOptions = [
  { text: t('命名空间'), value: 'namespaces' },
  { text: t('服务'), value: 'services' },
  { text: t('配置分组'), value: 'config_groups' },
]

interface Props {
  resources: {
    namespaces: StrategyResourceEntry[]
    services: StrategyResourceEntry[]
    configGroups: StrategyResourceEntry[]
  }
}
export default purify(function (props: Props) {
  const { resources } = props
  const [filterResourceType, setFilterResourceType] = React.useState('namespaces')
  const [keyword, setKeyword] = React.useState('')
  return (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <Segment
              value={filterResourceType}
              options={ResourceOptions}
              onChange={(v) => setFilterResourceType(v)}
            ></Segment>
          }
          right={<SearchBox value={keyword} onChange={(v) => setKeyword(v)} />}
        ></Justify>
      </Table.ActionPanel>
      <Table
        bordered
        recordKey={'id'}
        records={resources[filterResourceType]?.filter((item) =>
          item.name === '*' ? true : item?.name?.indexOf(keyword) > -1,
        )}
        columns={[
          {
            key: 'name',
            header: t('名称'),
            render: (x: any) => {
              if (x.name === '*') {
                return filterResourceType === 'namespaces' ? t('所有命名空间') : t('所有服务')
              }
              return filterResourceType === 'namespaces' ? (
                x.name
              ) : (
                <Link to={`/service-detail?name=${x.name}&namespace=${x.namespace}`}>{x.name}</Link>
              )
            },
          },
          {
            key: 'auth',
            header: t('权限'),
            render: () => {
              return t('读｜写')
            },
          },
        ]}
        addons={[autotip({})]}
      ></Table>
    </>
  )
})
