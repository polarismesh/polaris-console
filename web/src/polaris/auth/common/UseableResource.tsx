import * as React from 'react'
import { purify } from 'saga-duck'
import { Table, Justify, Segment, SearchBox } from 'tea-component'
import { Link } from 'react-router-dom'
import { autotip } from 'tea-component/lib/table/addons'
import { StrategyResourceEntry } from '../model'
import { useTranslation } from 'react-i18next'
import i18n from '@src/polaris/common/util/i18n'

const ResourceOptions = [
  { text: i18n.t('命名空间'), value: 'namespaces' },
  { text: i18n.t('服务'), value: 'services' },
  { text: i18n.t('配置分组'), value: 'config_groups' },
]

interface Props {
  resources: {
    namespaces: StrategyResourceEntry[]
    services: StrategyResourceEntry[]
    configGroups: StrategyResourceEntry[]
  }
}
export default purify(function(props: Props) {
  const { t } = useTranslation()

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
              onChange={v => setFilterResourceType(v)}
            ></Segment>
          }
          right={<SearchBox value={keyword} onChange={v => setKeyword(v)} />}
        ></Justify>
      </Table.ActionPanel>
      <Table
        bordered
        recordKey={'id'}
        records={resources[filterResourceType]?.filter(item =>
          item.name === '*' ? true : item?.name?.indexOf(keyword) > -1,
        )}
        columns={[
          {
            key: 'name',
            header: t('名称'),
            render: (x: any) => {
              if (x.name === '*') {
                if (filterResourceType === 'namespaces') {
                  return t('所有命名空间')
                }
                if (filterResourceType === 'service') {
                  return t('所有服务')
                }
                return t('所有配置分组')
              }
              if (filterResourceType === 'namespaces') {
                return x.name
              }
              if (filterResourceType === 'service') {
                return <Link to={`/service-detail?name=${x.name}&namespace=${x.namespace}`}>{x.name}</Link>
              }
              return <Link to={`/filegroup-detail?name=${x.name}&namespace=${x.namespace}`}>{x.name}</Link>
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
