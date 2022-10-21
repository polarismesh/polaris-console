import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { Card, Col, Form, LoadingTip, Row, FormItem, FormText } from 'tea-component'
import BaseInfoDuck from './PageDuck'
import { enableNearbyString } from '../../operation/CreateDuck'
import { t } from 'i18next'

export default function BaseInfo(props: DuckCmpProps<BaseInfoDuck>) {
  const { duck, store } = props
  const { selector } = duck
  const { loading, data } = selector(store)
  if (loading) return <LoadingTip />
  if (!data) return <noscript />
  const serviceTags = Object.keys(data.metadata || {})
    .filter((item) => item !== enableNearbyString)
    .map((item) => `${item}:${data.metadata[item]}`)
  return (
    <>
      <Card>
        <Card.Body>
          <Form layout='inline'>
            <Row>
              <Col>
                <FormItem label={t('命名空间')}>
                  <FormText>{data.namespace}</FormText>
                </FormItem>
                <FormItem label={t('服务名')}>
                  <FormText>{data.name}</FormText>
                </FormItem>
                <FormItem label={t('部门')}>
                  <FormText>{data.department || '-'}</FormText>
                </FormItem>
                <FormItem label={t('业务')}>
                  <FormText>{data.business || '-'}</FormText>
                </FormItem>
                <FormItem label={t('创建时间')}>
                  <FormText>{data.ctime}</FormText>
                </FormItem>
                <FormItem label={t('修改时间')}>
                  <FormText>{data.mtime}</FormText>
                </FormItem>
                <FormItem label={t('版本号')}>
                  <FormText>{data.revision}</FormText>
                </FormItem>
                <FormItem label={t('服务标签({{attr0}}个)', { attr0: serviceTags.length })}>
                  <FormText>{serviceTags.join(' ; ') || '-'}</FormText>
                </FormItem>
                <FormItem label={t('描述')}>
                  <FormText>{data.comment || '-'}</FormText>
                </FormItem>
                <FormItem label={t('就近访问')}>
                  <FormText>{data.metadata?.[enableNearbyString] ? t('开启') : t('关闭')}</FormText>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </>
  )
}
