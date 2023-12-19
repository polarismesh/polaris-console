import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import Duck from './BetaReleaseConfigDuck'
import FileDiff from '../FileDiff'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import { Form, FormItem, FormControl, FormText, Button, Stepper, Select, Table, Text } from 'tea-component'
import Input from '@src/polaris/common/duckComponents/form/Input'
import { scrollable, autotip } from 'tea-component/lib/table/addons'
import {
  ClientLabelTypeOptions,
  ClientLabelType,
  ClientLabelMatchTypeOptions,
  ClientLabelMatchType,
} from '../../../types'
import TagSelectOrInput, { checkNeedTagInput } from '@src/polaris/common/components/TagSelectOrInput'

const removeArrayFieldValue = (field, index) => {
  const newValue = field.getValue()
  newValue.splice(index, 1)
  field.setValue([...newValue])
}
const addTag = field => {
  field.setValue([...(field.getValue() || []), { key: '', value: '' }])
}

export default purify(function(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { ducks, selector } = duck
  const formApi = ducks.form.getAPI(store, dispatch)
  const { releaseVersion, comment, clientLabels } = formApi.getFields(['releaseVersion', 'comment', 'clientLabels'])
  const { data } = selector(store)
  const [step, setStep] = React.useState('0')
  if (!data) return <noscript />
  const { lastRelease, content, format } = data
  const stepInfo = {
    0: (
      <Form>
        <FormItem label={'配置中心名称'}>
          <FormText>{data.group}</FormText>
        </FormItem>
        <FormField field={releaseVersion} label={'版本号'}>
          <Input placeholder={'请输入版本号'} field={releaseVersion} />
        </FormField>
        <FormField field={comment} label={'备注'}>
          <Input placeholder={'请输入版本备注'} field={comment} maxLength={200} />
        </FormField>
        <FormItem
          label={
            <>
              <Text>{'客户端标签'}</Text>
            </>
          }
          message={'标签键的长度不能超过128字符，标签值的长度不能超过4096个字符'}
        >
          <Table
            bordered
            records={[...clientLabels.asArray()]}
            columns={[
              {
                key: 'key',
                header: '标签键',
                width: 150,
                render: field => {
                  const key = field.getField('key')
                  return (
                    <FormControl
                      status={key.getTouched() && key.getError() ? 'error' : null}
                      showStatusIcon={false}
                      style={{ display: 'inline' }}
                      message={key.getTouched() && key.getError() ? key.getError() : null}
                    >
                      <Select
                        options={ClientLabelTypeOptions}
                        value={key.getValue()}
                        onChange={value => {
                          key.setValue(ClientLabelType[value])
                        }}
                        type={'simulate'}
                        appearance={'button'}
                        size={'full'}
                      ></Select>
                    </FormControl>
                  )
                },
              },
              {
                key: 'type',
                header: '匹配方式',
                width: 120,
                render: field => {
                  const { value } = field.getFields(['value'])
                  return (
                    <FormControl showStatusIcon={false} style={{ display: 'inline' }}>
                      <Select
                        options={ClientLabelMatchTypeOptions}
                        value={value.getFields(['type']).type.getValue()}
                        onChange={choseValue => {
                          value.getFields(['type']).type.setValue(ClientLabelMatchType[choseValue])
                          value.getFields(['value_type']).value_type.setValue('TEXT')
                        }}
                        type={'simulate'}
                        appearance={'button'}
                        size={'s'}
                      ></Select>
                    </FormControl>
                  )
                },
              },
              {
                key: 'value',
                header: '标签值',
                render: field => {
                  const value = field.getField('value').getField('value')
                  const type = field.getField('value').getField('type')
                  return (
                    <FormControl
                      status={value.getTouched() && value.getError() ? 'error' : null}
                      showStatusIcon={false}
                      style={{ display: 'inline' }}
                      message={value.getTouched() && value.getError() ? value.getError() : null}
                    >
                      <TagSelectOrInput
                        useTagSelect={checkNeedTagInput(type.getValue())}
                        inputProps={{ placeholder: '请输入Value值', size: 'full', maxLength: 4096 }}
                        tagSelectProps={{
                          style: { width: '100%', verticalAlign: 'middle' },
                        }}
                        field={value}
                      ></TagSelectOrInput>
                    </FormControl>
                  )
                },
              },
              {
                key: 'action',
                header: '操作',
                width: 50,
                render: (field, key, index) => {
                  return (
                    <Button
                      type={'icon'}
                      icon={'close'}
                      onClick={() => removeArrayFieldValue(clientLabels, index)}
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
              <Button onClick={() => addTag(clientLabels)} type={'link'}>
                {'添加标签'}
              </Button>
            }
          ></Table>
        </FormItem>
      </Form>
    ),
    1: (
      <FileDiff
        original={lastRelease?.content || ''}
        now={content}
        format={format}
        originTitle={lastRelease?.name ? <>上一版本({lastRelease.name})</> : <>{'无上一版本'}</>}
        nowTitle={<>当前版本({releaseVersion.getValue()})</>}
      />
    ),
  }
  const isFirstStep = step === '0'
  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      title={'灰度发布配置文件'}
      size={isFirstStep ? 'l' : 1000}
      buttons={(submitCreator, cancelCreator) => {
        return [
          <Button
            key='step-button'
            type={isFirstStep ? 'primary' : 'weak'}
            onClick={() => setStep(isFirstStep ? '1' : '0')}
          >
            {isFirstStep ? '下一步' : '上一步'}
          </Button>,
          ...(isFirstStep ? [] : [submitCreator()]),
          cancelCreator(),
        ]
      }}
      defaultCancel={false}
      defaultSubmit={false}
    >
      <Stepper
        steps={[
          {
            id: '0',
            label: '填写发布信息',
          },
          { id: '1', label: '版本对比' },
        ]}
        current={step}
        style={{ marginBottom: '15px' }}
      ></Stepper>
      {stepInfo[step]}
    </Dialog>
  )
})
