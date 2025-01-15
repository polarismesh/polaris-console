import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import Duck from './CreateDuck'
import { Form, Button, Icon, FormItem, Radio, RadioGroup, Switch, TagSelect, Modal } from 'tea-component'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import ResourcePrincipalAuth from '@src/polaris/auth/user/operation/ResourcePrincipalAuth'
import { VisibilityMode } from '@src/polaris/service/operation/CreateDuck'
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
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      size={'xl'}
      title={data.name ? '编辑命名空间' : '新建命名空间'}
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
  const { name, comment, service_export_to, visibilityMode, sync_to_global_registry } = formApi.getFields([
    'name',
    'comment',
    'service_export_to',
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
        <FormField field={name} label={'命名空间'} required>
          <Input
            field={name}
            maxLength={128}
            placeholder={'允许数字、英文字母、.、-、_，限制128个字符'}
            size={'l'}
            disabled={options?.isModify}
          />
        </FormField>

        <FormField field={comment} label={'描述'}>
          <Input field={comment} maxLength={1024} placeholder={'长度不超过1024个字符'} size={'l'} />
        </FormField>

        <>
          <Button type={'link'} onClick={() => setShowAdvance(!showAdvance)} style={{ cursor: 'pointer' }}>
            <Icon type={showAdvance ? 'arrowup' : 'arrowdown'} />
            {'高级设置'}
          </Button>

          {showAdvance && (
            <>
              <FormItem label={'服务可见性'} tips={'当前命名空间下的服务被允许可见的命名空间列表'} required>
                <section style={{ marginBottom: '15px' }}>
                  <RadioGroup
                    value={visibilityMode.getValue()}
                    onChange={v => {
                      visibilityMode.setValue(v)
                      service_export_to.setValue([])
                    }}
                  >
                    <Radio name={VisibilityMode.Single}>{'仅当前命名空间'}</Radio>
                    <Radio name={VisibilityMode.All}>{'全部命名空间（包括新增）'}</Radio>
                    <Radio name={''}>{'指定命名空间'}</Radio>
                  </RadioGroup>
                </section>
                {visibilityMode.getValue() === '' && (
                  <TagSelect
                    value={service_export_to.getValue() || []}
                    options={[{ text: '当前全部命名空间', value: '__all__' }, ...options.namespaceList] || []}
                    onChange={value => {
                      if (value.includes('__all__')) {
                        service_export_to.setValue([
                          ...new Set([...service_export_to.getValue(), ...options.namespaceList.map(x => x.value)]),
                        ])
                        visibilityMode.setValue('')
                      } else {
                        service_export_to.setValue(value)
                        visibilityMode.setValue('')
                      }
                    }}
                  />
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
                            '开启后，该命名空间下，全部服务的同步开关将自动开启。全部服务资源将同步至全局实例。同步至全局实例后，全局实例中的服务可见性为全局可见。如需关闭某个指定服务的同步状态，可前往具体服务详情中关闭。',
                        })
                      } else {
                        confirm = await Modal.confirm({
                          message: '确认关闭同步开关',
                          description:
                            '关闭后，该命名空间下，全部服务的同步开关将自动关闭。全部服务资源将不再同步至全局实例。如需开启某个指定服务的同步状态，可前往具体服务详情中关闭。',
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
