import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import NamespacePageDuck, { NamespaceItem } from './PageDuck'
import { Bubble, Icon, Text } from 'tea-component'
import { Column } from '../common/ducks/GridPage'
import Action from '../common/duckComponents/grid/Action'
import { CheckVisibilityMode, VisibilityModeMap } from '../service/operation/CreateDuck'
import { disableDeleteTip } from '../service/getColumns'
import { checkGlobalRegistry } from '../service/utils'
export default ({ duck: { creators } }: DuckCmpProps<NamespacePageDuck>): Column<NamespaceItem>[] => [
  {
    key: 'name',
    header: '名称',
    render: x => (
      <Text>
        {x.name}
        {checkGlobalRegistry(x) && (
          <Bubble content={disableDeleteTip}>
            <Icon type='convertip--blue' />
          </Bubble>
        )}
      </Text>
    ),
  },
  {
    key: 'sync_to_global_registry',
    header: '同步全局注册中心',
    render: x => <Text>{x.sync_to_global_registry ? '开启' : '关闭' || '-'}</Text>,
  },
  {
    key: 'service_export_to',
    header: '服务可见性',
    render: x => {
      const visibilityMode = CheckVisibilityMode(x.service_export_to, x.name)
      return (
        <Text reset>
          {visibilityMode ? (
            VisibilityModeMap[visibilityMode]
          ) : (
            <Bubble
              trigger={'hover'}
              content={
                <Text>
                  <Text parent={'div'}>{'服务可见的命名空间列表'}</Text>
                  {x.service_export_to?.map(item => (
                    <Text parent={'div'} key={item}>
                      {item}
                    </Text>
                  ))}
                </Text>
              }
            >
              <Text>{x.service_export_to ? x.service_export_to?.slice(0, 3)?.join(',') + '...' : '-'}</Text>
            </Bubble>
          )}
        </Text>
      )
    },
  },

  {
    key: 'commnet',
    header: '描述',
    render: x => <Text tooltip={x.comment}>{x.comment || '-'}</Text>,
  },
  {
    key: 'totalSerivce',
    header: '服务数',
    render: x => <Text>{x.total_service_count ?? '-'}</Text>,
  },
  {
    key: 'health/total',
    header: '健康实例/总实例数',
    render: x => (
      <Text
        tooltip={`${x.total_health_instance_count}/${x.total_instance_count}`}
      >{`${x.total_health_instance_count}/${x.total_instance_count}`}</Text>
    ),
  },
  {
    key: 'ctime',
    header: '创建时间',
    render: x => <Text>{x.ctime}</Text>,
  },
  {
    key: 'mtime',
    header: '修改时间',
    render: x => <Text>{x.mtime}</Text>,
  },
  {
    key: 'action',
    header: '操作',
    render: x => {
      return (
        <React.Fragment>
          <Action
            fn={dispatch => dispatch(creators.edit(x))}
            disabled={!x.editable || checkGlobalRegistry(x)}
            tip={checkGlobalRegistry(x) ? disableDeleteTip : '编辑'}
          >
            {'编辑'}
          </Action>
          <Action fn={dispatch => dispatch(creators.remove(x))} disabled={x.deleteable === false} tip={'删除'}>
            {'删除'}
          </Action>
        </React.Fragment>
      )
    },
  },
]
