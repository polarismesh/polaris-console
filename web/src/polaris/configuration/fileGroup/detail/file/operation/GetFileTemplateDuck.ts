import { call, put, select } from 'redux-saga/effects'
import FormDialog from '@src/polaris/common/ducks/FormDialog'
import Form from '@src/polaris/common/ducks/Form'
import { ConfigFile } from '@src/polaris/configuration/fileGroup/types'
import { describeConfigFileTemplates } from '@src/polaris/configuration/fileGroup/model'
import { reduceFromPayload } from 'saga-duck'
import { Modal } from 'tea-component'

export type DialogOptions = { file: ConfigFile }

export default class GetFileTemplateDuck extends FormDialog {
  Options: DialogOptions
  get Form() {
    return CreateForm
  }
  get quickTypes() {
    enum Types {
      SET_TEMPLATE_LIST,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      templateList: reduceFromPayload(types.SET_TEMPLATE_LIST, []),
    }
  }
  *onSubmit() {
    const {
      ducks: { form },
      selector,
    } = this
    const { templateList } = selector(yield select())
    const { currentTemplateId } = form.selectors.values(yield select())
    const currentTemplate = templateList.find(item => item.id === currentTemplateId)
    const confirm = yield Modal.confirm({
      message: '请确认应用模板',
      description: '应用所选模板将会覆盖当前已编辑的内容',
    })
    if (!confirm) throw 'not confirm'
    return currentTemplate.content
  }
  *beforeSubmit() {
    const {
      ducks: { form },
    } = this
    yield put(form.creators.setAllTouched(true))
    const firstInvalid = yield select(form.selectors.firstInvalid)
    if (firstInvalid) {
      throw false
    }
  }
  /**
   * 开始执行表单弹窗逻辑
   * @param data 表单初始值
   * @param options 弹窗自定义配置（TODO: 或考虑直接传入Form作为Meta使用）
   */
  *execute(data: Partial<this['Data']>, options: this['Options'] = null) {
    const duck = this
    const { selector } = duck
    const { options: oldOptions } = selector(yield select())
    if (options !== oldOptions) {
      yield put({
        type: duck.types.SET_OPTIONS,
        payload: options,
      })
    }
    let content = ''
    yield this.show(data, function*() {
      const state = selector(yield select())
      const values = state.form.values

      content = yield call([duck, duck.onSubmit], values, data, state.options)
    })
    return content
  }
  *onShow() {
    yield* super.onShow()
    const {
      selectors,
      ducks: { form },
      types,
    } = this
    const options = selectors.options(yield select())
    const { configFileTemplates: templateList } = yield describeConfigFileTemplates({})
    const templateOptions = templateList.map(item => ({
      ...item,
      text: `${item.name}(${item.format})`,
      value: item.id,
      //disabled: item.format !== options.file.format,
    }))
    yield put({
      type: types.SET_TEMPLATE_LIST,
      payload: templateOptions,
    })
    yield put(form.creators.setMeta({ ...options, templateOptions }))
    yield put(
      form.creators.setValues({
        currentTemplateId: templateOptions.find(item => !item.disabled)?.id || '',
      }),
    )
    // TODO 表单弹窗逻辑，在弹窗关闭后自动cancel
  }
}
export interface Values {
  currentTemplateId: string
}
class CreateForm extends Form {
  Values: Values
  Meta: any
  validate(v: this['Values'], meta: this['Meta']) {
    return validator(v, meta)
  }
}
const validator = CreateForm.combineValidators<Values, any>({
  currentTemplateId(v, data?, meta?) {
    const currentTemplate = meta?.templateOptions?.find(item => item.id === v)
    if (currentTemplate?.format !== meta?.file?.format) {
      return '您当前选择的模板与配置文件格式不符，请检查后重试。'
    }
  },
})
