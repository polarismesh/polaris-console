import { useState, useEffect } from 'react'
import { Column } from '../ducks/GridPage'
import { ColumnField } from '../duckComponents/FieldManager'

export function useFieldManager<T>(columns: Column<T>[], key: string) {
  const [filterColumns, setFilterColumns] = useState(columns)
  const [flag, setFlag] = useState(Symbol())
  const list = localStorage.getItem(key)?.split(',')
  const set = new Set(list)
  useEffect(() => {
    if (!list) {
      setFilterColumns(columns)
      return
    }
    setFilterColumns(columns.filter(x => set.has(x.key)))
  }, [columns, flag])
  return {
    key,
    filterColumns,
    fullColumns: columns.map(item => ({ ...item, id: item.key, headTitle: item.header })) as ColumnField[],
    reload: () => {
      setFlag(Symbol())
    },
  }
}
