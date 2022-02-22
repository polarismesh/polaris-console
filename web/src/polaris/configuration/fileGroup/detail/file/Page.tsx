import * as React from 'react'
import { memorize, DuckCmpProps } from 'saga-duck'
import Duck from './PageDuck'
import insertCSS from '@src/polaris/common/helpers/insertCSS'
import {
  Justify,
  Button,
  Card,
  Row,
  Col,
  SearchBox,
  Tree,
  TreeNode,
  Form,
  H3,
  Table,
  Copy,
  FormItem,
  FormText,
  Text,
  Dropdown,
  List,
} from 'tea-component'
import { FileStatusMap } from './constants'
import { autotip, radioable } from 'tea-component/lib/table/addons'
import FileDiff from './FileDiff'
import MonacoEditor from '@src/polaris/common/components/MocacoEditor'

export const NoSearchResultKey = '__NO_SEARCH_RESULT__'
const getHandlers = memorize(({ creators }: Duck, dispatch) => ({
  add: () => dispatch(creators.add()),
  edit: () => dispatch(creators.editCurrentNode()),
  clickFileItem: path => dispatch(creators.clickFileItem(path)),
  setExpandedIds: expandedIds => dispatch(creators.setExpandedIds(expandedIds)),
  delete: path => dispatch(creators.delete(path)),
  save: () => dispatch(creators.save()),
  searchPath: path => dispatch(creators.searchPath(path)),
  setSearchKeyword: k => dispatch(creators.setSearchKeyword(k)),
  fetchData: path => dispatch(creators.fetchData(path)),
  setEditContent: v => dispatch(creators.setEditContent(v)),
  releaseCurrentFile: () => dispatch(creators.releaseCurrentFile()),
  showReleaseHistory: v => dispatch(creators.showReleaseHistory(v)),
}))

insertCSS(
  'tse_zk_tree',
  `.tse_zk_tree .app-tse-tree__node-content:hover{
  background-color: #f9fafb !important;
}
.tse_zk_tree .app-tse-tree__label:hover{
  background-color: #f9fafb; 
}
.tse_zk_tree .app-tse-tree__action{
  background: none; 
}
.tse_zk_tree .is-selected>.app-tse-tree__node-content:hover{
  background-color: #ebeef2 !important;
}
`,
)

