import * as React from 'react'
import { Column } from '@src/polaris/common/ducks/GridPage'
import { DuckCmpProps } from 'saga-duck'
import { Text, Icon, Switch } from 'tea-component'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import RoutePageDuck from './PageDuck'
import { RateLimit, LimitRange } from './model'
import { LIMIT_RANGE_MAP } from './types'
import { isReadOnly } from '../../utils'
import { MATCH_TYPE_MAP, MATCH_TYPE } from '../route/types'
export default ({
  duck: { creators, selector },
  dispatch,
  store,
}: DuckCmpProps<RoutePageDuck>): Column<RateLimit>[] => {
  return [
    {
      key: 'limitType',
      header: '限流类型',
      render: (x: RateLimit) => (
        <React.Fragment>
          <Text>{LIMIT_RANGE_MAP[!x.type ? LimitRange.GLOBAL : x.type].text}</Text>
        </React.Fragment>
      ),
    },
    {
      key: 'type',
      header: '接口名',
      render: (x: RateLimit) => {
        const method = x.labels?.['method']
        return (
          <React.Fragment>
            <Text>
              {method?.value
                ? `匹配值：${method?.value} 匹配模式：${MATCH_TYPE_MAP[method?.type || MATCH_TYPE.EXACT].text}`
                : '-'}
            </Text>
          </React.Fragment>
        )
      },
    },
    {
      key: 'labels',
      header: '请求标签',
      render: x => (
        <Text overflow>
          {Object.keys(x.labels)
            .map(key => `${key}:${x.labels[key].value}`)
            .join(' ; ')}
        </Text>
      ),
    },
    {
      key: 'priority',
      header: '优先级',
      render: x => (
        <React.Fragment>
          <Text>{x.priority}</Text>
        </React.Fragment>
      ),
    },
    {
      key: 'disable',
      header: '是否启用',
      render: x => {
        const {
          data: { namespace },
        } = selector(store)
        const disabled = isReadOnly(namespace)
        return (
          <Switch
            value={!x.disable}
            onChange={() => dispatch(creators.toggleStatus(x))}
            disabled={disabled}
            tooltip={disabled && '该命名空间为只读的'}
          ></Switch>
        )
      },
    },
    {
      key: 'action',
      header: '操作',
      render: x => {
        const {
          data: { namespace, editable },
        } = selector(store)

        return (
          <React.Fragment>
            <Action
              fn={dispatch => dispatch(creators.edit(x))}
              disabled={isReadOnly(namespace) || !editable}
              tip={isReadOnly(namespace) ? '该命名空间为只读的' : !editable ? '无写权限' : '编辑'}
            >
              <Icon type={'pencil'}></Icon>
            </Action>
            <Action
              fn={dispatch => dispatch(creators.remove([x.id]))}
              disabled={isReadOnly(namespace) || !editable}
              tip={isReadOnly(namespace) ? '该命名空间为只读的' : !editable ? '无写权限' : '删除'}
            >
              <Icon type={'delete'}></Icon>
            </Action>
          </React.Fragment>
        )
      },
    },
  ]
}
