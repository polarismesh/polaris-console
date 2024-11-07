import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import { ConfigFileRelease } from '../../types'
import ConfigFileReleaseDuck from './PageDuck'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { Column } from '@src/polaris/common/ducks/GridPage'
import { Badge, Text } from 'tea-component'
export default ({
  duck: { creators, selector },
  store,
}: DuckCmpProps<ConfigFileReleaseDuck>): Column<ConfigFileRelease>[] => {
  const { data } = selector(store)
  const editable = data.editable
  const deleteable = data.deleteable
  return [
    {
      key: 'id',
      header: '配置版本ID',
      render: x => <Text>{x.id}</Text>,
    },
    {
      key: 'fileName',
      header: '名称',
      render: x => (
        <Text>
          {x.fileName}
          {x.active && x.releaseType === 'gray' ? (
            <Badge theme='warning' dark style={{ verticalAlign: 'bottom', marginLeft: '5px' }}>
              {'灰度使用中'}
            </Badge>
          ) : (
            <></>
          )}
          {x.active && x.releaseType !== 'gray' ? (
            <Badge dark style={{ verticalAlign: 'bottom', marginLeft: '5px' }}>
              {'使用中'}
            </Badge>
          ) : (
            <></>
          )}
          {!x.active && x.releaseType === 'gray' ? (
            <Badge theme='default' style={{ verticalAlign: 'bottom', marginLeft: '5px' }}>
              {'灰度版本'}
            </Badge>
          ) : (
            <></>
          )}
        </Text>
      ),
    },
    {
      key: 'name',
      header: '版本',
      render: x => <Text>{x.name}</Text>,
    },
    {
      key: 'modifyTime',
      header: '发布时间',
      render: x => <Text>{x.modifyTime}</Text>,
    },
    {
      key: 'action',
      header: '操作',
      render: x => {
        return (
          <React.Fragment>
            <Action fn={dispatch => dispatch(creators.showDiff(x))}>{'版本对比'}</Action>
            <Action fn={dispatch => dispatch(creators.rollback(x))} disabled={!editable || !!x.active}>
              {'回滚'}
            </Action>
            <Action fn={dispatch => dispatch(creators.delete(x))} disabled={deleteable === false}>
              {'删除'}
            </Action>
          </React.Fragment>
        )
      },
    },
  ]
}
