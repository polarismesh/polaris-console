import React from 'react'
import { Layout, Card, Tabs, TabPanel, Text } from 'tea-component'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { tabs, tabConfigs, RouteTabContentInfo } from './TabConfig'
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

function TabContentComp(props: RouteTabContentInfo) {
  if (!props) return <noscript />
  const { imagePath, alt, imageLinks, title, description } = props
  return (
    <Card style={{ maxWidth: 1200 }}>
      <Card.Body title={title} style={{ position: 'relative', padding: '1%' }}>
        {description && (
          <Text theme={'weak'} parent={'div'} style={{ paddingBottom: '20px' }}>
            {description}
          </Text>
        )}
        {typeof imagePath === 'string' && (
          <>
            <img src={imagePath} alt={alt} style={{ width: '100%', display: 'block' }} />
            {imageLinks.map(o => (
              <a
                key={o.linkAddress}
                style={o.style}
                className={`link-style`}
                href={o.linkAddress}
                target='_blank'
                rel='noreferrer'
              >
                操作指引
              </a>
            ))}
          </>
        )}
        {typeof imagePath === 'object' && (
          <Tabs tabs={imagePath.map(item => ({ id: item.title, label: item.title }))}>
            {imagePath.map(item => {
              return (
                <TabPanel id={item.title} key={item.title}>
                  <img src={item.path} alt={alt} style={{ width: '100%', display: 'block' }} />
                  {item.imageLinks.map(o => (
                    <a
                      key={o.linkAddress}
                      style={o.style}
                      className={`link-style`}
                      href={o.linkAddress}
                      target='_blank'
                      rel='noreferrer'
                    >
                      操作指引
                    </a>
                  ))}
                </TabPanel>
              )
            })}
          </Tabs>
        )}
      </Card.Body>
    </Card>
  )
}

export default function TestEnvRoutePage() {
  return (
    <Layout>
      <Body>
        <Content>
          <Content.Header title='灰度发布' />
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
