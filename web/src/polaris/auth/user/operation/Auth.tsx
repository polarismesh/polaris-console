import * as React from 'react'
import { purify, DuckCmpProps } from 'saga-duck'
import Duck from './AuthDuck'
import { Form, Text, FormItem, FormText } from 'tea-component'
import { AuthStrategy } from '../../model'
import { AUTH_SUBJECT_TYPE_MAP } from '../../policy/Page'
import Dialog from '@src/polaris/common/duckComponents/Dialog'
import SearchableTransfer from '@src/polaris/common/duckComponents/SearchableTransfer'

export default purify(function(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { ducks, selectors } = duck
  const options = selectors.options(store)
  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      title={'授权'}
      size={'l'}
      defaultSubmitText={'授权'}
      defaultCancelText={'取消'}
    >
      <Form>
        <FormItem label={AUTH_SUBJECT_TYPE_MAP[options?.authSubjectType]?.text}>
          <FormText>
            {options?.name || '-'}({options?.id || '-'})
          </FormText>
        </FormItem>
        <FormItem label={'授权策略'}>
          <SearchableTransfer
            title={'请选择策略'}
            duck={ducks.policy}
            store={store}
            dispatch={dispatch}
            itemRenderer={(record: AuthStrategy) => <Text overflow>{record.name}</Text>}
          />
        </FormItem>
      </Form>
    </Dialog>
  )
})
