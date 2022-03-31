import React from 'react'
import { Text, Tabs, Alert, TabPanel } from 'tea-component'
import { AuthSubjectTabs, AuthSubjectType } from '../../policy/Page'
import { User, UserGroup } from '../../model'
import { Duck, DuckCmpProps } from 'saga-duck'
import { UserGroupSelectDuck } from './AttachUserGroupDuck'
import { UserSelectDuck } from '../../userGroup/operation/CreateDuck'
import SearchableTransfer from '@src/polaris/common/duckComponents/SearchableTransfer'
import { getOwnerUin } from '@src/polaris/common/util/common'
interface Props {
  userDuck: UserSelectDuck
  userGroupDuck: UserGroupSelectDuck
}
export default function ResourcePrincipalAuth(props: Props & DuckCmpProps<Duck>) {
  const { userDuck: userSelect, userGroupDuck: userGroupSelect, dispatch, store } = props
  const [showAuthSubjectType, setShowAuthSubjectType] = React.useState(AuthSubjectType.USER)
  return (
    <Tabs
      tabs={AuthSubjectTabs}
      activeId={showAuthSubjectType}
      onActive={tab => setShowAuthSubjectType(tab.id as AuthSubjectType)}
    >
      <Alert type={'info'} style={{ margin: '20px 0px 0px 0px' }}>
        {'授予权限的用户或者用户组，具有该命名空间的读写权限，所有用户具有读权限'}
      </Alert>
      <TabPanel id={AuthSubjectType.USER}>
        <SearchableTransfer
          title={'请选择用户'}
          duck={userSelect}
          store={store}
          dispatch={dispatch}
          itemRenderer={(record: User) => (
            <Text overflow>
              {record.name} ({record.id})
            </Text>
          )}
          itemDisabled={(record: User) => record.id === getOwnerUin().toString()}
        />
      </TabPanel>
      <TabPanel id={AuthSubjectType.USERGROUP}>
        <SearchableTransfer
          title={'请选择用户组'}
          duck={userGroupSelect}
          store={store}
          dispatch={dispatch}
          itemRenderer={(record: UserGroup) => <Text overflow>{record.name}</Text>}
        />
      </TabPanel>
      <Text theme={'weak'} reset>
        {'支持按住shift进行多选'}
      </Text>
    </Tabs>
  )
}
