import { CardBodyProps, CardProps, Card, LoadingTip, Row, Col, MetricsBoard, Text } from 'tea-component'
import React from 'react'
import { useDuck } from 'saga-duck'
import { BasicArea } from 'tea-chart'
import { MetricCardFetcher, QuerySet } from './MetricCardFetcher'
import { compressNumber, DefaultLineColors, roundToN } from './types'
import { useTranslation } from 'react-i18next'

interface Props {
  query: QuerySet[]
  start: number
  end: number
  step: number
  cardProps?: CardProps
  cardBodyProps?: CardBodyProps
}
export default function(props: Props) {
  const { t } = useTranslation()

  const { query, start, end, step, cardProps = {}, cardBodyProps = {} } = props
  const { dispatch, duck, store } = useDuck(MetricCardFetcher)
  const queryString = query.map(item => item.query).join(',')
  React.useEffect(() => {
    if (!query) return
    dispatch(duck.creators.fetch({ query, start, end, step }))
  }, [queryString, start, end, step])
  const { loading, data } = duck.selector(store)
  if (!data) return <LoadingTip />
  const { line, board } = data
  const colorArray = query.filter(item => item.color).map(item => item.color)

  return (
    <Card {...cardProps}>
      <Card.Body {...cardBodyProps} style={{ height: '500px' }}>
        {board.length > 0 && (
          <Row showSplitLine>
            {board.map(item => {
              const notValidNumber = !item.value && item.value !== 0
              return (
                <Col key={item.name}>
                  <MetricsBoard
                    title={<Text theme={'label'}>{item.name}</Text>}
                    value={notValidNumber ? '-' : compressNumber(item.value)}
                    unit={item.unit}
                  />
                </Col>
              )
            })}
          </Row>
        )}
        <div style={{ marginTop: '20px' }}>
          {loading && <LoadingTip style={{ margin: '245px auto' }} />}
          {line && (
            <BasicArea
              interaction={{
                zoom: { resetText: t('重置') },
              }}
              height={300}
              position={'time*value'}
              dataSource={line as any}
              color={'metric'}
              tooltip={{
                enable: true,
                formatter: values => {
                  return values.map(metaData => ({ ...metaData, valueText: roundToN(metaData.value, 2).toString() }))
                },
              }}
              size={1.5}
              theme={{
                color: colorArray.length ? colorArray : DefaultLineColors,
              }}
              areaStyle={{ fillOpacity: 0 }}
            ></BasicArea>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}
