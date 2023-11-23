import * as React from 'react'
import { forwardRef } from 'react'
import classNames from 'classnames'
import { ControlledProps, TableAddon, TableProps } from 'tea-component'

/**
 * `radioable` 插件用于支持表格可单选行的样式及操作。
 */
export interface RadioableOptions<Record = any>
  extends ControlledProps<string, React.SyntheticEvent, { event: React.SyntheticEvent; record: Record }> {
  /**
   * 不支持非受控模式
   */
  defaultValue?: never
  /**
   * 选中样式
   */
  selectedClass?: string
}

let rowDisabled: TableProps['rowDisabled'] = null

export function highlightSelectable({ value, onChange, selectedClass = 'is-selected' }: RadioableOptions): TableAddon {
  return {
    getInfo: () => ({ name: 'highlightSelectable' }),
    onInjectProps: props => {
      rowDisabled = props.rowDisabled || (() => false)

      return props
    },
    onInjectRow: renderRow => (record, rowKey, recordIndex, columns) => {
      const { prepends, appends, row: preRow } = renderRow(record, rowKey, recordIndex, columns)
      let row = preRow
      // 支持整行选择
      row = (
        <SelectWrapper
          key={rowKey}
          name={rowKey}
          value={value}
          onChange={(value, context) => onChange(value, { ...context, record })}
          rowSelect={!rowDisabled(record)}
          selectedClass={selectedClass}
        >
          {row}
        </SelectWrapper>
      )
      return { prepends, row, appends }
    },
  }
}

const SelectWrapper = forwardRef(function SelectWrapper(
  {
    value,
    onChange,
    name,
    rowSelect,
    children,
    selectedClass,
    ...props
  }: {
    name: string
    rowSelect: boolean
    value: string
    onChange: (name: string, context: { event: React.SyntheticEvent }) => void
    children: React.ReactElement<React.HTMLAttributes<HTMLTableRowElement>>
    selectedClass: string
  } & Omit<React.HTMLAttributes<HTMLTableRowElement>, 'onChange'>,
  ref,
): JSX.Element {
  const rowSelectProps = {
    onClick: (event: React.MouseEvent<HTMLTableRowElement>) => {
      // 事件合并
      if (typeof props.onClick === 'function') {
        props.onClick(event)
      }
      if (typeof children.props.onClick === 'function') {
        children.props.onClick(event)
      }

      return onChange(name, { event })
    },
  }

  return React.cloneElement(children, {
    ...props,
    ref,
    className: classNames(props.className, children.props.className, {
      [selectedClass]: value === name,
    }),
    ...(rowSelect ? rowSelectProps : {}),
  })
})
