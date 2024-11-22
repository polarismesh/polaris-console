import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'

import Duck from './PageDuck'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { Row, Col, Card, H2, Text, Form, Button, Input as TeaInput, Copy, Bubble } from 'tea-component'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
insertCSS(
  'login',
  `.login-background{
height:100vh;
width:100vw;
overflow:hidden;

}`,
)
export default purify(function (props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { ducks, creators, selector } = duck
  const { userName, password } = ducks.form.getAPI(store, dispatch).getFields(['userName', 'password'])
  const { preError } = selector(store)
  const licenseToolTip = preError && ''

  return (
    <div
      style={{ background: 'url(static/img/login-background.png)', backgroundSize: '100% 100%' }}
      className={'login-background'}
    >
      <img
        src={'static/img/logo-polaris.png'}
        style={{ width: '200px', position: 'absolute', top: 0, left: 0, padding: '15px' }}
      />
      <Row style={{ margin: '30vh 0 30vh 0', height: '40vh' }}>
        <Col span={4}></Col>

        <Col span={16}>
          <Row style={{ maxWidth: '1000px', margin: 'auto' }}>
            <Col span={15}>
              <Card
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '5vh 0',
                }}
                bordered
              >
                <Card.Body>
                  <Text parent={'div'} style={{ color: '#fff', fontSize: '24px', width: '550px' }}>
                    北极星服务治理中心
                  </Text>
                  <Text parent={'div'} style={{ color: 'rgba(255, 255, 255, 0.6)', width: '450px' }}>
                    一个支持多语言、多框架和异构基础设施的服务治理中心，提供服务发现、流量调度、熔断降级、限流鉴权和可观测性等服务治理功能。北极星治理中心默认提供服务注册功能，也可以搭配其他服务注册中心使用。
                  </Text>
                </Card.Body>
              </Card>
            </Col>
            <Col span={9}>
              <Card>
                <Card.Body>
                  <Row>
                    <Col>
                      <H2>
                        <Text align={'center'} parent={'div'} style={{ width: '100%' }}>
                          登录
                        </Text>
                      </H2>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Text theme={'weak'} parent={'div'} style={{ width: '100%' }} align={'center'}>
                        外网访问建议设置访问控制策略
                      </Text>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Text theme={'weak'} parent={'div'} style={{ width: '100%' }} align={'center'}>
                        初始用户名和密码为<Copy text={'polaris'}>polaris</Copy>/<Copy text={'polaris'}>polaris</Copy>
                      </Text>
                    </Col>
                  </Row>
                  <Form style={{ padding: '20px 0px' }}>
                    <FormField field={userName} label={'用户名'}>
                      <Input field={userName} size={'full'} disabled={preError} placeholder={licenseToolTip} />
                    </FormField>
                    <FormField field={password} label={'密码'}>
                      <TeaInput.Password
                        value={password.getValue() || ''}
                        size={'full'}
                        onChange={(v) => {
                          password.setValue(v)
                          password.setTouched(true)
                          password.setError('')
                        }}
                        onPressEnter={() => {
                          password.setError('')
                          dispatch(creators.submit())
                        }}
                        rules={false}
                        disabled={preError}
                        placeholder={licenseToolTip}
                      />
                    </FormField>
                  </Form>
                  <Row>
                    <Col span={8}></Col>
                    <Bubble content={licenseToolTip}>
                      <Col span={8}>
                        <Button
                          type={'primary'}
                          style={{ width: '100%', margin: 'auto' }}
                          onClick={() => {
                            password.setError('')
                            dispatch(creators.submit())
                          }}
                          disabled={preError}
                        >
                          登录
                        </Button>
                      </Col>
                    </Bubble>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col span={4}></Col>
      </Row>
    </div>
  )
})
