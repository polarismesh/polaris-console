import * as React from 'react'
import CircuitBreakerDuck from './PageDuck'
import { Text, Copy } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { checkRuleType, CircuitBreakerRule } from './types'
import { DuckCmpProps } from 'saga-duck'
import router from '@src/polaris/common/util/router'

export default (props: DuckCmpProps<CircuitBreakerDuck>): Column<CircuitBreakerRule>[] => {
  const {
    duck: { creators },
    dispatch,
  } = props
  return [
    {
      key: 'idName',
      header: 'ID/规则名',
      width: 280,
      render: (x) => {
        return (
          <>
            <Text theme='primary' overflow>
              {x.id}
              <Copy text={x.id} />
            </Text>
            <br />
            <Text>{x.name}</Text>
          </>
        )
      },
    },
    {
      key: 'enable',
      header: '状态',
      render: (x) => (x.enable ? <Text theme='success'>已启用</Text> : <Text theme='danger'>未启用</Text>),
    },
    {
      key: 'source',
      header: '主调服务',
      render: (x) => {
        return (
          <>
            <Text parent={'div'}>命名空间: {x.ruleMatcher?.source?.namespace}</Text>
            <Text parent={'div'}>服务: {x.ruleMatcher?.source?.service}</Text>
          </>
        )
      },
    },
    {
      key: 'destination',
      header: '被调服务',
      render: (x) => {
        return (
          <>
            <Text parent={'div'}>命名空间: {x.ruleMatcher?.destination?.namespace}</Text>
            <Text parent={'div'}>服务: {x.ruleMatcher?.destination?.service}</Text>
            <Text parent={'div'}>接口: {x.ruleMatcher?.destination?.method?.value}</Text>
          </>
        )
      },
    },
    {
      key: 'ctimemtime',
      header: '创建时间/修改时间',
      render: (x) => {
        return (
          <>
            <Text parent={'div'}>{x.ctime}</Text>
            <Text parent={'div'}>{x.mtime}</Text>
          </>
        )
      },
    },
    {
      key: 'etime',
      header: '启用时间',
      render: (x) => {
        return (
          <>
            <Text parent={'div'}>{x.etime}</Text>
          </>
        )
      },
    },
    {
      key: 'action',
      header: '操作',
      render: (x) => {
        return (
          <React.Fragment>
            <Action
              text={x.enable ? '禁用' : '启用'}
              fn={() => {
                dispatch(creators.toggle(x))
              }}
            />
            <Action
              text={'编辑'}
              fn={() => {
                const type = checkRuleType(x)
                router.navigate(`/circuitBreaker-create?id=${x.id}&type=${type}`)
              }}
            />
            <Action
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
