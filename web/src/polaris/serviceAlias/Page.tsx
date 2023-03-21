import { Trans, useTranslation } from 'react-i18next'
import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import ServiceAliasDuck from './PageDuck'
import getColumns from './getColumns'
import { Table, Card, Justify, Button, TagSearchBox } from 'tea-component'
import FieldManagerButton from '../common/duckComponents/FieldManager'
import GridPageGrid from '../common/duckComponents/GridPageGrid'
import { selectable, filterable } from 'tea-component/lib/table/addons'
import { replaceTags } from '../configuration/utils'
import GridPagePagination from '../common/duckComponents/GridPagePagination'
import { useFieldManager } from '../common/components/UseFieldManager'
import BasicLayout from '../common/components/BaseLayout'
import i18n from '../common/util/i18n'
const getHandlers = memorize(({ creators }: ServiceAliasDuck, dispatch) => ({
  reload: () => dispatch(creators.reload()),
  create: () => dispatch(creators.create()),
  edit: payload => dispatch(creators.edit(payload)),
  remove: payload => dispatch(creators.remove(payload)),
  setSelection: payload => dispatch(creators.setSelection(payload)),
  setExpandedKeys: payload => dispatch(creators.setExpandedKeys(payload)),
  changeTags: payload => dispatch(creators.changeTags(payload)),
}))
const alias_namespaceTagKey = 'alias_namespace'
function getTagAttributes(props: DuckCmpProps<ServiceAliasDuck>) {
  const { duck, store } = props
  const { namespaceList } = duck.selector(store)
  return [
    {
      type: 'single',
      key: alias_namespaceTagKey,
      name: i18n.t('命名空间'),
      values: namespaceList,
    },
    {
      type: 'input',
      key: 'service',
      name: i18n.t('指向服务'),
    },
  ]
}
export default function ServiceAliasPage(props: DuckCmpProps<ServiceAliasDuck>) {
  const { t } = useTranslation()

  const { duck, store, dispatch } = props
  const { selector } = duck
  const handlers = getHandlers(props)
  const { composedId } = selector(store)
  const columns = React.useMemo(() => getColumns(props), [composedId])
  const { selection, namespaceList, tags, customFilters } = selector(store)
  const { filterColumns, reload: reloadColumns, fullColumns, key } = useFieldManager(
    columns,
    'tse_service_alias_custom_columns',
  )
  return (
    <BasicLayout title={t('服务别名')} store={store} selectors={duck.selectors} header={<></>}>
      <Table.ActionPanel>
        <Card>
          <Card.Body title={t('服务别名')} style={{ marginBottom: '20px' }}>
            <Trans>服务别名可以看作是服务的映射，访问服务别名等同于访问服务，允许多个服务别名指向同一个服务</Trans>
          </Card.Body>
        </Card>
        <Justify
          left={
            <>
              <Button type='primary' onClick={handlers.create}>
                {t('新建别名')}
              </Button>
              <Button onClick={() => handlers.remove(selection)} disabled={selection?.length === 0}>
                {t('删除')}
              </Button>
            </>
          }
          right={
            <>
              <TagSearchBox
                attributes={getTagAttributes(props) as any}
                style={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  width: '400px',
                }}
                value={tags}
                onChange={value => handlers.changeTags(value)}
                tips={t('请选择条件进行过滤')}
                hideHelp={true}
              />
              <FieldManagerButton fields={fullColumns} onChange={reloadColumns} cacheKey={key}></FieldManagerButton>
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
          columns={filterColumns}
          addons={[
            selectable({
              all: true,
              value: selection,
              onChange: handlers.setSelection,
            }),
            filterable({
              type: 'single',
              column: 'alias_namespace',
              searchable: true,
              value: customFilters.alias_namespace,
              onChange: value => {
                const replacedTags = replaceTags(alias_namespaceTagKey, value, tags, namespaceList, {
                  type: 'single',
                  key: alias_namespaceTagKey,
                  name: t('命名空间'),
                  values: namespaceList,
                })
                handlers.changeTags(replacedTags)
              },
              all: {
                text: t('全部'),
                value: '',
              },
              // 选项列表
              options: namespaceList,
            }),
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </BasicLayout>
  )
}
