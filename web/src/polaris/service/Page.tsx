import BasicLayout from '../common/components/BaseLayout'
import React from 'react'
import { DuckCmpProps } from 'saga-duck'
import ServicePageDuck, { EmptyCustomFilter } from './PageDuck'
import {
  Button,
  Card,
  Justify,
  Table,
  Text,
  Select,
  Input,
  InputAdornment,
  FormItem,
  Form,
  FormText,
} from 'tea-component'
import GridPageGrid from '../common/duckComponents/GridPageGrid'
import GridPagePagination from '../common/duckComponents/GridPagePagination'
import getColumns from './getColumns'
import { selectable, expandable } from 'tea-component/lib/table/addons'
import insertCSS from '../common/helpers/insertCSS'
import csvColumns from './csvColumns'
import { enableNearbyString } from './operation/CreateDuck'
import { isReadOnly, showAllLabels } from './utils'

insertCSS(
  'service',
  `
.justify-search{
  margin-right:20px
}
.justify-button{
  vertical-align: bottom
}
`,
)

const SEARCH_METHOD_OPTIONS = [
  { text: '精确', value: 'accurate' },
  { text: '模糊', value: 'vague' },
]

export default function ServicePage(props: DuckCmpProps<ServicePageDuck>) {
  const { duck, store, dispatch } = props
  const { creators, selector } = duck
  const handlers = React.useMemo(
    () => ({
      reload: () => dispatch(creators.reload()),
      export: () => dispatch(creators.export(csvColumns, 'service-list')),
      search: () => dispatch(creators.search('')),
      setCustomFilters: filters => dispatch(creators.setCustomFilters(filters)),
      clear: () => dispatch(creators.setCustomFilters(EmptyCustomFilter)),
      create: () => dispatch(creators.create()),
      select: payload => dispatch(creators.setSelection(payload)),
      remove: payload => dispatch(creators.remove(payload)),
      setExpandedKeys: payload => dispatch(creators.setExpandedKeys(payload)),
    }),
    [],
  )
  const columns = React.useMemo(() => getColumns(props), [])
  const { customFilters, selection, namespaceList, expandedKeys } = selector(store)
  return (
    <BasicLayout title={'服务列表'} store={store} selectors={duck.selectors} header={<></>}>
      <Table.ActionPanel>
        <Justify
          left={
            <Form style={{ marginBottom: '20px' }} layout={'inline'}>
              <FormItem label={<Text theme={'strong'}>命名空间</Text>} className='justify-search'>
                <Select
                  value={customFilters.namespace}
                  options={namespaceList}
                  onChange={value =>
                    handlers.setCustomFilters({
                      ...customFilters,
                      namespace: value,
                    })
                  }
                  type='simulate'
                  appearance='button'
                  style={{ width: '200px', color: 'black' }}
                ></Select>
              </FormItem>
              <FormItem label={<Text theme={'strong'}>服务名</Text>} className='justify-search'>
                <InputAdornment
                  before={
                    <Select
                      options={SEARCH_METHOD_OPTIONS}
                      value={customFilters.searchMethod}
                      onChange={value =>
                        handlers.setCustomFilters({
                          ...customFilters,
                          searchMethod: value,
                        })
                      }
                      style={{ width: 'auto', marginRight: '0px' }}
                    />
                  }
                >
                  <Input
                    value={customFilters.serviceName}
                    onChange={value =>
                      handlers.setCustomFilters({
                        ...customFilters,
                        serviceName: value,
                      })
                    }
                    style={{ width: '128px' }}
                  ></Input>
                </InputAdornment>
              </FormItem>
              <FormItem label={<Text theme={'strong'}>部门</Text>} className='justify-search'>
                <Input
                  value={customFilters.department}
                  onChange={value =>
                    handlers.setCustomFilters({
                      ...customFilters,
                      department: value,
                    })
                  }
                ></Input>
              </FormItem>
              <FormItem label={<Text theme={'strong'}>业务</Text>} className='justify-search'>
                <InputAdornment
                  before={
                    <Select
                      options={SEARCH_METHOD_OPTIONS.filter(item => item.value === 'vague')}
                      value={'vague'}
                      style={{ width: 'auto', marginRight: '0px' }}
                    />
                  }
                >
                  <Input
                    value={customFilters.business}
                    onChange={value =>
                      handlers.setCustomFilters({
                        ...customFilters,
                        business: value,
                      })
                    }
                    style={{ width: '128px' }}
                  ></Input>
                </InputAdornment>
              </FormItem>
              <FormItem label={<Text theme={'strong'}>服务标签</Text>} className='justify-search'>
                <Input
                  value={customFilters.serviceTag}
                  onChange={value => {
                    handlers.setCustomFilters({
                      ...customFilters,
                      serviceTag: value,
                    })
                  }}
                  placeholder={'示例：Key:Value'}
                ></Input>
              </FormItem>
              <FormItem label={<Text theme={'strong'}>实例IP</Text>} className='justify-search'>
                <Input
                  value={customFilters.instanceIp}
                  onChange={value =>
                    handlers.setCustomFilters({
                      ...customFilters,
                      instanceIp: value,
                    })
                  }
                ></Input>
              </FormItem>
            </Form>
          }
        />
        <Justify
          left={
            <>
              <Button type={'primary'} className={'justify-button'} onClick={handlers.search}>
                查询
              </Button>
              <Button className={'justify-button'} onClick={handlers.clear}>
                重置
              </Button>
              <span
                style={{
                  margin: '0px 20px',
                }}
              ></span>
              <Button type={'primary'} onClick={handlers.create}>
                新建
              </Button>
              <Button onClick={() => handlers.remove(selection)} disabled={selection.length === 0}>
                删除
              </Button>

              {/* <Dropdown
                clickClose={false}
                style={{ marginRight: 10 }}
                button={<Button type="icon" icon="more" />}
                appearance="pure"
              >
                {(close) => (
                  <List type="option">
                    {selection?.length === 0 ? (
                      <List.Item
                        onClick={() => {
                          close();
                        }}
                        disabled={selection?.length === 0}
                        tooltip={selection?.length === 0 && "请选择实例"}
                      >
                        复制服务名
                      </List.Item>
                    ) : (
                      <Copy
                        text={selection
                          .map((id) => {
                            const item = list.find((item) => id === item.id);
                            return item?.name;
                          })
                          .join(";")}
                      >
                        <List.Item
                          onClick={() => {
                            close();
                          }}
                          disabled={selection?.length === 0}
                          tooltip={selection?.length === 0 && "请选择实例"}
                        >
                          复制服务名
                        </List.Item>
                      </Copy>
                    )}
                  </List>
                )}
              </Dropdown> */}
            </>
          }
          right={
            <>
              <Button type={'icon'} icon={'refresh'} onClick={handlers.reload}></Button>
            </>
          }
        />
      </Table.ActionPanel>
      <Card>
        <GridPageGrid
          duck={duck}
          dispatch={dispatch}
          store={store}
          columns={columns}
          addons={[
            selectable({
              all: true,
              value: selection,
              onChange: handlers.select,
              rowSelectable: (rowKey, { record }) => !isReadOnly(record.namespace) && record.editable,
            }),
            expandable({
              // 已经展开的产品
              expandedKeys,
              // 发生展开行为时，回调更新展开键值
              onExpandedKeysChange: keys => handlers.setExpandedKeys(keys),
              render: record => {
                const labelList = Object.keys(record.metadata || {})
                return (
                  <Form>
                    <FormItem label='服务标签'>
                      <FormText>
                        {labelList
                          .slice(0, 5)
                          .map(item => `${item}:${record.metadata[item]}`)
                          .join(' ; ') || '-'}
                        {labelList.length > 5 && '...'}
                        {labelList.length > 5 && (
                          <Button onClick={() => showAllLabels(record.metadata)} type='link'>
                            展示全部
                          </Button>
                        )}
                      </FormText>
                    </FormItem>
                    <FormItem label='描述'>
                      <FormText>{record.comment || '-'}</FormText>
                    </FormItem>
                    <FormItem label='就近访问'>
                      <FormText>{record.metadata?.[enableNearbyString] ? '开启' : '关闭'}</FormText>
                    </FormItem>
                  </Form>
                )
              },
            }),
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </BasicLayout>
  )
}
