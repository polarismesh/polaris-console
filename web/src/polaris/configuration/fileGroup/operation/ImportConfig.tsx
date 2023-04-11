import Dialog from '@src/polaris/common/duckComponents/Dialog'
import FormField from '@src/polaris/common/duckComponents/form/Field'
import insertCSS from '@src/polaris/common/helpers/insertCSS'

import React, { useCallback, useRef, useState } from 'react'
import { DuckCmpProps, memorize, purify } from 'saga-duck'
import { Form, Select, Segment, Input, Row, Col, message, Button } from 'tea-component'
import { IImportConfigFileResultItem } from '../model'
import ImportConfigDuck, { TConflictHandling } from './ImportConfigDuck'

insertCSS(
  'config-file-group-import',
  `

.config-file-import {
  font-size: 14px;
}

.config-file-import .container {
  margin-top: 12px;
  background-color: #f5f5f8;
  border-radius: 5px;
  padding: 24px;
}
.config-file-import .result-group {
  display: flex;
  margin-top: 16px;
}
.config-file-import .result-group .group-left {
  display: flex;
  width: 100px;
}
.config-file-import .result-group .group-right {
  flex-grow: 1;
}
.config-file-import .result-group .group-right p:not(:first-child) {
  margin-top: 16px;
}
`,
)

const conflictHandingOptions = [
  {
    value: 'skip',
    text: '跳过',
  },
  {
    value: 'overwrite',
    text: '覆盖',
  },
]

const ImportForm = purify(function ImportForm(props: DuckCmpProps<ImportConfigDuck>) {
  const { duck, store, dispatch } = props
  const {
    ducks: { form },
    selectors,
  } = duck
  const formApi = form.getAPI(store, dispatch)
  const { namespace, config, conflict_handling: conflictHandling } = formApi.getFields([
    'namespace',
    'config',
    'conflict_handling',
  ])

  const options = selectors.options(store)

  return (
    <>
      <Form>
        <FormField field={namespace} label='命名空间' required>
          <Select
            value={namespace.getValue()}
            options={options?.namespaceList ?? []}
            onChange={value => namespace.setValue(value)}
            type={'simulate'}
            appearance={'button'}
            size='l'
          ></Select>
        </FormField>
        <FormField field={config} label='上传文件' message='请上传zip格式文件，大小10M以内'>
          <UploadZipFile onChange={file => config.setValue(file)} />
        </FormField>
        <FormField field={conflictHandling} label='冲突处理'>
          <Segment
            options={conflictHandingOptions}
            value={conflictHandling.getValue()}
            onChange={value => conflictHandling.setValue(value as TConflictHandling)}
          />
        </FormField>
      </Form>
    </>
  )
})

interface IImportResultGroupProps {
  title: string
  configFiles: IImportConfigFileResultItem[]
}
function ImportResultGroup(props: IImportResultGroupProps) {
  const [expand, setExpand] = useState(false)
  const { title, configFiles } = props
  return (
    <div className='result-group'>
      <div className='group-left'>{title}</div>
      <div className='group-right'>
        <p>
          <span style={{ marginRight: '24px' }}>{configFiles.length}</span>

          <Button disabled={configFiles.length === 0} onClick={() => setExpand(value => !value)} type='link'>
            {expand ? '收起' : '查看'}
          </Button>
        </p>
        {expand && (
          <p>
            {configFiles.map(file => (
              <span style={{ marginRight: '32px' }} key={file.id}>
                {file.name}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  )
}

const ImportResult = purify(function ImportResult(props: DuckCmpProps<ImportConfigDuck>) {
  const { duck, store } = props
  const { selectors } = duck

  const options = selectors.options(store)
  const importResult = options?.importResult ?? {}
  const { createConfigFiles = [], skipConfigFiles = [], overwriteConfigFiles = [] } = importResult
  const totalFileCount =
    (createConfigFiles?.length ?? 0) + (skipConfigFiles?.length ?? 0) + (overwriteConfigFiles?.length ?? 0)
  return (
    <div className='config-file-import'>
      <p>配置文件导入完成</p>
      <div className='container'>
        <p>文件总数: {totalFileCount}</p>
        <ImportResultGroup title='新增文件数' configFiles={createConfigFiles ?? []} />
        <ImportResultGroup title='覆盖文件数' configFiles={overwriteConfigFiles ?? []} />
        <ImportResultGroup title='跳过文件数' configFiles={skipConfigFiles ?? []} />
      </div>
    </div>
  )
})

export interface IUploadZipFileProps {
  onChange: (file: File) => void
}

function UploadZipFile(props: IUploadZipFileProps) {
  const [uploaded, setUploaded] = useState(false)
  const [filename, setFilename] = useState('')
  const refZipFile = useRef<HTMLInputElement | null>(null)
  function handleFileUpload() {
    setUploaded(true)
    const zipFile = refZipFile.current?.files[0]
    if (zipFile) {
      if (zipFile.size > 10 * 1024 * 1024) {
        return message.error({ content: '文件必须小于10M' })
      }
      setFilename(zipFile.name)
      props.onChange(zipFile)
    }
  }
  return (
    <Row>
      <Col>
        <Input disabled value={filename} style={{ width: '100%' }} />
      </Col>
      <Col>
        <label htmlFor='upload' style={{ fontSize: '14px' }} className='tea-btn tea-btn--weak'>
          {uploaded ? '重新选择' : '选择文件'}
        </label>
        <input
          ref={refZipFile}
          type='file'
          name='upload'
          id='upload'
          style={{ visibility: 'hidden', position: 'absolute' }}
          accept='application/zip'
          onChange={handleFileUpload}
        />
      </Col>
    </Row>
  )
}

const getHandlers = memorize(({ creators }: ImportConfigDuck, dispatch) => ({
  importConfig: v => dispatch(creators.importConfig(v)),
  submit: v => dispatch(creators.submit(v)),
}))

export default function ImportConfig(props: DuckCmpProps<ImportConfigDuck>) {
  const { duck, store, dispatch } = props
  const { selectors } = duck
  const visible = selectors.visible(store)
  if (!visible) {
    return <noscript />
  }

  const options = selectors.options(store)
  const handlers = getHandlers(props)

  const handleSubmit = useCallback(
    function handleSubmit() {
      if (options.showImportResult) {
        handlers.submit({})
      } else {
        handlers.importConfig({})
      }
    },
    [options?.showImportResult],
  )
  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      size='l'
      title='导入'
      onSubmit={handleSubmit}
      defaultSubmitText={options?.showImportResult ? '确认' : '提交'}
    >
      {options?.showImportResult ? (
        <ImportResult duck={duck} store={store} dispatch={dispatch} />
      ) : (
        <ImportForm duck={duck} store={store} dispatch={dispatch} />
      )}
    </Dialog>
  )
}
