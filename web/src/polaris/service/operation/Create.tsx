import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import Duck from './CreateDuck'
import { Form, Select, Text, Icon, Bubble, Button, FormItem } from 'tea-component'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import Switch from '@src/polaris/common/duckComponents/form/Switch'
import ResourcePrincipalAuth from '@src/polaris/auth/user/operation/ResourcePrincipalAuth'
import { TagTable } from '@src/polaris/common/components/TagTable'
import { t } from 'i18next';

export default function Create(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selectors } = duck
  const visible = selectors.visible(store)
  if (!visible) {
    return <noscript />
  }
  const data = selectors.data(store)
  return (
    <Dialog duck={duck} store={store} dispatch={dispatch} size='xl' title={data.name ? t('编辑服务') : t('新建服务')}>
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

  const formApi = form.getAPI(store, dispatch)
  const { namespace, name, comment, metadata, enableNearby, department, business } = formApi.getFields([
    'namespace',
    'name',
    'comment',
    'metadata',
    'enableNearby',
    'ports',
    'business',
    'department',
  ])
  const options = selectors.options(store)
  const [showAdvance, setShowAdvance] = React.useState(false)

  return (
    <>
      <Form>
        <FormField field={namespace} label={t('命名空间')} required>
          <Select
            disabled={options.isModify}
            value={namespace.getValue()}
            options={options.namespaceList}
            onChange={value => namespace.setValue(value)}
            type={'simulate'}
            appearance={'button'}
            size='l'
          ></Select>
        </FormField>

        <FormField field={name} label={t('服务名')} required>
          <Input
            disabled={options.isModify}
            field={name}
            maxLength={128}
            placeholder={t('允许数字、英文字母、.、-、_，限制128个字符')}
            size={'l'}
          />
        </FormField>
        <FormField field={department} label={t('部门')}>
          <Input field={department} size={'l'} />
        </FormField>
        <FormField field={business} label={t('业务')}>
          <Input field={business} size={'l'} />
        </FormField>
        <FormField field={enableNearby} label={t('开启就近访问')}>
          <Switch field={enableNearby} />
        </FormField>
        <FormItem
          label={
            <>
              <Text>{t('服务标签')}</Text>
              <Bubble content={t('服务标签可用于标识服务的用处、特征，格式为key:value')}>
                <Icon type={'info'}></Icon>
              </Bubble>
            </>
          }
        >
          <TagTable tags={metadata} />
        </FormItem>
        <FormField field={comment} label={t('描述')}>
          <Input
            field={comment}
            maxLength={1024}
            placeholder={t('长度不超过1024个字符,标签数量不能超过64个')}
            size={'l'}
          />
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
