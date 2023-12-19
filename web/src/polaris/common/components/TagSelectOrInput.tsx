import { Input, InputProps, TagSelect, TagSelectProps } from 'tea-component'
import React from 'react'
import { FieldAPI } from '../ducks/Form'
interface Props {
  field: FieldAPI<any>
  inputProps: Omit<InputProps, 'onChange' | 'value'>
  tagSelectProps: Omit<TagSelectProps, 'onChange' | 'value'>
  useTagSelect: boolean
}
export const checkNeedTagInput = v => {
  return v === 'IN' || v === 'NOT_IN'
}
export default function(props: Props) {
  const { field, useTagSelect, inputProps, tagSelectProps } = props
  return (
    <>
      {useTagSelect ? (
        <TagSelect
          {...tagSelectProps}
          value={field
            ?.getValue()
            ?.split(',')
            ?.filter(item => item)}
          onChange={tags => {
            field.setValue(tags.join(','))
          }}
        />
      ) : (
        <Input {...inputProps} value={field.getValue()} onChange={v => field.setValue(v)} />
      )}
    </>
  )
}
