import * as React from 'react'
import { Column } from '@src/polaris/common/ducks/GridPage'
import { DuckCmpProps } from 'saga-duck'
import { Text, Icon } from 'tea-component'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import RoutePageDuck from './PageDuck'
import { RuleType, MATCH_TYPE_MAP } from './types'
import { isReadOnly } from '../../utils'
import { MATCH_TYPE } from '../route/types'
export default ({ duck: { creators, selector }, store }: DuckCmpProps<RoutePageDuck>): Column<any>[] => {
  const { ruleType } = selector(store)
  return [
    ...(ruleType === RuleType.Inbound
      ? [
          {
            key: 'sourceNamespace',
            header: '命名空间',
            render: x => (
              <React.Fragment>
                <Text>
                  {x.sources.map(source => (source.namespace === '*' ? '全部' : source.namespace)).join(',') || '-'}
                </Text>
              </React.Fragment>
            ),
          },
          {
            key: 'sourceService',
            header: '服务名',
            render: x => (
              <Text>
                {x.sources.map(source => (source.service === '*' ? '全部' : source.service)).join(',') || '-'}
              </Text>
            ),
          },
        ]
      : []),
    ...(ruleType === RuleType.Outbound
      ? [
          {
            key: 'desNamespace',
            header: '命名空间',
            render: x => (
              <React.Fragment>
                <Text>
                  {x.destinations
                    .map(destination => (destination.namespace === '*' ? '全部' : destination.namespace))
                    .join(',') || '-'}
                </Text>
              </React.Fragment>
            ),
          },
          {
            key: 'desService',
            header: '服务名',
            render: x => (
              <Text>
                {x.destinations
                  .map(destination => (destination.service === '*' ? '全部' : destination.service))
                  .join(',') || '-'}
              </Text>
            ),
          },
        ]
      : []),
    {
      key: 'sourceMethod',
      header: '接口名',
      render: x => (
        <Text>
          {x.destinations
            .map(
              destination =>
                `${destination.method?.value}（${
                  MATCH_TYPE_MAP[destination.method?.type || MATCH_TYPE.EXACT].text
                }匹配）`,
            )
            .join(',') || '-'}
        </Text>
      ),
    },
    {
      key: 'action',
      header: '操作',
      render: x => {
        const {
          data: { namespace, editable, deleteable },
        } = selector(store)
        return (
          <React.Fragment>
            <Action
              fn={dispatch => dispatch(creators.edit(x.id))}
              disabled={isReadOnly(namespace) || !editable}
              tip={isReadOnly(namespace) ? '该命名空间为只读的' : !editable ? '无写权限' : '编辑'}
            >
              <Icon type={'pencil'}></Icon>
            </Action>
            <Action
              fn={dispatch => dispatch(creators.remove(x.id))}
              disabled={isReadOnly(namespace) || deleteable === false}
              tip={isReadOnly(namespace) ? '该命名空间为只读的' : deleteable === false ? '无写权限' : '删除'}
            >
              <Icon type={'delete'}></Icon>
            </Action>
            <Action
              fn={dispatch => dispatch(creators.create(x.id))}
              disabled={isReadOnly(namespace) || !editable}
              tip={isReadOnly(namespace) ? '该命名空间为只读的' : !editable ? '无写权限' : '在该规则前新建规则'}
            >
              <Icon type={'plus'}></Icon>
            </Action>
          </React.Fragment>
        )
      },
    },
  ]
}
