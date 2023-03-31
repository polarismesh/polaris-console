import { CardBodyProps, CardProps, Card, LoadingTip } from 'tea-component'
import React from 'react'
import { useDuck } from 'saga-duck'
import { MetricConfig } from '../registryMonitor/MetricCardFetcher'
import { MetricPieCardFetcher } from './MetricPieCardFetcher'
import { BasicPie } from 'tea-chart'

interface Props {
  query: MetricConfig[]
  start: number
  end: number
  step: number
  cardProps?: CardProps
  cardBodyProps?: CardBodyProps
}
export default function(props: Props) {
  const { query, start, end, step, cardProps = {}, cardBodyProps = {} } = props
  const { dispatch, duck, store } = useDuck(MetricPieCardFetcher)
  const queryString = query.map(item => item.query).join(',')
  React.useEffect(() => {
    if (!query) return
    dispatch(duck.creators.fetch({ query, start, end, step }))
  }, [queryString, start, end, step])
  const { loading, data, filter } = duck.selector(store)
  if (!data) return <LoadingTip />
  const { pie } = data
  const metricConfigs = filter.query
  return (
    <Card {...cardProps}>
      <Card.Body {...cardBodyProps}>
        <div style={{ marginTop: '20px' }}>
          {loading && <LoadingTip style={{ margin: '245px auto' }} />}
          {pie && (
            <BasicPie
              circle
              height={250}
              legend={{
                align: 'right',
                custom: legendData => {
                  const sortedLegendData = pie.map(item => {
                    const target = legendData.find(legend => item.type === legend.key)
                    return target
                  })
                  legendData = sortedLegendData
                },
              }}
              dataSource={pie}
              position='value'
              color='type'
              dataLabels={{
                enable: true,
                formatter: (value, index, data) => {
                  const currentQuery = metricConfigs.find(item => item.name === data.serieName)
                  const labelName = currentQuery?.labelName
                  const unit = currentQuery?.unit
                  return `${labelName ? labelName : data.serieName}: ${data.value}${unit ? unit : ''}`
                },
              }}
            />
          )}
        </div>
      </Card.Body>
    </Card>
  )
}
