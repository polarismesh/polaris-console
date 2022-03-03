import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'

import Duck from './PageDuck'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { Row, Col, Card, H2, Text, Form, Button, Input as TeaInput } from 'tea-component'
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
export default purify(function(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { ducks, creators } = duck
  const { userName, password } = ducks.form.getAPI(store, dispatch).getFields(['userName', 'password'])
  return (
    <div
      style={{ background: 'url(/static/img/login-background.png)', backgroundSize: '100% 100%' }}
      className={'login-background'}
    >
      {/* <img src={'/static/img/login-background.png'} className={'login-background'} /> */}
      <Row style={{ margin: '30vh 0 30vh 0', height: '40vh' }}>
        <Col span={4}></Col>

        <Col span={10}>
          <Card style={{ backgroundColor: 'transparent', border: 'none', padding: '5vh 0' }} bordered>
            <Card.Body title={<img src={'/static/img/logo-polaris.png'} style={{ width: '40%' }} />}>
              <Text parent={'div'} style={{ color: '#fff', fontSize: '24px', width: '550px' }}>
                注册配置治理中心 PolarisMesh（北极星）
              </Text>
              <Text parent={'div'} style={{ color: 'rgba(255, 255, 255, 0.6)', width: '450px' }}>
                一个支持多语言、多框架的云原生服务发现、配置管理、治理中心。用于解决分布式或者微服务架构中的服务注册与发现、故障容错、流量控制和安全问题，快速部署、高可用容灾、免运维、一键搭建。
              </Text>
            </Card.Body>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ height: '100%' }}>
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
                    公网访问建议开启访问策略控制
                  </Text>
                </Col>
              </Row>
              <Form style={{ padding: '20px 0px' }}>
                <FormField field={userName} label={'用户名'}>
                  <Input field={userName} size={'full'} />
                </FormField>
                <FormField field={password} label={'密码'}>
                  <TeaInput.Password
                    value={password.getValue() || ''}
                    size={'full'}
                    onChange={v => {
                      password.setValue(v)
                      password.setTouched(true)
                    }}
                    onPressEnter={() => dispatch(creators.submit())}
                    rules={false}
                  />
                </FormField>
              </Form>
              <Row>
                <Col span={8}></Col>
                <Col span={8}>
                  <Button
                    type={'primary'}
                    style={{ width: '100%', margin: 'auto' }}
                    onClick={() => dispatch(creators.submit())}
                  >
                    登录
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col span={4}></Col>
      </Row>
    </div>
  )
})
