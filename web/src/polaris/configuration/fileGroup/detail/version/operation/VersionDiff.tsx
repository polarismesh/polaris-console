import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import Duck from './VersionDiffDuck'
import FileDiff from '../../file/FileDiff'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import { Row, Col, Form, FormItem, FormText, Select } from 'tea-component'

export default purify(function(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selector, creators } = duck
  const { data, versionList, versionMap, comparedVersion } = selector(store)
  if (!data) return <noscript />
  const { currentRelease } = data
  const compareRelease = versionMap[comparedVersion]
  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      title={'版本对比'}
      size={1000}
      buttons={[]}
      defaultCancel={false}
      defaultSubmit={false}
    >
      {versionList?.length === 0 ? (
        <>{'无可用版本'}</>
      ) : (
        <>
          <Row>
            <Col>
              <Form layout={'inline'}>
                <FormItem label={'所选版本'}>
                  <FormText>{currentRelease?.name}</FormText>
                </FormItem>
              </Form>
            </Col>
            <Col>
              <Form layout={'inline'}>
                <FormItem label={'对比版本'}>
                  {comparedVersion ? (
                    <Select
                      appearance={'button'}
                      options={versionList || []}
                      onChange={v => dispatch(creators.selectVersion(v))}
                      value={comparedVersion}
                    ></Select>
                  ) : (
                    <FormText>{'无其他版本'}</FormText>
                  )}
                </FormItem>
              </Form>
            </Col>
          </Row>
          <FileDiff
            original={currentRelease?.content || ''}
            now={compareRelease ? compareRelease?.content : ''}
            format={currentRelease?.format}
            originTitle={<>{currentRelease?.name}</>}
            nowTitle={<>{compareRelease?.name}</>}
          />
        </>
      )}
    </Dialog>
  )
})
