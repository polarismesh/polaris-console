import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import Duck from './CreateDuck'
import { Form, Text, FormItem, FormText } from 'tea-component'
import { User } from '../../model'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import { getOwnerUin, isOwner } from '@src/polaris/common/util/common'
import Input from '@src/polaris/common/duckComponents/form/Input'
import SearchableTransfer from '@src/polaris/common/duckComponents/SearchableTransfer'

export default purify(function(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { ducks, selector } = duck
  const { options } = selector(store)
  const { name, comment } = ducks.form.getAPI(store, dispatch).getFields(['name', 'comment'])
  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      title={options?.isModify ? '编辑用户组' : '新建用户组'}
      size={'l'}
      defaultSubmitText={'确定'}
      defaultCancelText={'取消'}
    >
      <Form>
        <FormField field={name} label={'名称'} required>
          {options?.isModify ? (
            <FormText>{name.getValue()}</FormText>
          ) : (
            <Input field={name} maxLength={64} size={'l'} />
          )}
        </FormField>
        <FormItem label={'用户'}>
          <SearchableTransfer
            title={'请选择用户'}
            duck={ducks.user}
            store={store}
            dispatch={dispatch}
            itemDisabled={(record: User) =>
              options.isModify && record.id === getOwnerUin() && !!options.users.find(item => item.id === record.id)
            }
            itemRenderer={(record: User) => (
              <Text overflow>
                {record.name} ({record.id})
              </Text>
            )}
          />
        </FormItem>
        <FormField field={comment} label={'备注'}>
          <Input field={comment} size={'l'} />
        </FormField>
      </Form>
    </Dialog>
  )
})