export default function Page(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selectors, selector, ducks } = duck
  const handlers = getHandlers(props)
  const expandedIds = selectors.expandedIds(store)
  const currentNode = selectors.currentNode(store)
  const searchKeyword = selectors.searchKeyword(store)
  const editing = selectors.editing(store)
  const fileTree = selectors.fileTree(store)
  const { showHistoryMap, editContent } = selector(store)
  const currentHistoryDuck = ducks.configFileDynamicDuck.getDuck(currentNode?.name)

  return (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <Button type={'primary'} onClick={() => handlers.add()}>
              新增
            </Button>
          }
        />
      </Table.ActionPanel>
      <Card>
        <Card.Body style={{ height: 660 }}>
          <Row showSplitLine gap={40}>
            <Col span={8}>
              <SearchBox
                value={searchKeyword}
                onChange={handlers.setSearchKeyword}
                placeholder={'请输入文件名搜索'}
                onSearch={handlers.searchPath}
              />
              <div style={{ height: 600, overflowY: 'hidden' }}>
                <Tree
                  activeIds={currentNode ? [currentNode?.name] : []}
                  className='tse_zk_tree'
                  activable
                  onActive={paths => {
                    handlers.clickFileItem(paths[0])
                  }}
                  expandedIds={expandedIds}
                  onExpand={expandedIds => {
                    handlers.setExpandedIds(expandedIds)
                  }}
                  fullExpandable
                  height={600}
                  style={{ width: '500px' }}
                >
                  {renderTree(props, fileTree, '', '')}
                </Tree>
              </div>
            </Col>
            <Col span={16}>
              {currentNode?.name &&
                (currentNode?.name !== NoSearchResultKey ? (
                  <>
                    <Card.Body
                      title={
                        <section style={{ width: '500px' }}>
                          <Copy
                            text={`${currentNode?.name}.${currentNode?.format}`}
                          >{`${currentNode?.name}.${currentNode?.format}`}</Copy>
                        </section>
                      }
                      operation={
                        <Button type={'link'} onClick={() => handlers.showReleaseHistory(currentNode)}>
                          {showHistoryMap[currentNode?.name] ? '查看当前文件' : '查看发布历史'}
                        </Button>
                      }
                      style={{ padding: 0 }}
                    >
                      <Form style={{ width: '100%' }}>
                        <Row>
                          <Col span={12}>
                            <FormItem label='状态'>
                              <FormText>
                                <Text theme={FileStatusMap[currentNode.status]?.theme}>
                                  {FileStatusMap[currentNode.status]?.text}
                                </Text>
                              </FormText>
                            </FormItem>
                            <FormItem label='最后修改时间'>
                              <FormText>{currentNode.modifyTime || '-'}</FormText>
                            </FormItem>
                            <FormItem label='最后发布时间'>
                              <FormText>{currentNode.releaseTime || '-'}</FormText>
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem label='最后修改人'>
                              <FormText>{currentNode.modifyBy || '-'}</FormText>
                            </FormItem>
                            <FormItem label='最后发布人'>
                              <FormText>{currentNode.releaseBy || '-'}</FormText>
                            </FormItem>
                          </Col>
                        </Row>
                      </Form>
                      <Justify
                        style={{ marginBottom: '20px' }}
                        left={
                          <>
                            <Button type={'primary'} onClick={() => handlers.releaseCurrentFile()}>
                              发布
                            </Button>
                            {editing ? (
                              <Button type={'weak'} onClick={() => handlers.save()}>
                                保存
                              </Button>
                            ) : (
                              <Button type={'weak'} onClick={() => handlers.edit()}>
                                编辑
                              </Button>
                            )}
                          </>
                        }
                      />

                      {showHistoryMap[currentNode?.name] && currentHistoryDuck ? (
                        <Row>
                          <Col span={6}>
                            <Table
                              bordered
                              records={currentHistoryDuck.selector(store).data}
                              columns={[
                                { key: 'id', header: '版本' },
                                { key: 'modifyTime', header: '发布时间' },
                              ]}
                              addons={[
                                autotip({ isLoading: currentHistoryDuck.selector(store).loading }),
                                radioable({
                                  rowSelect: true,
                                  render: () => <noscript />,
                                  value: currentHistoryDuck.selector(store)?.selected?.version,
                                  onChange: (v, { record }) => dispatch(currentHistoryDuck.creators.select(record)),
                                }),
                              ]}
                              style={{ height: '400px', borderBottom: '1px solid #cfd5de' }}
                            ></Table>
                          </Col>
                          <Col span={18}>
                            {currentHistoryDuck.selector(store).selected?.name ? (
                              <section style={{ border: '1px solid #cfd5de', width: '100%' }}>
                                <FileDiff
                                  original={currentHistoryDuck.selector(store).selected?.content}
                                  now={currentNode?.content}
                                  format={currentNode?.format}
                                />
                              </section>
                            ) : (
                              <Text>请选择发布记录</Text>
                            )}
                          </Col>
                        </Row>
                      ) : (
                        <section style={{ border: '1px solid #cfd5de', width: '100%' }}>
                          <MonacoEditor
                            language={currentNode?.format}
                            value={editing ? editContent : currentNode?.content}
                            options={{ readOnly: !editing }}
                            height={400}
                            width={'100%'}
                            onChange={v => {
                              handlers.setEditContent(v)
                            }}
                          />
                        </section>
                      )}
                    </Card.Body>
                  </>
                ) : (
                  <>
                    <H3>未搜索到对应文件</H3>
                  </>
                ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  )
}

function getFileName(fileName) {
  const splitArray = fileName.split('.')
  return splitArray[splitArray.length - 1]
}

function renderTree(props, folder, path: string, currPath: string) {
  const { duck, store } = props
  const { selectors, selector } = duck
  const handlers = getHandlers(props)
  const fileTree = selectors.fileTree(store)
  let node
  if (!path) {
    node = fileTree
  } else {
    node = folder
  }
  const currentNode = selectors.currentNode(store)
  const { hitPath } = selector(store)
  if (!(Object.keys(node).length > 0)) {
    return <noscript />
  }
  return (
    <>
      {Object.keys(node)?.map(childPath => {
        if (childPath === '__isDir__') return <noscript />
        const obj = node[childPath]
        const showContent = obj.__isDir__ ? childPath : getFileName(obj.name)
        const nextPath = `${currPath}${currPath ? '.' : ''}${childPath}`
        return (
          <TreeNode
            id={obj.__isDir__ ? nextPath : obj.name}
            content={hitPath.indexOf(nextPath) > -1 ? <Text theme={'warning'}>{showContent}</Text> : showContent}
            operation={
              !obj.__isDir__ && (
                <div style={{ visibility: currentNode && currentNode?.key === obj.name ? 'visible' : null }}>
                  <Dropdown appearence='pure' clickClose={false} button={<Button type='icon' icon='more' />}>
                    <List type='option'>
                      <List.Item
                        onClick={() => {
                          handlers.clickFileItem(obj.name)
                          handlers.edit()
                        }}
                      >
                        编辑
                      </List.Item>
                      <List.Item onClick={() => handlers.delete(obj.name)}>删除</List.Item>
                    </List>
                  </Dropdown>
                </div>
              )
            }
            key={obj.__isDir__ ? nextPath : obj.name}
          >
            {obj.__isDir__ ? renderTree(props, obj, childPath, nextPath) : null}
          </TreeNode>
        )
      })}
    </>
  )
}
