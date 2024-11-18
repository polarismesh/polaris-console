import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import Duck from './ReleaseConfigDuck'
import FileDiff from '../FileDiff'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import { Form, FormItem, FormText, Button, Stepper, notification, Bubble } from 'tea-component'
import Input from '@src/polaris/common/duckComponents/form/Input'
import { checkReleaseVersionExist } from '../../../model'

export default purify(function (props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { ducks, selector } = duck
  const formApi = ducks.form.getAPI(store, dispatch)
  const { releaseVersion, comment } = formApi.getFields(['name', 'releaseVersion', 'comment'])
  const { data } = selector(store)
  const [step, setStep] = React.useState('0')
  const [existRelease, setExistRelease] = React.useState(false)
  if (!data) return <noscript />
  const { lastRelease, content, format } = data
  const stepInfo = {
    0: (
      <Form>
        <FormItem label={'配置中心名称'}>
          <FormText>{data.group}</FormText>
        </FormItem>
        <FormField field={releaseVersion} label={'版本号'}>
          <Bubble
            trigger="focus"
            content={existRelease ? "该版本已存在，请重新填写版本号" : content}
            placement="right"
            error={existRelease}
          >
            <Input placeholder={'请输入版本号'} field={releaseVersion} onChange={async (val, ctx) => {
              if (!val) {
                setExistRelease(false)
                return
              }
              const exist = await checkReleaseVersionExist({
                namespace: data.namespace,
                group: data.group,
                release_name: val,
                name: data.name,
              })
              setExistRelease(exist)
            }} />
          </Bubble>

        </FormField>
        <FormField field={comment} label={'备注'}>
          <Input placeholder={'请输入版本备注'} field={comment} maxLength={200} />
        </FormField>
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
      title={'发布配置文件'}
      size={isFirstStep ? 'l' : 1000}
      buttons={(submitCreator, cancelCreator) => {
        return [
          <Button
            key='step-button'
            type={isFirstStep ? 'primary' : 'weak'}
            disabled={isFirstStep && existRelease}
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
