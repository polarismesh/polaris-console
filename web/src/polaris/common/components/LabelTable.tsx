import { Table, SearchBox, Text } from 'tea-component'
import React from 'react'
import { scrollable, autotip } from 'tea-component/lib/table/addons'

interface Props {
  labels: Record<string, { value: string } | string>
}
export default function (props: Props) {
  if (!props.labels) {
    return (
      <Table
        records={[]}
        columns={[
          { key: 'key', header: '标签键' },
          { key: 'key', header: '标签值' },
        ]}
        addons={[
          scrollable({
            maxHeight: '500px',
          }),
        ]}
      ></Table>
    )
  }
  const [searchWord, setSearchWord] = React.useState('')

  const { labels } = props
  const records = Object.keys(labels || {})
    .map((item) => ({
      key: item,
      value: labels[item],
    }))
    .filter((item) => item.key.indexOf(searchWord) >= 0)
  return (
    <>
      <SearchBox
        value={searchWord}
        onChange={(value) => setSearchWord(value)}
        style={{ marginBottom: '20px' }}
      ></SearchBox>
      <Table
        bordered
        records={records}
        columns={[
          { key: 'key', header: '标签键', render: (x) => <Text tooltip={x.key}>{x.key}</Text> },
          { key: 'value', header: '标签值', render: (x) => <Text tooltip={x.value}>{x.value}</Text> },
        ]}
        addons={[
          scrollable({
            maxHeight: '500px',
          }),
          autotip({
            emptyText: '暂无标签',
          }),
        ]}
      ></Table>
    </>
  )
}
