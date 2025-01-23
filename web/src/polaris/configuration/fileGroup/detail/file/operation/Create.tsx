import React from 'react'
import { DuckCmpProps, purify } from 'saga-duck'
import Duck from './CreateDuck'
import { Form, Select, FormItem, Switch, InputAdornment, Button, Icon, Segment } from 'tea-component'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import Input from '@src/polaris/common/duckComponents/form/Input'
import { TagTable } from '@src/polaris/common/components/TagTable'
import { ConfigFileMode, ConfigFileModeOptions, SaveFileEncodingOptions } from '../constants'
import MonacoEditor from '@src/polaris/common/components/MocacoEditor'

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
      title={data.name ? '编辑配置文件' : '新建配置文件'}
    >
      <CreateForm duck={duck} store={store} dispatch={dispatch} />
    </Dialog>
  )
}

export enum FileFormat {
  YAML = 'yml',
  JSON = 'json',
  XML = 'xml',
  HTML = 'html',
  PROPERTIES = 'properties',
  TEXT = 'text',
}

const CreateForm = purify(function CreateForm(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selectors,
  } = duck

  const formApi = form.getAPI(store, dispatch)
  const [showAdvance, setShowAdvance] = React.useState(false)

  const {
    namespace,
    comment,
    name,
    group,
    format,
    tags,
    encrypted,
    encryptAlgo,
    supported_client,
    persistent,
  } = formApi.getFields([
    'namespace',
    'name',
    'comment',
    'group',
    'format',
    'tags',
    'encrypted',
    'encryptAlgo',
    'supported_client',
    'persistent',
  ])
  const { encoding, path, postCmd } = persistent.getFields(['encoding', 'path', 'postCmd'])
  const options = selectors.options(store)

  return (
    <>
      <Form>
        <FormField field={namespace} label={'命名空间'} required>
          <Select
            searchable
            value={namespace.getValue()}
            options={options.namespaceList}
            onChange={value => {
              if (value !== namespace.getValue()) {
                group.setValue('')
              }
              namespace.setValue(value)
            }}
            type={'simulate'}
            appearance={'button'}
            size='m'
            disabled={true}
          ></Select>
        </FormField>
        <FormField field={group} label={'配置分组'} required>
          <Select
            searchable
            value={group.getValue()}
            options={options.configFileGroupList}
            onChange={value => group.setValue(value)}
            type={'simulate'}
            appearance={'button'}
            size='m'
            disabled={true}
          ></Select>
        </FormField>
        <FormField
          field={name}
          label={'配置文件名'}
          required
          message={'可通过/分隔符创建文件夹，强烈建议文件名带上后缀，如：datasource/master.json'}
        >
          <InputAdornment after={'文件格式: ' + (format.getValue() === null ? 'text' : format.getValue())}>
            <Input
              field={name}
              disabled={options.isModify}
              maxLength={128}
              onChange={val => {
                if (val.lastIndexOf('.') === -1) {
                  format.setValue('text')
                  return
                }
                const suffix = val.substring(val.lastIndexOf('.') + 1)
                if (suffix === '') {
                  format.setValue('text')
                } else {
                  format.setValue(suffix)
                }
              }}
              placeholder={'允许数字、英文字母、.、-、_，限制128个字符'}
              size={'l'}
            />
          </InputAdornment>
        </FormField>
        <FormField field={comment} label={'备注'}>
          <Input field={comment} maxLength={200} placeholder={'长度不超过200个字符'} size={'l'} />
        </FormField>
        <FormItem label={'配置标签'}>
          <TagTable tags={tags} />
        </FormItem>
        <FormField field={encrypted} label={'配置加密'}>
          <Switch
            defaultValue={encrypted.getValue()}
            onChange={value => {
              if (!value) {
                // 配置鉴权关闭的话，设置加密算法为空
                encryptAlgo.setValue('')
              }
              encrypted.setValue(value)
            }}
          >
            {encrypted?.getValue() ? '开启，请选择配置文件加密算法 ' : '未开启'}
          </Switch>
          {encrypted?.getValue() && (
            <>
              <Select
                value={encryptAlgo.getValue()}
                options={options.encryptAlgorithms}
                onChange={value => encryptAlgo.setValue(value)}
                type={'simulate'}
                appearance={'button'}
                size='l'
              ></Select>
            </>
          )}
        </FormField>
        <Button type={'link'} onClick={() => setShowAdvance(!showAdvance)} style={{ cursor: 'pointer' }}>
          <Icon type={showAdvance ? 'arrowup' : 'arrowdown'} />
          {'高级设置'}
        </Button>
        {showAdvance && (
          <>
            <FormItem label={'推送方式'}>
              <Segment
                options={ConfigFileModeOptions}
                value={supported_client.getValue()}
                onChange={v => supported_client.setValue(v)}
              />
            </FormItem>
            {supported_client.getValue() !== ConfigFileMode.Default && (
              <>
                <FormItem label={'文件编码方式'}>
                  <Segment
                    options={SaveFileEncodingOptions}
                    value={encoding.getValue()}
                    onChange={v => encoding.setValue(v)}
                  />
                </FormItem>
                <FormField field={path} label={'配置下发路径'}>
                  <Input field={path} placeholder={'e.g. /etc/nginx/conf.d/'} size={'m'} />
                </FormField>
                <FormField
                  field={postCmd}
                  label={'后置脚本命令'}
                  message={'选填，不超过200个字符，如 sh /etc/nginx/conf.d/start.sh'}
                  showStatusIcon={false}
                >
                  <MonacoEditor
                    height={300}
                    width={500}
                    value={postCmd.getValue()}
                    onChange={v => postCmd.setValue(v)}
                  />
                </FormField>
              </>
            )}
          </>
        )}
      </Form>
    </>
  )
})
