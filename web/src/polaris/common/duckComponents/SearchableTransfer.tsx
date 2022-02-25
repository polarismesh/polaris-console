/**
 * 穿梭框/资源选择器
 *
 * 对应的逻辑Duck为 `ducks/SearchableMultiSelect`
 */
import * as React from 'react'
import { DuckCmpProps, purify, memorize } from 'saga-duck'
import Duck from '../ducks/SearchableMultiSelect'
import { TransferProps, Transfer, SearchBox, Table, StatusTipProps, StatusTip } from 'tea-component'
import { scrollable, selectable, removeable } from 'tea-component/lib/table/addons'

interface MyDuck<T> extends Duck {
  Item: T
}
interface Props<T = any> extends DuckCmpProps<MyDuck<T>>, Omit<TransferProps, 'leftCell' | 'rightCell'> {
  /** 左侧选择提示文案，例如：请选择Topic */
  title?: React.ReactChild
  /**
   * ID/Name列头，如果不指定，则不显示表头
   *
   * 另如果指定Left、Right组件，则此配置无效
   */
  idHeader?: React.ReactChild
  /** 判断选项是否被禁用
   *
   * 另如果指定Left、Right组件，则此配置无效
   */
  itemDisabled?(item: T): boolean
  /**
   * 选项如何被渲染，如果不指定，则直接展示id（duck.getId）
   *
   * 另如果指定Left、Right组件，则此配置无效
   */
  itemRenderer?(item: T): React.ReactChild
  /**
   * 选项展示什么tip
   * 另如果指定Left、Right组件，则此配置无效
   */
  itemTip?(item: T): React.ReactChild
  searchPlaceholder?: string
  Left?: React.ComponentType<LeftProps<T>>
  Right?: React.ComponentType<RightProps<T>>
}

interface LeftProps<T> {
  idHeader?: React.ReactChild
  statusTip?: React.ReactChild
}
interface RightProps<T> {
  idHeader?: React.ReactChild
}

const getHandlers = memorize(({ creators }: Duck, dispatch) => ({
  inputKeyword: keyword => dispatch(creators.inputKeyword(keyword)),
  search: keyword => dispatch(creators.search(keyword)),
  clearKeyword: () => dispatch(creators.search('')),
  select: selected => dispatch(creators.select(selected)),
  remove: selected => dispatch(creators.remove(selected)),
  more: () => dispatch(creators.more()),
  reload: () => dispatch(creators.reload()),
}))

function SearchableTransfer<T>(props: Props<T>) {
  const handlers = getHandlers(props)
  const {
    duck,
    store,
    dispatch,
    title: header = '请选择',
    idHeader,
    itemDisabled = o => false,
    itemRenderer = o => duck.getId(o),
    itemTip = o => undefined,
    searchPlaceholder = '输入关键字搜索',
    Left = DefaultLeft,
    Right = DefaultRight,
    ...rest
  } = props
  const { selector, selectors } = duck
  const {
    pendingKeyword,
    keyword,
    list,
    totalCount,
    selection,
    fetcher: { loading, error },
  } = selector(store)

  let statusTip: React.ReactChild = null
  if (loading) {
    statusTip = <CompactStatusTip status='loading' />
  } else if (error) {
    statusTip = <CompactStatusTip status='error' onRetry={handlers.reload} />
  } else if (keyword) {
    statusTip = (
      <CompactStatusTip
        status='found'
        foundText={list && list.length > 0 ? `找到${totalCount}条结果` : `搜索"${keyword}"暂无数据`}
        onClear={handlers.clearKeyword}
      />
    )
  } else if (list && list.length <= 0) {
    statusTip = <CompactStatusTip status='empty' />
  }

  return (
    <Transfer
      {...rest}
      leftCell={
        <Transfer.Cell
          title={header}
          scrollable={false}
          header={
            <SearchBox
              value={pendingKeyword}
              onChange={handlers.inputKeyword}
              onSearch={handlers.search}
              onClear={handlers.clearKeyword}
              placeholder={searchPlaceholder}
            />
          }
        >
          <Left
            duck={duck}
            store={store}
            dispatch={dispatch}
            statusTip={statusTip}
            itemDisabled={itemDisabled}
            itemRenderer={itemRenderer}
            idHeader={idHeader}
          />
        </Transfer.Cell>
      }
      rightCell={
        <Transfer.Cell title={`已选择 (${(selection && selection.length) || 0})`}>
          <Right duck={duck} store={store} dispatch={dispatch} itemRenderer={itemRenderer} idHeader={idHeader} />
        </Transfer.Cell>
      }
    />
  )
}

