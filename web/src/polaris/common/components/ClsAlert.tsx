import buildConfig from '@src/buildConfig'
import { DescribeCLSOpenStatus } from '@src/polaris/event/model'
import React from 'react'
import { Alert, ExternalLink } from 'tea-component'

export default function ({ type }) {
  const [clsOpenStatus, setClsOpenStatus] = React.useState(false)

  const getClsOpenStatus = React.useCallback(async () => {
    setClsOpenStatus(await DescribeCLSOpenStatus())
  }, [])
  React.useEffect(() => {
    getClsOpenStatus()
  }, [])
  if (!buildConfig.useCls) return
  return clsOpenStatus ? (
    <Alert type={'info'}>
      {`北极星${type}的数据将存储在CLS服务中，CLS 日志服务为独立计费产品，
    例如：100万条事件和操作记录产生费用约10.29元/月，北极星费用中不包括这部分费用。
    具体计费信息可查看费用详情。 如无需使用，可前往腾讯云控制台北极星实例/运行日志下解绑CLS服务配置。`}
    </Alert>
  ) : (
    <>
      <Alert type={'info'}>
        {`北极星${type}功能依赖CLS服务，您暂无开启，如需使用请`}{' '}
        <ExternalLink href={'https://console.cloud.tencent.com/tse'}>前往开启</ExternalLink>
      </Alert>
    </>
  )
}
