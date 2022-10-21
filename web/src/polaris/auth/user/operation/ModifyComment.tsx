import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import Duck from './ModifyCommentDuck'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import { Form } from 'tea-component'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import { t } from 'i18next'

export default purify(function (props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { ducks } = duck
  const formApi = ducks.form.getAPI(store, dispatch)
  const { comment } = formApi.getFields(['comment'])

  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      title={t('修改备注')}
      size={300}
      defaultSubmitText={t('确定')}
      defaultCancelText={t('取消')}
    >
      <Form>
        <FormField field={comment} label={t('备注')}>
          <Input placeholder={t('请输入备注')} field={comment} size={'m'} />
        </FormField>
      </Form>
    </Dialog>
  )
})
