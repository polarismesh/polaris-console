import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import Duck from './AttachUserGroupDuck'
import { Form, Text, FormItem } from 'tea-component'
import { UserGroup } from '../../model'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import SearchableTransfer from '@src/polaris/common/duckComponents/SearchableTransfer'
import { t } from 'i18next';

export default purify(function(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { ducks } = duck

  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      title={t('关联用户组')}
      size={'l'}
      defaultSubmitText={t('确定')}
      defaultCancelText={t('取消')}
    >
      <Form>
        <FormItem label={t('用户组')}>
          <SearchableTransfer
            title={t('请选择用户组')}
            duck={ducks.userGroup}
            store={store}
            dispatch={dispatch}
            itemRenderer={(record: UserGroup) => <Text overflow>{record.name}</Text>}
          />
        </FormItem>
      </Form>
    </Dialog>
  )
})
