import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import Duck from './CreateUserDuck'
import { Form } from 'tea-component'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'

export default purify(function(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { ducks, selector } = duck
  const { options } = selector(store)
  const { name, comment, password, old_password, new_password } = ducks.form
    .getAPI(store, dispatch)
    .getFields(['name', 'comment', 'password', 'old_password', 'new_password'])
  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      title={'新建用户'}
      size={'m'}
      defaultSubmitText={'确定'}
      defaultCancelText={'取消'}
    >
      <Form>
        {options?.isModify ? (
          <>
            <FormField field={old_password} label={'旧密码'}>
              <Input field={old_password} size={'m'} type={'password'} />
            </FormField>
            <FormField field={new_password} label={'新密码'}>
              <Input field={new_password} size={'m'} type={'password'} />
            </FormField>
          </>
        ) : (
          <>
            <FormField field={name} label={'名称'}>
              <Input field={name} size={'m'} />
            </FormField>
            <FormField field={password} label={'密码'}>
              <Input field={password} size={'m'} type={'password'} />
            </FormField>
            <FormField field={comment} label={'备注'}>
              <Input field={comment} size={'m'} />
            </FormField>
          </>
        )}
      </Form>
    </Dialog>
  )
})
