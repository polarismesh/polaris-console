enum TabId {
  client = 'client',
  dynamic = 'dynamic',
  static = 'static',
}

export interface TabContentInfo {
  imagePath: string
  alt: string
  imageLinks: {
    style: string
    linkAddress: string
  }[]
}

interface TabConfigInfo {
  [TabId.client]: TabContentInfo
  [TabId.dynamic]: TabContentInfo
  [TabId.static]: TabContentInfo
}

export const tabs = [
  { id: TabId.client, label: '客户端染色' },
  { id: TabId.dynamic, label: '网关动态染色' },
  { id: TabId.static, label: '网关静态染色' },
]

export const tabConfigs: TabConfigInfo = {
  [TabId.client]: {
    imagePath: '/static/img/testEnvRoute-client.png',
    alt: '客户端染色流程指引',
    imageLinks: [
      { style: 'link-style-for-instance', linkAddress: 'https://tea.tencent.com/component' },
      {
        style: 'link-style-for-annotation',
        linkAddress: 'https://cloud.tencent.com/document/product/1364',
      },
    ],
  },
  [TabId.dynamic]: {
    imagePath: '/static/img/testEnvRoute-dynamic.png',
    alt: '网关动态染色流程指引',
    imageLinks: [
      {
        style: 'link-style-for-instance',
        linkAddress: 'https://cloud.tencent.com/document/product/1364/72775',
      },
      {
        style: 'link-style-for-annotation',
        linkAddress: 'https://cloud.tencent.com/document/product/1364/75735',
      },
      {
        style: 'link-style-for-tracerule',
        linkAddress: 'https://cloud.tencent.com/document/product/1364/56268',
      },
    ],
  },
  [TabId.static]: {
    imagePath: '/static/img/testEnvRoute-static.png',
    alt: '网关静态染色流程指引',
    imageLinks: [
      {
        style: 'link-style-for-instance',
        linkAddress: '#1',
      },
      {
        style: 'link-style-for-annotation',
        linkAddress: '#2',
      },
      {
        style: 'link-style-for-traceplugin',
        linkAddress: '#3',
      },
    ],
  },
}
