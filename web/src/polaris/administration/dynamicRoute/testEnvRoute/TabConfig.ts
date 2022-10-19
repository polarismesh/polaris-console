import { t } from 'i18next';
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
  { id: TabId.client, label: t('客户端染色') },
  { id: TabId.dynamic, label: t('网关动态染色') },
  { id: TabId.static, label: t('网关静态染色') },
]

export const tabConfigs: TabConfigInfo = {
  [TabId.client]: {
    imagePath: '/static/img/testEnvRoute-client.png',
    alt: t('客户端染色流程指引'),
    imageLinks: [
      {
        style: 'link-style-for-instance',
        linkAddress:
          'https://polarismesh.cn/zh/doc/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E8%B7%AF%E7%94%B1/%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%9F%93%E8%89%B2.html#%E5%BE%AE%E6%9C%8D%E5%8A%A1%E6%A1%86%E6%9E%B6%E6%9C%8D%E5%8A%A1%E6%B3%A8%E5%86%8C%E5%9C%BA%E6%99%AF',
      },
      {
        style: 'link-style-for-annotation',
        linkAddress:
          'https://polarismesh.cn/zh/doc/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E8%B7%AF%E7%94%B1/%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%9F%93%E8%89%B2.html#k8s%E6%9C%8D%E5%8A%A1%E6%B3%A8%E5%86%8C%E5%9C%BA%E6%99%AF',
      },
    ],
  },
  [TabId.dynamic]: {
    imagePath: '/static/img/testEnvRoute-dynamic.png',
    alt: t('网关动态染色流程指引'),
    imageLinks: [
      {
        style: 'link-style-for-instance',
        linkAddress:
          'https://polarismesh.cn/zh/doc/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E8%B7%AF%E7%94%B1/%E7%BD%91%E5%85%B3%E5%8A%A8%E6%80%81%E6%9F%93%E8%89%B2.html#%E5%BE%AE%E6%9C%8D%E5%8A%A1%E6%A1%86%E6%9E%B6%E6%9C%8D%E5%8A%A1%E6%B3%A8%E5%86%8C%E5%9C%BA%E6%99%AF',
      },
      {
        style: 'link-style-for-annotation',
        linkAddress:
          'https://polarismesh.cn/zh/doc/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E8%B7%AF%E7%94%B1/%E7%BD%91%E5%85%B3%E5%8A%A8%E6%80%81%E6%9F%93%E8%89%B2.html#k8s%E6%9C%8D%E5%8A%A1%E6%B3%A8%E5%86%8C%E5%9C%BA%E6%99%AF',
      },
      {
        style: 'link-style-for-tracerule',
        linkAddress:
          'https://polarismesh.cn/zh/doc/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E8%B7%AF%E7%94%B1/%E7%BD%91%E5%85%B3%E5%8A%A8%E6%80%81%E6%9F%93%E8%89%B2.html#%E9%98%B6%E6%AE%B5%E4%B8%89',
      },
    ],
  },
  [TabId.static]: {
    imagePath: '/static/img/testEnvRoute-static.png',
    alt: t('网关静态染色流程指引'),
    imageLinks: [
      {
        style: 'link-style-for-instance',
        linkAddress:
          'https://polarismesh.cn/zh/doc/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E8%B7%AF%E7%94%B1/%E7%BD%91%E5%85%B3%E9%9D%99%E6%80%81%E6%9F%93%E8%89%B2.html#%E5%BE%AE%E6%9C%8D%E5%8A%A1%E6%A1%86%E6%9E%B6%E6%9C%8D%E5%8A%A1%E6%B3%A8%E5%86%8C%E5%9C%BA%E6%99%AF',
      },
      {
        style: 'link-style-for-annotation',
        linkAddress:
          'https://polarismesh.cn/zh/doc/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E8%B7%AF%E7%94%B1/%E7%BD%91%E5%85%B3%E9%9D%99%E6%80%81%E6%9F%93%E8%89%B2.html#k8s%E6%9C%8D%E5%8A%A1%E6%B3%A8%E5%86%8C%E5%9C%BA%E6%99%AF',
      },
      {
        style: 'link-style-for-traceplugin',
        linkAddress:
          'https://polarismesh.cn/zh/doc/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E8%B7%AF%E7%94%B1/%E7%BD%91%E5%85%B3%E9%9D%99%E6%80%81%E6%9F%93%E8%89%B2.html#%E9%98%B6%E6%AE%B5%E4%B8%89',
      },
    ],
  },
}
