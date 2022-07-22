import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import Duck from './GetFileTemplateDuck'
import { Form, Select, FormItem, FormText } from 'tea-component'
import MonacoEditor from '@src/polaris/common/components/MocacoEditor'

import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import { ConfigFileTemplate } from '../../../model'

export default function GetFileTemplate(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selectors } = duck
  const visible = selectors.visible(store)
  if (!visible) {
    return <noscript />
  }
  return (
    <Dialog duck={duck} store={store} dispatch={dispatch} size={'l'} title={'应用模板'} defaultSubmitText={'应用'}>
      <CreateForm duck={duck} store={store} dispatch={dispatch} />
    </Dialog>
  )
}

const CreateForm = purify(function CreateForm(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selector,
  } = duck

  const formApi = form.getAPI(store, dispatch)
  const { currentTemplateId } = formApi.getFields(['currentTemplateId'])
  const { templateList, options } = selector(store)
  const currentTemplate = templateList.find(item => item.id === currentTemplateId.getValue()) as ConfigFileTemplate
  return (
    <>
      <Form>
        <FormField
          field={currentTemplateId}
          label={'模板'}
          required
          tips={'提供常用的配置文件模板，以方便进行快速配置'}
          message={currentTemplate?.format !== options?.file?.format && '当前选择的模板与配置文件格式不符'}
        >
          <Select
            searchable
            value={currentTemplateId.getValue()}
            options={templateList}
            onChange={value => {
              currentTemplateId.setValue(value)
            }}
            type={'simulate'}
            appearance={'button'}
            size='m'
          ></Select>
        </FormField>
        <FormItem label={'模板格式'}>
          <FormText>{currentTemplate?.format}</FormText>
        </FormItem>
        <FormItem label={'模板描述'}>
          <FormText>{currentTemplate?.comment}</FormText>
        </FormItem>
        <FormItem label={'模板预览'}>
          <section style={{ border: '1px solid #cfd5de', width: '100%' }}>
            <MonacoEditor
              language={currentTemplate?.format}
              value={currentTemplate?.content}
              options={{ readOnly: true }}
              height={400}
              width={'100%'}
            />
          </section>
        </FormItem>
      </Form>
    </>
  )
})
