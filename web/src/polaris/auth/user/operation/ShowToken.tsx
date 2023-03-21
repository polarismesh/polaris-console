import React from 'react'
import { Form, FormItem, Button, FormText, Text } from 'tea-component'
import CopyableText from '@src/polaris/common/components/CopyableText'
import { useTranslation } from 'react-i18next'

export default function ShowToken(props: { token: string; name: string }) {
  const { t } = useTranslation()

  const { token, name } = props

  const [tokenVisible, setTokenVisible] = React.useState(false)

  return (
    <Form style={{ marginLeft: '20px' }}>
      <FormItem label={t('用户')}>
        <FormText>{name}</FormText>
      </FormItem>
      <FormItem
        label={
          <>
            Token{' '}
            <Button
              type={'icon'}
              icon={tokenVisible ? 'hide' : 'show'}
              onClick={() => setTokenVisible(!tokenVisible)}
              style={{ padding: '0px' }}
            />
          </>
        }
      >
        <Text reset>
          <CopyableText text={tokenVisible ? token : '*'.repeat(token?.length)} copyText={token} />
        </Text>
      </FormItem>
    </Form>
  )
}
