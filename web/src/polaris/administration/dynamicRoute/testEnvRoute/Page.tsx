import React from 'react'
import { Layout, Card, Tabs, TabPanel } from 'tea-component'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { tabs, tabConfigs, TabContentInfo } from './TabConfig'
const { Body, Content } = Layout

insertCSS(
  'imageLink',
  `
  .link-style {
    display: block;
    position: absolute;
    width: 4.1%;
    height: 2%;
    background-color: none;
    cursor: pointer;
    z-index: 10;
  }
  `,
)

insertCSS(
  'imageLink',
  `
  .link-style-for-instance {
    display: block;
    position: absolute;
    top: 18.9%;
    left: 29.8%;
    width: 4.1%;
    height: 2%;
    background-color: none;
    cursor: pointer;
    z-index: 10;
  }

  `,
)

function TabContentComp(props: TabContentInfo) {
  if (!props) return <noscript />
  const { imagePath, alt, imageLinks } = props
  return (
    <Card style={{ maxWidth: 1200 }}>
      <Card.Body style={{ position: 'relative', padding: '1%' }}>
        <img src={imagePath} alt={alt} style={{ width: '100%', display: 'block' }} />
        {imageLinks.map(o => (
          <a
            key={o.linkAddress}
            style={o.style}
            className={`link-style`}
            href={o.linkAddress}
            target='_blank'
            rel='noreferrer'
          ></a>
        ))}
      </Card.Body>
    </Card>
  )
}

export default function TestEnvRoutePage() {
  return (
    <Layout>
      <Body>
        <Content>
          <Content.Header title='测试环境路由' />
          <Content.Body>
            <Tabs tabs={tabs} ceiling>
              {tabs.map(tab => {
                const tabContent = tabConfigs[tab.id]
                return (
                  <TabPanel id={tab.id} key={tab.id}>
                    {TabContentComp(tabContent)}
                  </TabPanel>
                )
              })}
            </Tabs>
          </Content.Body>
        </Content>
      </Body>
    </Layout>
  )
}
