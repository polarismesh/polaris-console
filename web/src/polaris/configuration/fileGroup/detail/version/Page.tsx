import React from 'react'
import { DuckCmpProps, memorize } from 'saga-duck'
import ConfigFileGroupDuck from './PageDuck'
import getColumns from './getColumns'
import {
  Justify,
  Table,
  Button,
  Card,
  TagSearchBox,
  Col,
  Row,
  Form,
  FormItem,
  FormText,
  Badge,
  Text,
  Bubble,
} from 'tea-component'

import { isBetaingRelease, toHighlightLanguage } from '../file/Page'
import { highlightSelectable } from '@src/polaris/common/helpers/highlightSelectable'
import GridPageGrid from '@src/polaris/common/duckComponents/GridPageGrid'
import GridPagePagination from '@src/polaris/common/duckComponents/GridPagePagination'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import { scrollable } from 'tea-component/lib/table/addons'
import MonacoEditor from '@src/polaris/common/components/MocacoEditor'
import { ClientLabel, ClientLabelTextMap, ClientLabelType, ClientLabelMatchMap } from '../../types'

insertCSS(
  'service',
  `
.justify-search{
  margin-right:20px
}
.justify-button{
  vertical-align: bottom
}
.row-selected{
  backgroundColor: #F3F4F7;
}
`,
)
export const NamespaceTagKey = 'namespace'
export const GroupNameTagKey = 'group'
export const FileNameTagKey = 'fileName'
export const DefaultGroupTagAttribute = {
  type: 'input',
  key: GroupNameTagKey,
  name: '分组名',
}
function getTagAttributes() {
  return [
    {
      type: 'input',
      key: FileNameTagKey,
      name: '配置文件名',
    },
  ]
}
const getHandlers = memorize(({ creators }: ConfigFileGroupDuck, dispatch) => ({
  reload: () => dispatch(creators.reload()),
  changeTags: v => dispatch(creators.changeTags(v)),
  setCustomFilters: v => dispatch(creators.setCustomFilters(v)),
  setNamespace: v => dispatch(creators.setNamespace(v)),
  select: v => dispatch(creators.select(v)),
}))
export default function ServicePage(props: DuckCmpProps<ConfigFileGroupDuck>) {
  const { duck, store, dispatch } = props
  const { selector } = duck
  const columns = getColumns(props)
  const handlers = getHandlers(props)
  const { tags, selected, versionMap } = selector(store)
  const currentSelected = versionMap[selected?.name] || selected
  return (
    <>
      <Table.ActionPanel>
        <Justify
          right={
            <>
              <TagSearchBox
                attributes={getTagAttributes() as any}
                style={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  width: '400px',
                }}
                value={tags}
                onChange={value => handlers.changeTags(value)}
                tips={'请选择条件进行过滤'}
                hideHelp={true}
              />
              <Button type={'icon'} icon={'refresh'} onClick={handlers.reload}></Button>
            </>
          }
        />
      </Table.ActionPanel>
      <Row style={{ height: '700px' }}>
        <Col span={12} style={{ paddingBottom: '10px' }}>
          <Card bordered style={{ height: '100%' }}>
            <GridPageGrid
              duck={duck}
              dispatch={dispatch}
              store={store}
              addons={[
                scrollable({ maxHeight: '700px' }),
                highlightSelectable({
                  value: `${currentSelected?.fileName}-${currentSelected?.name}`,
                  onChange: (value, { record }) => {
                    handlers.select(record)
                  },
                }),
              ]}
              columns={columns}
            />
          </Card>
          <GridPagePagination duck={duck} dispatch={dispatch} store={store} style={{ marginTop: '15px' }} />
        </Col>
        <Col span={12}>
          <Card bordered style={{ height: '100%' }}>
            <Card.Body
              title={
                currentSelected ? (
                  <>
                    {currentSelected.fileName}
                    <Badge dark style={{ verticalAlign: 'bottom', marginLeft: '10px' }}>
                      {currentSelected.name}
                    </Badge>
                  </>
                ) : (
                  '请选择配置文件'
                )
              }
            >
              {currentSelected && (
                <>
                  <Row>
                    <Col span={12}>
                      <Form>
                        <FormItem label={'格式'}>
                          <FormText>{currentSelected.format || '-'}</FormText>
                        </FormItem>
                        <FormItem label={'备注'}>
                          <FormText>{currentSelected.releaseDescription || '-'}</FormText>
                        </FormItem>
                      </Form>
                    </Col>
                    <Col span={12}>
                      <Form>
                        <FormItem label={'发布人'}>
                          <FormText>{currentSelected.modifyBy}</FormText>
                        </FormItem>
                        <FormItem label={'发布时间'}>
                          <FormText>{currentSelected.modifyTime}</FormText>
                        </FormItem>
                      </Form>
                    </Col>
                  </Row>
                  {true && (
                    <Form style={{ marginTop: '15px' }}>
                      <FormItem label='标签'>
                        <Bubble
                          placement={'right'}
                          content={
                            currentSelected.tags.length > 3
                              ? currentSelected.tags?.map(item => (
                                <Text parent={'div'} key={item.key}>{`${item.key}:${item.value}`}</Text>
                              ))
                              : null
                          }
                        >
                          <FormText>
                            <Text overflow style={{ width: '100%' }}>
                              {currentSelected.tags
                                ?.slice(0, 3)
                                ?.map(item => `${item.key}:${item.value}`)
                                .join(',') || '-'}
                              {currentSelected.tags?.length > 3 ? '...' : ''}
                            </Text>
                          </FormText>
                        </Bubble>
                      </FormItem>
                    </Form>
                  )}
                  {
                    (currentSelected.releaseType === 'gray' ? <>
                      <Form style={{ marginTop: '15px' }}>
                        <FormItem label={'灰度标签'}>
                          <FormText>{formatBetaLabels(currentSelected.betaLabels)}</FormText>
                        </FormItem>
                      </Form>
                    </> : <></>)
                  }
                  <section style={{ border: '1px solid #cfd5de', width: '100%', marginTop: '15px' }}>
                    <MonacoEditor
                      language={toHighlightLanguage(currentSelected?.format)}
                      value={currentSelected?.content}
                      options={{ readOnly: true }}
                      height={500}
                    />
                  </section>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

function formatBetaLabels(labels: ClientLabel[]) {
  return labels.map(item => {
    return `${item.key} ${ClientLabelMatchMap[item.value.type]} ${item.value.value}`
  }).join(';')
}

