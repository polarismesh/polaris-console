import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import Duck from './CreateDuck'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import { AutoComplete, Form, Input as TeaInput } from 'tea-component'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'

export default function Create(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selectors } = duck
  const visible = selectors.visible(store)
  if (!visible) {
    return <noscript />
  }
  const data = selectors.data(store)
  return (
    <Dialog duck={duck} store={store} dispatch={dispatch} size='l' title={data.alias ? '编辑服务' : '新建服务'}>
      <CreateForm duck={duck} store={store} dispatch={dispatch} />
    </Dialog>
  )
}
const CreateForm = purify(function CreateForm(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selectors,
  } = duck

  const formApi = form.getAPI(store, dispatch)
  const { namespace, alias, comment, alias_namespace, service } = formApi.getFields([
    'namespace',
    'alias',
    'comment',
    'alias_namespace',
    'service',
  ])
  const options = selectors.options(store)
  return (
    <>
      <Form>
        <FormField field={alias} label={'服务别名'} required>
          <Input
            field={alias}
            maxLength={128}
            placeholder={'允许数字、英文字母、.、-、_，限制128个字符'}
            size={'l'}
            disabled={options.isModify}
          />
        </FormField>

        <FormField field={alias_namespace} label={'别名所在命名空间'} required>
          <AutoComplete
            options={options.namespaceList}
            onChange={value => {
              alias_namespace.setValue(value)
            }}
          >
            {ref => (
              <TeaInput
                ref={ref}
                value={alias_namespace.getValue()}
                onChange={value => {
                  alias_namespace.setValue(value)
                }}
                disabled={options.isModify}
                size={'l'}
              />
            )}
          </AutoComplete>
        </FormField>
        <FormField field={service} label={'指向服务'} required>
          <AutoComplete
            options={options.serviceList}
            onChange={value => {
              const [, namespaceName] = value.split('=>')
              service.setValue(value)
              namespace.setValue(namespaceName)
            }}
          >
            {ref => (
              <TeaInput
                ref={ref}
                value={service.getValue()}
                onChange={value => {
                  service.setValue(value)
                }}
                size={'l'}
              />
            )}
          </AutoComplete>
        </FormField>
        <FormField field={comment} label={'描述'}>
          <Input field={comment} maxLength={1024} placeholder={'长度不超过1024个字符'} size={'l'} />
        </FormField>
      </Form>
    </>
  )
})
