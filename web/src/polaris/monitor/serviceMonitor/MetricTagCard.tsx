import { CardBodyProps, CardProps, Card, LoadingTip, Col, Row } from 'tea-component'
import React from 'react'
import { useDuck } from 'saga-duck'
import { MetricConfig } from '../registryMonitor/MetricCardFetcher'
import { MetricTagCardFetcher } from './MetricTagCardFetcher'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { compressNumber } from '../registryMonitor/types'

insertCSS(
  `TagMonitor`,
  `
  .retcode-tag{
    width: 100%; 
    text-align:  center;  
    background-color: #f3f4f7;
    margin: 15px 15px 15px 0;
  }
`,
)

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
  const { dispatch, duck, store } = useDuck(MetricTagCardFetcher)
  const queryString = query.map(item => item.query).join(',')
  React.useEffect(() => {
    if (!query) return
    dispatch(duck.creators.fetch({ query, start, end, step }))
  }, [queryString, start, end, step])
  const { loading, data } = duck.selector(store)
  if (!data) return <LoadingTip />
  return (
    <Card {...cardProps}>
      <Card.Body {...cardBodyProps} subtitle={'(返回码|次数|占比)'}>
        <div style={{ marginTop: '20px' }}>{loading && <LoadingTip style={{ margin: '245px auto' }} />}</div>
        {data.length ? (
          <Row>
            {data.map(item => {
              return (
                <Col key={item.code} xxl={6} xl={8} lg={12} md={12} sm={12} xs={12}>
                  <section className={'retcode-tag'}>
                    <Row showSplitLine>
                      <Col>{item.code}</Col>
                      <Col>{compressNumber(item.value)}</Col>
                      <Col>{item.percent}%</Col>
                    </Row>
                  </section>
                </Col>
              )
            })}
          </Row>
        ) : (
          '暂无数据'
        )}
      </Card.Body>
    </Card>
  )
}
