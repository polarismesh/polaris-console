import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { Card, Col, Form, LoadingTip, Row, Text, FormItem, FormText, Bubble } from 'tea-component'
import BaseInfoDuck from './PageDuck'
import { CheckVisibilityMode, VisibilityModeMap, enableNearbyString } from '../../operation/CreateDuck'

export default function BaseInfo(props: DuckCmpProps<BaseInfoDuck>) {
  const { duck, store } = props
  const { selector } = duck
  const { loading, data } = selector(store)
  if (loading) return <LoadingTip />
  if (!data) return <noscript />
  const serviceTags = Object.keys(data.metadata || {})
    .filter(item => item !== enableNearbyString)
    .map(item => `${item}:${data.metadata[item]}`)
  const visibilityMode = CheckVisibilityMode(data.export_to, data.name)
  return (
    <>
      <Card>
        <Card.Body>
          <Form layout='inline'>
            <Row>
              <Col>
                <FormItem label={'命名空间'}>
                  <FormText>{data.namespace}</FormText>
                </FormItem>
                <FormItem label={'服务名'}>
                  <FormText>{data.name}</FormText>
                </FormItem>
                <FormItem label={'可见性'}>
                  <FormText>
                    <Text>
                      <>
                        {visibilityMode ? (
                          VisibilityModeMap[visibilityMode]
                        ) : (
                          <Bubble
                            trigger={'click'}
                            content={
                              <Text>
                                <Text parent={'div'}>{'服务可见的命名空间列表'}</Text>
                                {data.export_to?.map(item => (
                                  <Text parent={'div'} key={item}>
                                    {item}
                                  </Text>
                                ))}
                              </Text>
                            }
                          >
                            {data.export_to ? data.export_to?.slice(0, 3)?.join(',') + '...' : '-'}
                          </Bubble>
                        )}
                      </>
                    </Text>
                  </FormText>
                </FormItem>
                <FormItem label={'部门'}>
                  <FormText>{data.department || '-'}</FormText>
                </FormItem>
                <FormItem label={'业务'}>
                  <FormText>{data.business || '-'}</FormText>
                </FormItem>
                <FormItem label={'创建时间'}>
                  <FormText>{data.ctime}</FormText>
                </FormItem>
                <FormItem label={'修改时间'}>
                  <FormText>{data.mtime}</FormText>
                </FormItem>
                <FormItem label={'版本号'}>
                  <FormText>{data.revision}</FormText>
                </FormItem>
                <FormItem label={`服务标签(${serviceTags.length}个)`}>
                  <FormText>{serviceTags.join(' ; ') || '-'}</FormText>
                </FormItem>
                <FormItem label={'描述'}>
                  <FormText>{data.comment || '-'}</FormText>
                </FormItem>
                <FormItem label={'就近访问'}>
                  <FormText>{data.metadata?.[enableNearbyString] ? '开启' : '关闭'}</FormText>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </>
  )
}
