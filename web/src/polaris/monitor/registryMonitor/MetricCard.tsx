import { CardBodyProps, CardProps, Card, LoadingTip, Row, Col, MetricsBoard, Text } from 'tea-component'
import React from 'react'
import { useDuck } from 'saga-duck'
import { BasicArea } from 'tea-chart'
import { MetricCardFetcher, QuerySet } from './MetricCardFetcher'

interface Props {
  query: QuerySet[]
  start: number
  end: number
  step: number
  cardProps?: CardProps
  cardBodyProps?: CardBodyProps
}
export default function(props: Props) {
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
  return (
    <Card {...cardProps}>
      <Card.Body {...cardBodyProps} style={{ height: '500px' }}>
        {board.length > 0 && (
          <Row showSplitLine>
            {board.map(item => (
              <Col key={item.name}>
                <MetricsBoard
                  title={<Text theme={'label'}>{item.name}</Text>}
                  value={!item.value && item.value !== 0 ? '-' : item.value}
                  unit={item.unit}
                />
              </Col>
            ))}
          </Row>
        )}
        <div style={{ marginTop: '20px' }}>
          {loading && <LoadingTip style={{ margin: '245px auto' }} />}
          {line && (
            <BasicArea height={300} position={'time*value'} dataSource={line as any} color={'metric'}></BasicArea>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}
