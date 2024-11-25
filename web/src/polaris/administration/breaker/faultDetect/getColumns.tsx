import * as React from 'react'
import FaultDetectDuck from './PageDuck'
import { Text, Copy, Bubble, Icon } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { DuckCmpProps } from 'saga-duck'
import router from '@src/polaris/common/util/router'
import { FaultDetectRule } from './types'
import { disableDeleteTip } from '@src/polaris/service/getColumns'
import { checkGlobalRegistry } from '@src/polaris/service/utils'

export default (props: DuckCmpProps<FaultDetectDuck>): Column<FaultDetectRule>[] => {
  const {
    duck: { creators },
    dispatch,
  } = props
  return [
    {
      key: 'idName',
      header: 'ID/规则名',
      width: 280,
      render: x => {
        return (
          <>
            <Text overflow>
              {x.id}
              <Copy text={x.id} />
            </Text>
            <br />
            <Text>
              {x.name}
              {checkGlobalRegistry(x) && (
                <Bubble content={disableDeleteTip}>
                  <Icon type='convertip--blue' />
                </Bubble>
              )}
            </Text>
          </>
        )
      },
    },
    {
      key: 'namespace',
      header: '命名空间',
      render: x => {
        return (
          <>
            <Text parent={'div'}>{x.targetService?.namespace}</Text>
          </>
        )
      },
    },
    {
      key: 'service',
      header: '服务',
      render: x => {
        return (
          <>
            <Text parent={'div'}>{x.targetService?.service}</Text>
          </>
        )
      },
    },
    {
      key: 'method',
      header: '接口',
      render: x => {
        return (
          <>
            <Text parent={'div'}>{x.targetService?.method?.value}</Text>
          </>
        )
      },
    },
    {
      key: 'ctimemtime',
      header: '创建时间/修改时间',
      render: x => {
        return (
          <>
            <Text parent={'div'}>{x.ctime}</Text>
            <Text parent={'div'}>{x.mtime}</Text>
          </>
        )
      },
    },
    {
      key: 'action',
      header: '操作',
      render: x => {
        const hasGlobalRegistry = checkGlobalRegistry(x)
        return (
          <React.Fragment>
            <Action
              disabled={x.editable === false || hasGlobalRegistry}
              text={'编辑'}
              fn={() => {
                router.navigate(`/faultDetect-create?id=${x.id}`)
              }}
              tip={hasGlobalRegistry ? disableDeleteTip : '编辑'}
            />
            <Action
              disabled={x.deleteable === false}
              text={'删除'}
              fn={() => {
                dispatch(creators.remove(x))
              }}
            />
          </React.Fragment>
        )
      },
    },
  ]
}
