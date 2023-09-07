import React, { useState } from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import Duck from './CreateDuck'
import { Button, Form, FormControl, FormItem, Icon, Select, Table, Text } from 'tea-component'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import ResourcePrincipalAuth from '@src/polaris/auth/user/operation/ResourcePrincipalAuth'
import { scrollable, autotip } from 'tea-component/lib/table/addons'
const removeArrayFieldValue = (field, index) => {
  const newValue = field.getValue()
  newValue.splice(index, 1)
  field.setValue([...newValue])
}
const addTag = field => {
  field.setValue([...(field.getValue() || []), { key: '', value: '' }])
}

export default function Create(props: DuckCmpProps<Duck>) {
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
      size={'l'}
      title={data.name ? '编辑配置文件组' : '新建配置文件组'}
    >
      <CreateForm duck={duck} store={store} dispatch={dispatch} />
    </Dialog>
  )
}

const CreateForm = purify(function CreateForm(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form, userSelect, userGroupSelect },
    selectors,
  } = duck
  const [showAdvance, setShowAdvance] = useState(false)
  const formApi = form.getAPI(store, dispatch)
  const { namespace, comment, department, business, metadata, name } = formApi.getFields([
    'namespace',
    'comment',
    'department',
    'business',
    'metadata',
    'name',
  ])
  const options = selectors.options(store)

  return (
    <>
      <Form>
        <FormField field={namespace} label={'命名空间'} required>
          <Select
            value={namespace.getValue()}
            options={options.namespaceList}
            onChange={value => namespace.setValue(value)}
            type={'simulate'}
            appearance={'button'}
            size='l'
            disabled={options.isModify}
          ></Select>
        </FormField>
        <FormField field={name} label={'分组名'}>
          <Input
            field={name}
            maxLength={128}
            placeholder={'允许数字、英文字母、.、-、_，限制128个字符'}
            size={'l'}
            disabled={options?.isModify}
          />
        </FormField>
        <FormField field={department} label={'部门'}>
          <Input field={department} />
        </FormField>
        <FormField field={business} label={'业务'}>
          <Input field={business} />
        </FormField>
        <FormItem
          label={
            <>
              <Text>{'标签'}</Text>
            </>
          }
          message={'标签键的长度不能超过128字符，标签值的长度不能超过4096个字符'}
        >
          <Table
            bordered
            records={[...metadata.asArray()]}
            columns={[
              {
                key: 'key',
                header: '标签键',
                render: field => {
                  const key = field.getField('key')
                  return (
                    <FormControl
                      status={key.getTouched() && key.getError() ? 'error' : null}
                      showStatusIcon={false}
                      style={{ display: 'inline' }}
                      message={key.getTouched() && key.getError() ? key.getError() : null}
                    >
                      <Input field={key} maxLength={128}></Input>
                    </FormControl>
                  )
                },
              },
              {
                key: 'value',
                header: '标签值',
                render: field => {
                  const value = field.getField('value')
                  return (
                    <FormControl
                      status={value.getTouched() && value.getError() ? 'error' : null}
                      showStatusIcon={false}
                      style={{ display: 'inline' }}
                      message={value.getTouched() && value.getError() ? value.getError() : null}
                    >
                      <Input field={value} maxLength={4096}></Input>
                    </FormControl>
                  )
                },
              },
              {
                key: 'action',
                header: '操作',
                render: (field, key, index) => {
                  return (
                    <Button
                      type={'icon'}
                      icon={'close'}
                      onClick={() => removeArrayFieldValue(metadata, index)}
                    ></Button>
                  )
                },
              },
            ]}
            addons={[
              scrollable({
                maxHeight: '300px',
              }),
              autotip({ emptyText: '无标签' }),
            ]}
            bottomTip={
              <Button onClick={() => addTag(metadata)} type={'link'}>
                {'添加标签'}
              </Button>
            }
          ></Table>
        </FormItem>

        <FormField field={comment} label={'备注'}>
          <Input field={comment} maxLength={200} placeholder={'长度不超过200个字符'} size={'l'} />
        </FormField>
        <Button type='link' onClick={() => setShowAdvance(!showAdvance)} style={{ cursor: 'pointer' }}>
          <Icon type={showAdvance ? 'arrowup' : 'arrowdown'} />
          高级配置
        </Button>
        {showAdvance && (
          <FormItem label='授权'>
            <ResourcePrincipalAuth
              userDuck={userSelect}
              userGroupDuck={userGroupSelect}
              duck={duck}
              store={store}
              dispatch={dispatch}
            />
          </FormItem>
        )}
      </Form>
    </>
  )
})
