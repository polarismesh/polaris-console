import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import Duck from './CreateUserDuck'
import { Form } from 'tea-component'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import { isOwner } from '@src/polaris/common/util/common'
export const passwordRuleText = '请输入6至17位的密码'
export default purify(function (props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { ducks, selector } = duck
  const { options } = selector(store)
  const { name, comment, password, old_password, new_password, confirmPassword, email, mobile } = ducks.form
    .getAPI(store, dispatch)
    .getFields(['name', 'comment', 'password', 'old_password', 'new_password', 'confirmPassword', 'mobile', 'email'])
  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      title={options?.isModify ? (options?.isModifyPassword ? '修改密码' : '编辑用户') : '新建用户'}
      size={'s'}
      defaultSubmitText={'确定'}
      defaultCancelText={'取消'}
    >
      <Form>
        {options?.isModify ? (
          options?.isModifyPassword ? (
            <>
              {!isOwner() && (
                <FormField
                  field={old_password}
                  label={'旧密码'}
                  required
                  message={'如果您忘记了您的旧密码，可以联系您的主账号来重置密码'}
                >
                  <Input field={old_password} size={'m'} type={'password'} />
                </FormField>
              )}
              <FormField field={new_password} label={'新密码'} required message={passwordRuleText}>
                <Input field={new_password} size={'m'} type={'password'} />
              </FormField>
              <FormField field={confirmPassword} label={'确认密码'} required>
                <Input field={confirmPassword} size={'m'} type={'password'} />
              </FormField>
            </>
          ) : (
            <>
            </>
          )
        ) : (
          <>
            <FormField field={name} label={'名称'} required>
              <Input field={name} size={'m'} />
            </FormField>
            <FormField field={password} label={'密码'} required message={passwordRuleText}>
              <Input field={password} size={'m'} type={'password'} />
            </FormField>
            <FormField field={confirmPassword} label={'确认密码'} required>
              <Input field={confirmPassword} size={'m'} type={'password'} />
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
