import * as React from 'react'
import { Column } from '@src/polaris/common/ducks/GridPage'
import { Instance, HEALTH_STATUS_MAP, ISOLATE_STATUS_MAP } from './types'
import { DuckCmpProps } from 'saga-duck'
import ServiceInstanceDuck from './PageDuck'
import { Text, Icon } from 'tea-component'
import Action from '@src/polaris/common/duckComponents/grid/Action'
import { isReadOnly } from '../../utils'
import i18n from '@src/polaris/common/util/i18n'

export default ({ duck: { creators, selector }, store }: DuckCmpProps<ServiceInstanceDuck>): Column<Instance>[] => [
  // {
  //   key: "id",
  //   header: "id",
  //   render: (x) => (
  //     <>
  //       <Text overflow tooltip={x.id} style={{ width: "100px" }}>
  //         {x.id}
  //       </Text>
  //       <Copy text={x.id}>
  //         <Button type={"icon"} icon={"copy"}></Button>
  //       </Copy>
  //     </>
  //   ),
  // },
  {
    key: 'host',
    header: i18n.t('实例IP'),
    render: x => <Text overflow>{x.host}</Text>,
  },
  {
    key: 'port',
    header: i18n.t('端口'),
    render: x => (
      <Text tooltip={x.port} overflow>
        {x.port || '-'}
      </Text>
    ),
  },
  {
    key: 'protocol',
    header: i18n.t('协议'),
    render: x => (
      <Text tooltip={x.protocol} overflow>
        {x.protocol || '-'}
      </Text>
    ),
  },
  {
    key: 'version',
    header: i18n.t('版本'),
    render: x => (
      <Text tooltip={x.version} overflow>
        {x.version || '-'}
      </Text>
    ),
  },
  {
    key: 'weight',
    header: i18n.t('权重'),
    render: x => (
      <Text tooltip={x.weight} overflow>
        {x.weight}
      </Text>
    ),
  },

  {
    key: 'healthy',
    header: i18n.t('健康状态'),
    render: x => <Text theme={HEALTH_STATUS_MAP[x.healthy].theme}>{HEALTH_STATUS_MAP[x.healthy].text}</Text>,
  },
  {
    key: 'isolate',
    header: i18n.t('隔离状态'),
    render: x => <Text theme={ISOLATE_STATUS_MAP[x.isolate].theme}>{ISOLATE_STATUS_MAP[x.isolate].text}</Text>,
  },
  {
    key: 'cmdb',
    header: i18n.t('地区/地域/可用区'),
    render: x => (
      <Text tooltip={`${x.location?.region ?? '-'}/${x.location?.zone ?? '-'}/${x.location?.campus ?? '-'}`}>
        {`${x.location?.region ?? '-'}/${x.location?.zone ?? '-'}/${x.location?.campus ?? '-'}`}
      </Text>
    ),
  },
  {
    key: 'ctime',
    header: i18n.t('创建时间'),
    render: x => (
      <Text tooltip={x.ctime} overflow>
        {x.ctime || '-'}
      </Text>
    ),
  },
  {
    key: 'mtime',
    header: i18n.t('修改时间'),
    render: x => (
      <Text tooltip={x.mtime} overflow>
        {x.mtime || '-'}
      </Text>
    ),
  },
  {
    key: 'action',
    header: i18n.t('操作'),
    render: x => {
      const {
        data: { namespace, editable },
      } = selector(store)

      return (
        <React.Fragment>
          <Action
            fn={dispatch => dispatch(creators.edit(x))}
            disabled={isReadOnly(namespace) || !editable}
            tip={isReadOnly(namespace) ? i18n.t('该命名空间为只读的') : !editable ? i18n.t('无写权限') : i18n.t('编辑')}
          >
            <Icon type={'pencil'}></Icon>
          </Action>
          <Action
            fn={dispatch => dispatch(creators.remove([x.id]))}
            disabled={isReadOnly(namespace) || !editable}
            tip={isReadOnly(namespace) ? i18n.t('该命名空间为只读的') : !editable ? i18n.t('无写权限') : i18n.t('删除')}
          >
            <Icon type={'delete'}></Icon>
          </Action>
        </React.Fragment>
      )
    },
  },
]
