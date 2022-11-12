import React from 'react'
import { List, Text } from 'tea-component'

enum RouteTabId {
  BlueGreen = 'BlueGreen',
  Canary = 'Canary',
  FullLinkGray = 'FullLinkGray',
}

interface RouteTabConfigInfo {
  [RouteTabId.BlueGreen]: RouteTabContentInfo
  [RouteTabId.Canary]: RouteTabContentInfo
  [RouteTabId.FullLinkGray]: RouteTabContentInfo
}
export interface RouteTabContentInfo {
  imagePath: string | { path: string; title: string; imageLinks: ImageLinks[] }[]
  alt: string
  title?: string
  description?: string | React.ReactNode
  imageLinks?: ImageLinks[]
}
export interface ImageLinks {
  style: React.CSSProperties
  linkAddress: string
}
export const tabs = [
  { id: RouteTabId.BlueGreen, label: '蓝绿发布' },
  { id: RouteTabId.Canary, label: '金丝雀发布' },
  { id: RouteTabId.FullLinkGray, label: '全链路灰度发布' },
]

export const tabConfigs: RouteTabConfigInfo = {
  [RouteTabId.BlueGreen]: {
    imagePath: 'static/img/bluegreen-publish.png',
    alt: '蓝绿发布路由',
    title: '',
    imageLinks: [
      {
        style: { top: '18.2%', left: '29.8%' },
        linkAddress:
          'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E8%93%9D%E7%BB%BF%E5%8F%91%E5%B8%83/#%E6%89%93%E6%A0%87%E5%AE%9E%E4%BE%8B%E7%89%88%E6%9C%AC%E5%8F%B7',
      },
      {
        style: { top: '27%', left: '29.8%' },
        linkAddress:
          'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E8%93%9D%E7%BB%BF%E5%8F%91%E5%B8%83/#envoy-proxy-%E6%8E%A5%E5%85%A5',
      },
      {
        style: { top: '45.1%', left: '11.4%' },
        linkAddress:
          'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E8%93%9D%E7%BB%BF%E5%8F%91%E5%B8%83/#%E9%98%B6%E6%AE%B5%E4%BA%8C%E9%83%A8%E7%BD%B2%E5%BA%94%E7%94%A8',
      },
      {
        style: { top: '63.5%', left: '9.3%' },
        linkAddress:
          'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E8%93%9D%E7%BB%BF%E5%8F%91%E5%B8%83/#%E9%98%B6%E6%AE%B5%E4%B8%89%E7%BD%91%E5%85%B3%E8%B7%AF%E7%94%B1%E6%9F%93%E8%89%B2',
      },
      {
        style: { top: '82%', left: '5.2%' },
        linkAddress:
          'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E8%93%9D%E7%BB%BF%E5%8F%91%E5%B8%83/#%E9%98%B6%E6%AE%B5%E5%9B%9B%E5%BE%AE%E6%9C%8D%E5%8A%A1%E8%B7%AF%E7%94%B1',
      },
    ],
  },
  [RouteTabId.Canary]: {
    imagePath: 'static/img/canary-publish.png',
    alt: '金丝雀发布路由',
    title: '金丝雀发布',
    description:
      '针对是单个服务的服务灰度验证，金丝雀发布允许引流一小部分流量到服务的新版本（比如按灰度用户引流），充分验证微服务新版本的稳定性，验证没问题后，再升级原来的稳定版本。',
    imageLinks: [
      {
        style: { top: '28.7%', left: '29.8%' },
        linkAddress:
          'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E9%87%91%E4%B8%9D%E9%9B%80%E5%8F%91%E5%B8%83/#%E9%98%B6%E6%AE%B5%E4%B8%80%E5%AE%9E%E4%BE%8B%E6%89%93%E6%A0%87',
      },
      {
        style: { top: '38.5%', left: '29.8%' },
        linkAddress:
          'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E9%87%91%E4%B8%9D%E9%9B%80%E5%8F%91%E5%B8%83/#envoy-proxy-%E6%8E%A5%E5%85%A5',
      },
      {
        style: { top: '59%', left: '11.5%' },
        linkAddress:
          'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E9%87%91%E4%B8%9D%E9%9B%80%E5%8F%91%E5%B8%83/#%E9%98%B6%E6%AE%B5%E4%BA%8C-%E9%83%A8%E7%BD%B2%E5%BA%94%E7%94%A8',
      },
      {
        style: { top: '77.2%', left: '37%' },
        linkAddress:
          'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E9%87%91%E4%B8%9D%E9%9B%80%E5%8F%91%E5%B8%83/#%E9%98%B6%E6%AE%B5%E4%B8%89-%E5%BE%AE%E6%9C%8D%E5%8A%A1%E8%B7%AF%E7%94%B1',
      },
    ],
  },
  [RouteTabId.FullLinkGray]: {
    imagePath: [
      {
        path: 'static/img/full-link-gray-publish-scene1.png',
        title: '场景一',
        imageLinks: [
          {
            style: { top: '27.2%', left: '29.8%' },
            linkAddress:
              'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E5%85%A8%E9%93%BE%E8%B7%AF%E7%81%B0%E5%BA%A6-%E5%9C%BA%E6%99%AF1/#%E9%98%B6%E6%AE%B5%E4%B8%80-%E5%AE%9E%E4%BE%8B%E6%89%93%E6%A0%87',
          },
          {
            style: { top: '33.4%', left: '29.8%' },
            linkAddress:
              'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E5%85%A8%E9%93%BE%E8%B7%AF%E7%81%B0%E5%BA%A6-%E5%9C%BA%E6%99%AF1/#%E6%89%93%E6%A0%87%E7%81%B0%E5%BA%A6%E6%A0%87%E7%AD%BE%E9%80%8F%E4%BC%A0',
          },
          {
            style: { top: '59.2%', left: '11.6%' },
            linkAddress:
              'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E5%85%A8%E9%93%BE%E8%B7%AF%E7%81%B0%E5%BA%A6-%E5%9C%BA%E6%99%AF1/#%E9%98%B6%E6%AE%B5%E4%BA%8C-%E9%83%A8%E7%BD%B2%E5%BA%94%E7%94%A8',
          },
          {
            style: { top: '72.1%', left: '19.8%' },
            linkAddress:
              'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E5%85%A8%E9%93%BE%E8%B7%AF%E7%81%B0%E5%BA%A6-%E5%9C%BA%E6%99%AF1/#%E9%98%B6%E6%AE%B5%E4%B8%89-%E7%BD%91%E5%85%B3%E8%B7%AF%E7%94%B1-%E6%9F%93%E8%89%B2',
          },
          {
            style: { top: '85%', left: '5.2%' },
            linkAddress:
              'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E5%85%A8%E9%93%BE%E8%B7%AF%E7%81%B0%E5%BA%A6-%E5%9C%BA%E6%99%AF1/#%E9%98%B6%E6%AE%B5%E5%9B%9B-%E5%BE%AE%E6%9C%8D%E5%8A%A1%E8%B7%AF%E7%94%B1',
          },
        ],
      },
      {
        path: 'static/img/full-link-gray-publish-scene2.png',
        title: '场景二',
        imageLinks: [
          {
            style: { top: '30.9%', left: '29.8%' },
            linkAddress:
              'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E5%85%A8%E9%93%BE%E8%B7%AF%E7%81%B0%E5%BA%A6-%E5%9C%BA%E6%99%AF2/#%E9%98%B6%E6%AE%B5%E4%B8%80-%E5%AE%9E%E4%BE%8B%E6%89%93%E6%A0%87',
          },
          {
            style: { top: '38%', left: '29.8%' },
            linkAddress:
              'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E5%85%A8%E9%93%BE%E8%B7%AF%E7%81%B0%E5%BA%A6-%E5%9C%BA%E6%99%AF2/#%E6%89%93%E6%A0%87%E7%81%B0%E5%BA%A6%E6%A0%87%E7%AD%BE%E9%80%8F%E4%BC%A0',
          },
          {
            style: { top: '52.85%', left: '11.4%' },
            linkAddress:
              'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E5%85%A8%E9%93%BE%E8%B7%AF%E7%81%B0%E5%BA%A6-%E5%9C%BA%E6%99%AF2/#%E9%98%B6%E6%AE%B5%E4%BA%8C-%E9%83%A8%E7%BD%B2%E5%BA%94%E7%94%A8',
          },
          {
            style: { top: '67.8%', left: '16.3%' },
            linkAddress:
              'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E5%85%A8%E9%93%BE%E8%B7%AF%E7%81%B0%E5%BA%A6-%E5%9C%BA%E6%99%AF2/#%E9%98%B6%E6%AE%B5%E4%B8%89-%E7%BD%91%E5%85%B3%E8%B7%AF%E7%94%B1-%E6%9F%93%E8%89%B2',
          },
          {
            style: { top: '82.9%', left: '5.2%' },
            linkAddress:
              'https://polarismesh.cn/docs/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E7%81%B0%E5%BA%A6%E5%8F%91%E5%B8%83/%E5%85%A8%E9%93%BE%E8%B7%AF%E7%81%B0%E5%BA%A6-%E5%9C%BA%E6%99%AF2/#%E9%98%B6%E6%AE%B5%E5%9B%9B-%E5%BE%AE%E6%9C%8D%E5%8A%A1%E8%B7%AF%E7%94%B1',
          },
        ],
      },
    ],
    alt: '全链路灰度发布',
    title: '全链路灰度发布',
    description: (
      <>
        <Text parent={'div'} style={{ paddingBottom: '10px' }}>
          微服务架构下，有些开发需求，微服务调用链路上的多个微服务同时发生了改动，
          通常每个微服务都会有灰度环境或分组来接收灰度流量。此时希望通过进入上游灰度环境的流量，
          也能进入下游灰度的环境中，确保1个请求始终在灰度环境中传递，即使这个调用链路上有一些微服务没有灰度环境，
          这些应用请求在下游的时候依然能够回到灰度环境中。
        </Text>
        <Text reset style={{ paddingBottom: '10px' }}>
          实现方案的两个场景：
        </Text>
        <List>
          <List.Item>应用场景一：金丝雀环境和稳定环境有独立的域名进行隔离，实现全链路灰度。</List.Item>
          <List.Item>应用场景二：使用相同域名，基于请求标签实现全链路灰度。</List.Item>
        </List>
      </>
    ),
  },
}
