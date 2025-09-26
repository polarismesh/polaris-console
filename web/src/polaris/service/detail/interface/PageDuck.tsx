import { createToPayload, reduceFromPayload } from 'saga-duck'
import { takeLatest } from 'redux-saga-catch'
import { put, select } from 'redux-saga/effects'
import {
  Form,
  FormItem,
  FormText,
  Modal,
  SelectOptionWithGroup,
  Table,
  TagValue,
  Text,
  notification,
} from 'tea-component'

import React from 'react'
import { autotip, scrollable } from 'tea-component/lib/table/addons'
import { saveAs } from 'file-saver'
import {
  GovernanceInterfaceDescription,
  GovernanceServiceContract,
  DescribeGovernanceServiceContractVersions,
  DescribeGovernanceServiceContracts,
  DeleteGovernanceServiceContractInterfaces,
} from '../../model'
import { ServiceItem } from '../../PageDuck'
import { ComposedId as BaseComposedId } from '../types'
import GridPageDuck, { Filter as BaseFilter } from '@src/polaris/common/ducks/GridPage'

export const DefaultInterfaceTagAttribute = {
  type: 'input',
  key: 'interface',
  name: '接口名称',
}
interface Filter extends BaseFilter {
  service: string
  namespace: string
  version: string
}
const parameterColumns = [
  {
    key: 'name',
    header: '参数名',
    render: x => <Text tooltip={x.name}>{x.name}</Text>,
  },
  {
    key: 'in',
    header: '参数位置',
  },
  {
    key: 'required',
    header: '是否必填',
    render: x => (x.required ? '是' : '否'),
  },
  {
    key: 'type',
    header: '类型',
    render: x => <Text tooltip={x.type}>{x.type}</Text>,
  },
  {
    key: 'description',
    header: '备注',
    render: x => <Text tooltip={x.description}>{x.description}</Text>,
  },
]
const responseColumns = [
  {
    key: 'name',
    header: '参数名',
    render: x => <Text tooltip={x.name}>{x.name}</Text>,
  },
  {
    key: 'type',
    header: '类型',
    render: x => <Text tooltip={x.type}>{x.type}</Text>,
  },
  {
    key: 'description',
    header: '备注',
    render: x => <Text tooltip={x.description}>{x.description}</Text>,
  },
]
const handleRequestParameters = parameter => {
  const common = {
    name: parameter.name,
    description: parameter.description,
    in: parameter.in,
  }
  if (parameter.schema) {
    const isArray = parameter.schema?.type === 'array'
    if (parameter.schema?.originalRef || parameter.schema?.items?.originalRef) {
      const type = isArray ? parameter?.schema?.items?.originalRef : parameter.schema?.originalRef
      const arrayWord = isArray ? '[]' : ''
      return {
        ...common,
        type: `${type}${arrayWord}(复杂类型)`,
        required: parameter.required,
      }
    }
    return {
      ...common,
      type: `${isArray ? parameter.schema?.items?.type : parameter?.schema?.type}${isArray ? '[]' : ''}`,
      required: parameter.required,
    }
  } else {
    const isArray = parameter?.type === 'array'
    return {
      ...common,
      type: `${isArray ? parameter?.items?.type : parameter?.type}${isArray ? '[]' : ''}`,
      required: parameter.required,
    }
  }
}
const handleResponses = response => {
  const isArray = response.schema?.type === 'array'
  if (response.schema?.originalRef || response.schema?.items?.originalRef) {
    const type = isArray ? response?.schema?.items?.originalRef : response.schema?.originalRef
    const arrayWord = isArray ? '[]' : ''
    return {
      name: '_RESPONSE',
      type: `${type}${arrayWord}(复杂类型)`,
      description: response.description,
    }
  }
  return {
    name: '_RESPONSE',
    type: isArray ? response.schema?.items?.type : response.schema?.type,
    description: response.description,
  }
}
interface ComposedId extends BaseComposedId {
  name: string
  namespace: string
}
export default class InterfacePageDuck extends GridPageDuck {
  Filter: Filter
  Item: GovernanceInterfaceDescription & Partial<GovernanceServiceContract>
  baseUrl = null
  get quickTypes() {
    enum Types {
      SET_CUSTOM_FILTERS,
      EDIT,
      REMOVE,
      CREATE,
      SET_SELECTION,
      SET_NAMESPACE_LIST,
      SET_EXPANDED_KEYS,
      LOAD,
      CHANGE_TAGS,
      SET_TAGS,
      SET_DATA,
      SET_COMPOSE_ID,
      SET_CONTRACT_VERSION,
      FETCH_CONTRACT_VERSION_LIST,
      SET_CONTRACT_VERSION_LIST,
      SHOW_DETAIL,
      SET_SERVICE_CONTRACT,
      EXPORT_JSON,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }
  get initialFetch() {
    return false
  }
  get recordKey() {
    return 'id'
  }
  get watchTypes() {
    return [...super.watchTypes, this.types.SEARCH, this.types.SET_COMPOSE_ID, this.types.SET_CONTRACT_VERSION]
  }
  get params() {
    return [...super.params]
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
      selection: reduceFromPayload<string[]>(types.SET_SELECTION, []),
      expandedKeys: reduceFromPayload<string[]>(types.SET_EXPANDED_KEYS, []),
      composedId: reduceFromPayload<ComposedId>(types.SET_COMPOSE_ID, {} as ComposedId),
      tags: reduceFromPayload<TagValue[]>(types.SET_TAGS, []),
      selectedVersion: reduceFromPayload<string>(types.SET_CONTRACT_VERSION, ''),
      contractVersionList: reduceFromPayload<(GovernanceServiceContract & SelectOptionWithGroup)[]>(
        types.SET_CONTRACT_VERSION_LIST,
        [],
      ),
      serviceContracts: reduceFromPayload<GovernanceServiceContract>(types.SET_SERVICE_CONTRACT, {}),
    }
  }
  get creators() {
    const { types } = this
    return {
      ...super.creators,
      remove: createToPayload<string[]>(types.REMOVE),
      create: createToPayload<void>(types.CREATE),
      setSelection: createToPayload<string[]>(types.SET_SELECTION),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEYS),
      load: createToPayload<ComposedId & ServiceItem>(types.LOAD),
      changeTags: createToPayload(types.CHANGE_TAGS),
      selectContractVersion: createToPayload<string>(types.SET_CONTRACT_VERSION),
      showDetail: createToPayload<InterfacePageDuck['Item']>(types.SHOW_DETAIL),
      exportJSON: createToPayload<void>(types.EXPORT_JSON),
    }
  }
  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      filter: (state: State) => ({
        page: state.page,
        count: state.count,
        keyword: state.keyword,
        namespace: state.composedId.namespace,
        service: state.composedId.name,
        version: state.selectedVersion,
      }),
      selection: (state: State) => state.selection,
    }
  }

  *saga() {
    const { types, creators, selector, ducks } = this
    yield* super.saga()
    yield takeLatest(types.LOAD, function*(action) {
      const { regionId, instanceId, namespace, name } = action.payload
      yield put({ type: types.SET_COMPOSE_ID, payload: { regionId, instanceId, namespace, name } })
      yield put({ type: types.FETCH_CONTRACT_VERSION_LIST })
    })
    yield takeLatest(types.FETCH_CONTRACT_VERSION_LIST, function*() {
      const {
        composedId: { namespace, name: service },
      } = selector(yield select())
      if (!namespace) return
      const { data } = yield DescribeGovernanceServiceContractVersions({
        namespace,
        service,
      })
      yield put({
        type: types.SET_CONTRACT_VERSION_LIST,
        payload:
          data?.map(item => ({
            ...item,
            text: `${item.name}(${item.version})`,
            value: `${item.name}=>${item.version}`,
          })) || [],
      })
    })

    yield takeLatest(types.SET_CONTRACT_VERSION_LIST, function*(action) {
      const contractVersionList = action.payload
      const { selectedVersion } = selector(yield select())

      const version = contractVersionList?.find(item => item.value === selectedVersion)
      yield put(
        creators.selectContractVersion(version?.value || selectedVersion || contractVersionList?.[0]?.value || ''),
      )
    })
    yield takeLatest(types.SHOW_DETAIL, function*(action) {
      const detail = action.payload as InterfacePageDuck['Item']
      if (detail.protocol === 'dubbo') {
        yield Modal.confirm({
          size: 'l',
          message: 'dubbo接口详情',
          description: (
            <Form>
              <FormText>{detail.content}</FormText>
            </Form>
          ),
        })
        return
      }
      try {
        const parameterDetail = JSON.parse(detail.content)?.[detail.method?.toLowerCase()]
        const requestParameter = parameterDetail.parameters
        const responses = parameterDetail.responses
        yield Modal.confirm({
          size: 'l',
          message: '查看接口详情',
          description: (
            <Form>
              <FormItem label={'版本'}>
                <FormText>{detail.version}</FormText>
              </FormItem>
              <FormItem label={'路径'}>
                <FormText>{detail.path}</FormText>
              </FormItem>
              <FormItem label={'请求方法'}>
                <FormText>{detail.method}</FormText>
              </FormItem>
              <FormItem label={'协议'}>
                <FormText>{detail.protocol}</FormText>
              </FormItem>
              <FormItem label={'入参'}>
                <FormText>
                  <Table
                    records={requestParameter.map(handleRequestParameters) || []}
                    columns={parameterColumns}
                    recordKey={'name'}
                    addons={[scrollable({ maxHeight: 300 }), autotip({})]}
                    bordered
                  ></Table>
                </FormText>
              </FormItem>
              <FormItem label={'出参'}>
                <FormText>
                  <Table
                    records={[handleResponses(responses['200'])]}
                    columns={responseColumns}
                    recordKey={'name'}
                    addons={[scrollable({ maxHeight: 300 }), autotip({})]}
                    bordered
                  ></Table>
                </FormText>
              </FormItem>
            </Form>
          ),
        })
      } catch (e) {
        yield Modal.confirm({
          size: 'l',
          message: '查看接口详情',
          description: (
            <Form>
              <FormItem label={'版本'}>
                <FormText>{detail.version}</FormText>
              </FormItem>
              <FormItem label={'路径'}>
                <FormText>{detail.path}</FormText>
              </FormItem>
              <FormItem label={'请求方法'}>
                <FormText>{detail.method}</FormText>
              </FormItem>
              <FormItem label={'协议'}>
                <FormText>{detail.protocol}</FormText>
              </FormItem>
              <FormItem label={'内容'}>
                <FormText>{detail.content}</FormText>
              </FormItem>
            </Form>
          ),
        })
      }
    })
    yield takeLatest(ducks.grid.types.FETCH_DONE, function*(action) {
      const { list, serviceContracts } = action.payload
      const { selection } = selector(yield select())
      const validSelection = selection.filter(id => !!list.find(item => item.id === id))
      yield put(creators.setSelection(validSelection))
      yield put({ type: types.SET_SERVICE_CONTRACT, payload: serviceContracts })
    })
    yield takeLatest(types.EXPORT_JSON, function*() {
      const { serviceContracts, selectedVersion, contractVersionList } = selector(yield select())
      const blob = new Blob([JSON.stringify(serviceContracts)], { type: 'text/plain;charset=utf-8' })
      const version = contractVersionList?.find(item => item.value === selectedVersion)
      saveAs(blob, `${version.text}.json`)
    })
    yield takeLatest(types.REMOVE, function*(action) {
      const data = action.payload
      const {
        grid: { list },
        selectedVersion,
        contractVersionList,
      } = selector(yield select())
      const selectionList = list.filter(item => data.includes(item.id))
      const confirm = yield Modal.confirm({
        message: `删除接口`,
        description: (
          <>
            {'确认删除以下接囗吗？'}
            <Table
              bordered
              records={selectionList}
              columns={[
                {
                  key: 'path',
                  header: '路径',
                },
                { key: 'method', header: '方法' },
                { key: 'version', header: '接口版本', render: x => x.version },
              ]}
              addons={[autotip({})]}
            ></Table>
          </>
        ),
        okText: '删除',
      })
      if (confirm) {
        const { id } = contractVersionList?.find(item => item.value === selectedVersion)
        const res = yield DeleteGovernanceServiceContractInterfaces({
          id,
          interfaces: selectionList.map(item => ({ id: item.id })),
        })
        if (res) notification.success({ description: '删除成功' })
        yield put(creators.reload())
      }
    })
  }

  async getData(filters: this['Filter']) {
    const { page, count, service, namespace, version } = filters
    if (!namespace) return { totalCount: 0, list: [] }
    const [name, contractVersion] = version.split('=>')
    const { data } = await DescribeGovernanceServiceContracts({
      limit: count,
      offset: (page - 1) * count,
      namespace: namespace,
      service: service,
      version: contractVersion,
      name: name || undefined,
    })
    const contract = data?.[0]
    return {
      totalCount: contract.interfaces?.length,
      list:
        contract.interfaces?.map(item => ({
          ...item,
          status: contract.status,
          protocol: contract.protocol,
          version,
        })) || [],
      serviceContracts: data,
    }
  }
}
