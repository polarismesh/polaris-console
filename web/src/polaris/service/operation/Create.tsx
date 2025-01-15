import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import Duck, { VisibilityMode } from './CreateDuck'
import {
  Form,
  Text,
  Icon,
  Bubble,
  Button,
  FormItem,
  Radio,
  RadioGroup,
  SelectMultiple,
  AutoComplete,
  Input as TeaInput,
  Modal,
  Switch,
} from 'tea-component'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import ResourcePrincipalAuth from '@src/polaris/auth/user/operation/ResourcePrincipalAuth'
import { TagTable } from '@src/polaris/common/components/TagTable'
import { useServerConfig } from '@src/polaris/common/util/serverConfig'

export default function Create(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selectors } = duck
  const visible = selectors.visible(store)
  if (!visible) {
    return <noscript />
  }
  const data = selectors.data(store)
  return (
    <Dialog duck={duck} store={store} dispatch={dispatch} size='xl' title={data.name ? '编辑服务' : '新建服务'}>
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
  const {
    namespace,
    name,
    comment,
    metadata,
    department,
    business,
    export_to,
    visibilityMode,
    sync_to_global_registry,
  } = formApi.getFields([
    'namespace',
    'name',
    'comment',
    'metadata',
    'ports',
    'business',
    'department',
    'export_to',
    'visibilityMode',
    'sync_to_global_registry',
  ])
  const options = selectors.options(store)
  const [showAdvance, setShowAdvance] = React.useState(false)
  const multiRegConfig = useServerConfig('multiregistries')
  const multiRegConfigEnabled = multiRegConfig?.open
  return (
    <>
      <Form>
        <FormField field={namespace} label='命名空间' required>
          <AutoComplete
            options={options.namespaceList}
            onChange={value => {
              namespace.setValue(value)
            }}
          >
            {ref => (
              <TeaInput
                ref={ref}
                value={namespace.getValue()}
                onChange={value => {
                  namespace.setValue(value)
                }}
                disabled={options.isModify}
                size={'l'}
                placeholder={'请选择或输入命名空间'}
              />
            )}
          </AutoComplete>
        </FormField>

        <FormField field={name} label={'服务名'} required>
          <Input
            disabled={options.isModify}
            field={name}
            maxLength={128}
            placeholder={'允许数字、英文字母、.、-、_，限制128个字符'}
            size={'l'}
          />
        </FormField>

        <FormField field={department} label={'部门'}>
          <Input field={department} size={'l'} />
        </FormField>
        <FormField field={business} label={'业务'}>
          <Input field={business} size={'l'} />
        </FormField>
        <FormItem
          label={
            <>
              <Text>服务标签</Text>
              <Bubble content={'服务标签可用于标识服务的用处、特征，格式为key:value'}>
                <Icon type={'info'}></Icon>
              </Bubble>
            </>
          }
        >
          <TagTable tags={metadata} />
        </FormItem>
        <FormField field={comment} label={'描述'}>
          <Input
            field={comment}
            maxLength={1024}
            placeholder={'长度不超过1024个字符,标签数量不能超过64个'}
            size={'l'}
          />
        </FormField>

        <>
          <Button type={'link'} onClick={() => setShowAdvance(!showAdvance)} style={{ cursor: 'pointer' }}>
            <Icon type={showAdvance ? 'arrowup' : 'arrowdown'} />
            {'高级设置'}
          </Button>
          {showAdvance && (
            <>
              <FormItem
                label={'可见性'}
                tips={'当前服务允许可见的命名空间列表，当与命名空间的服务可见性冲突时，优先使用该选项配置'}
                required
              >
                <section style={{ marginBottom: '15px' }}>
                  <RadioGroup
                    value={visibilityMode.getValue()}
                    onChange={v => {
                      visibilityMode.setValue(v)
                      export_to.setValue([])
                    }}
                  >
                    <Radio name={VisibilityMode.Single}>{'仅当前命名空间'}</Radio>
                    <Radio name={VisibilityMode.All}>{'全部命名空间（包括新增）'}</Radio>
                    <Radio name={''}>{'指定命名空间'}</Radio>
                  </RadioGroup>
                </section>
                {visibilityMode.getValue() === '' && (
                  <SelectMultiple
                    searchable
                    allOption={{ text: '当前全部命名空间', value: 'all' }}
                    value={export_to.getValue() || []}
                    options={options.namespaceList || []}
                    onChange={value => {
                      export_to.setValue(value)
                      visibilityMode.setValue('')
                    }}
                    appearance={'button'}
                    size='l'
                  ></SelectMultiple>
                )}
              </FormItem>
              {multiRegConfigEnabled && (
                <FormItem label={'同步全局实例'}>
                  <Switch
                    value={sync_to_global_registry.getValue()}
                    onChange={async v => {
                      let confirm = false
                      if (v) {
                        confirm = await Modal.confirm({
                          message: '确认开启同步开关',
                          description:
                            '开启后，该服务下所有资源将同步至全局实例。同步至全局实例后，全局实例中的服务可见性为全局可见。',
                        })
                      } else {
                        confirm = await Modal.confirm({
                          message: '确认关闭同步开关',
                          description: '关闭后，该服务下所有资源将不再同步至全局实例。',
                        })
                      }
                      if (confirm) sync_to_global_registry.setValue(v)
                    }}
                  ></Switch>
                </FormItem>
              )}
              {options.authOpen && (
                <FormItem label={'授权'}>
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
        </>
      </Form>
    </>
  )
})
