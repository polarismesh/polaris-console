import { FormControl } from 'tea-component'
import React from 'react'
import { FieldAPI } from '../ducks/Form'
interface Props {
  field: FieldAPI<any>
  children: React.ReactNode
}
export default function (props: Props) {
  const { field, children } = props
  return (
    <FormControl
      status={field.getTouched() && field.getError() ? 'error' : null}
      showStatusIcon={false}
      style={{ display: 'inline' }}
      message={field.getTouched() && field.getError() ? field.getError() : null}
    >
      {children}
    </FormControl>
  )
}
