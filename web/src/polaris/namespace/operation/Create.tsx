import { t } from 'i18next'
import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import Duck from './CreateDuck'
import { Form, Button, Icon, FormItem } from 'tea-component'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import ResourcePrincipalAuth from '@src/polaris/auth/user/operation/ResourcePrincipalAuth'
import { useTranslation } from 'react-i18next'

export default function Create(props: DuckCmpProps<Duck>) {
  const { t } = useTranslation()

  const { duck, store, dispatch } = props
  const { selectors } = duck
  const visible = selectors.visible(store)
  if (!visible) {
    return <noscript />
  }
  const data = selectors.data(store)
  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      size={'xl'}
      title={data.name ? t('编辑命名空间') : t('新建命名空间')}
    >
      <CreateForm duck={duck} store={store} dispatch={dispatch} />
    </Dialog>
  )
}

const CreateForm = purify(function CreateForm(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form, userGroupSelect, userSelect },
    selectors,
  } = duck

  const formApi = form.getAPI(store, dispatch)
  const { name, comment, owners } = formApi.getFields(['name', 'comment', 'owners'])
  const options = selectors.options(store)
  const [showAdvance, setShowAdvance] = React.useState(false)

  return (
    <>
      <Form>
        <FormField field={name} label={t('命名空间')} required>
          <Input
            field={name}
            maxLength={128}
            placeholder={t('允许数字、英文字母、.、-、_，限制128个字符')}
            size={'l'}
            disabled={options?.isModify}
          />
        </FormField>
        <FormField field={comment} label={t('描述')}>
          <Input field={comment} maxLength={1024} placeholder={t('长度不超过1024个字符')} size={'l'} />
        </FormField>

        {options.authOpen && (
          <>
            <Button type={'link'} onClick={() => setShowAdvance(!showAdvance)} style={{ cursor: 'pointer' }}>
              <Icon type={showAdvance ? 'arrowup' : 'arrowdown'} />
              {t('高级设置')}
            </Button>
            {showAdvance && (
              <FormItem label={t('授权')}>
                <ResourcePrincipalAuth
                  userDuck={userSelect}
                  userGroupDuck={userGroupSelect}
                  duck={duck}
                  store={store}
                  dispatch={dispatch}
                />
              </FormItem>
            )}
          </>
        )}
      </Form>
    </>
  )
})