export default SearchableTransfer

const defaultIdHeader = 'ID'

interface DefaultLeftProps<T> extends LeftProps<T>, DuckCmpProps<Duck> {
  itemDisabled(item: T): boolean
  itemRenderer: (t: T) => React.ReactChild
}
function DefaultLeft<T>(props: DefaultLeftProps<T>) {
  const { duck, store, dispatch, statusTip, itemDisabled, itemRenderer, idHeader } = props
  const { selector, selectors, creators } = duck
  const { list, selection, loadingMore, nomore } = selector(store)
  const getId = duck.getId.bind(duck)
  return (
    <Table
      records={list || []}
      recordKey={getId}
      columns={[
        {
          header: idHeader || defaultIdHeader,
          key: 'id',
          render: t => itemRenderer(t),
        },
      ]}
      hideHeader={!idHeader}
      topTip={loadingMore ? null : statusTip}
      bottomTip={loadingMore ? statusTip : null}
      rowDisabled={itemDisabled}
      addons={[
        scrollable({
          maxHeight: 310,
          onScrollBottom: () => {
            if (nomore) {
              return
            }
            dispatch(creators.more())
          },
        }),
        selectable({
          value: selection.map(getId),
          onChange: ids => {
            // 选择的内容
            const idSet = new Set(ids)
            // TODO 这里如果执行了搜索，会把已有的给清空...要考虑下怎么避免
            // 想到一个方案是，只处理当前在列表内的数据，不在列表内的不修改
            // 当前列表的所有内容
            const listMap = new Map<string, T>()
            list.forEach(record => {
              listMap.set(getId(record), record)
            })
            // 当前已选的所有内容
            const selectedMap = new Map<string, T>()
            selection.forEach(record => {
              selectedMap.set(getId(record), record)
            })
            const newSelection = new Map<string, T>()
            // 不在列表中，或当前选中的，保留
            for (const [id, record] of selectedMap) {
              if (!listMap.has(id) || idSet.has(id)) {
                newSelection.set(id, record)
              }
            }
            // 在列表中，新增的，添加
            for (const id of idSet) {
              if (!newSelection.has(id)) {
                const item = listMap.get(id)
                if (!itemDisabled(item)) {
                  newSelection.set(id, item)
                }
              }
            }
            dispatch(creators.select([...newSelection.values()]))
          },
          rowSelect: true,
        }),
      ]}
    />
  )
}
interface DefaultRightProps<T> extends RightProps<T>, DuckCmpProps<Duck> {
  itemRenderer: (t: T) => React.ReactChild
}
function DefaultRight<T>(props: DefaultRightProps<T>) {
  const { duck, store, dispatch, itemRenderer, idHeader } = props
  const { selector, selectors, creators } = duck
  const { selection } = selector(store)
  const getId = duck.getId.bind(duck)
  return (
    <Table
      records={selection}
      recordKey={getId}
      columns={[
        {
          header: idHeader || defaultIdHeader,
          key: 'id',
          render: t => itemRenderer(t),
        },
      ]}
      hideHeader={!idHeader}
      addons={[
        removeable({
          onRemove: id => dispatch(creators.remove([selection.find(record => getId(record) === id)])),
        }),
      ]}
    />
  )
}

// 原始的StatusTip margin过大，展示在这里很难看
function CompactStatusTip(props: StatusTipProps) {
  const { style, ...rest } = props
  return (
    <StatusTip
      style={{
        margin: 0,
        ...style,
      }}
      {...rest}
    />
  )
}
