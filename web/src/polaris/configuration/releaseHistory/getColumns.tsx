import * as React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ConfigFileReleaseHistoryDuck, { ConfigFileReleaseHistoryItem } from './PageDuck'
import { Button, Form, FormItem, FormText, Modal, Text } from 'tea-component'
import { Column } from '@src/polaris/common/ducks/GridPage'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { ConfigReleaseType, ConfigReleaseTypeMap, ConfigReleaseStatusMap, ConfigReleaseStatus } from './types'

export const showReleaseError = (x: ConfigFileReleaseHistoryItem) => {
  const modal = Modal.show({
    caption: '查看失败原因',
    onClose: () => modal.destroy(),
    children: (
      <Form>
        <FormItem label={'配置名称'}>
          <FormText>{x.fileName}</FormText>
        </FormItem>
        <FormItem label={'版本'}>
          <FormText>{x.name}</FormText>
        </FormItem>
        <FormItem label={'原因'}>
          <FormText>{x.releaseReason}</FormText>
        </FormItem>
      </Form>
    ),
  })
}

export default ({
  duck: { creators },
}: DuckCmpProps<ConfigFileReleaseHistoryDuck>): Column<ConfigFileReleaseHistoryItem>[] => [
  {
    key: 'id',
    header: '发布历史ID',
    render: x => x.id,
  },
  {
    key: 'fileName',
    header: '名称',
    width: 200,
    render: x =>
      x.type === ConfigReleaseType.CLEAN ? (
        <Text overflow tooltip={x.fileName} style={{ maxWidth: '200px' }}>
          {x.fileName}
        </Text>
      ) : (
        <Action fn={dispatch => dispatch(creators.showDiff(x))}>
          <Text overflow tooltip={x.fileName} style={{ maxWidth: '200px' }}>
            {x.fileName}
          </Text>
        </Action>
      ),
  },
  {
    key: 'name',
    header: '版本',
    render: x => <Text>{x.name}</Text>,
  },
  {
    key: 'type',
    header: '操作类型',
    render: x => (
      <>
        <Text parent={'div'}>{ConfigReleaseTypeMap[x.type]}</Text>
      </>
    ),
  },
  {
    key: 'status',
    header: '状态',
    render: x => (
      <>
        <Text theme={ConfigReleaseStatusMap[x.status]?.theme} parent={'div'}>
          {ConfigReleaseStatusMap[x.status]?.text}
        </Text>
        {x.status === ConfigReleaseStatus.FAILURE && (
          <Button
            type={'link'}
            onClick={() => {
              showReleaseError(x)
            }}
          >
            {'查看失败原因'}
          </Button>
        )}
      </>
    ),
  },
  {
    key: 'namespace',
    header: '命名空间',
    render: x => <Text tooltip={x.namespace}>{x.namespace || '-'}</Text>,
  },
  {
    key: 'group',
    header: '配置分组',
    render: x => <Text tooltip={x.group}>{x.group || '-'}</Text>,
  },
  {
    key: 'releaseBy',
    header: '操作人',
    render: x => <Text>{x.modifyBy}</Text>,
  },
  {
    key: 'createtime',
    header: '创建时间',
    render: x => <Text>{x.createTime}</Text>,
  },
]
