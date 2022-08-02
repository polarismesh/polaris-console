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
  Icon,
  Bubble,
  Badge,
} from 'tea-component'
import { FileStatus, FileStatusMap } from './constants'
import { autotip, radioable, scrollable } from 'tea-component/lib/table/addons'
import FileDiff from './FileDiff'
import MonacoEditor from '@src/polaris/common/components/MocacoEditor'
import { Link } from 'react-router-dom'

export const NoSearchResultKey = '__NO_SEARCH_RESULT__'
const getHandlers = memorize(({ creators }: Duck, dispatch) => ({
  add: () => dispatch(creators.add()),
  editCurrentNode: () => dispatch(creators.editCurrentNode()),
  edit: v => dispatch(creators.edit(v)),
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
  select: v => dispatch(creators.select(v)),
  cancel: () => dispatch(creators.cancel()),
}))

insertCSS(
  'tse_zk_tree',
  `
  .configuration-tree-node .tea-form-check{
    width:auto;
  }
  .configuration-tree-node .tea-tree__label-title{
    width:100%;
  }
  .configuration-tree-node-content {
    display: inline-block;
    line-height: 20px;
    margin-right: 5px;
    overflow: hidden;
  }
  .configuration-tree-node .tea-tree__label {
    align-items: center;
  }

  .no-switcher .tea-tree__switcher{
    display:none;
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
            <>
              <Button type={'primary'} onClick={() => handlers.add()}>
                新增
              </Button>
              {/* <Button type={'weak'} onClick={() => handlers.delete(selection)}>
                删除
              </Button> */}
            </>
          }
        />
      </Table.ActionPanel>
      <Card>
        <Card.Body>
          <Row showSplitLine gap={40}>
            <div style={{ width: '450px', height: 1000, overflowY: 'hidden', margin: '15px 20px' }}>
              <SearchBox
                value={searchKeyword}
                onChange={handlers.setSearchKeyword}
                placeholder={'请输入文件名搜索'}
                onSearch={handlers.searchPath}
                style={{ width: '420px' }}
              />
              <Tree
                activable
                onActive={(activeIds, { nodeId }) => {
                  // if (!fileMap[nodeId]) {
                  //   const index = expandedIds.findIndex(item => item === nodeId)
                  //   if (index === -1) {
                  //     expandedIds.push(nodeId)
                  //     handlers.setExpandedIds([...expandedIds])
                  //   } else {
                  //     const newArray = [...expandedIds]
                  //     newArray.splice(index, 1)
                  //     handlers.setExpandedIds(newArray)
                  //   }
                  // } else {
                  //   handlers.clickFileItem(nodeId)
                  // }
                  handlers.clickFileItem(nodeId)
                }}
                activeIds={currentNode ? [currentNode?.name] : []}
                expandedIds={expandedIds}
                onExpand={expandedIds => {
                  handlers.setExpandedIds(expandedIds)
                }}
                fullExpandable
                height={900}
                style={{ width: '500px' }}
                // onSelect={v => {
                //   handlers.select(v)
                // }}
                // selectable
                // selectedIds={selection}
                // selectValueMode={'onlyLeaf'}
              >
                {renderTree(props, fileTree, '', '')}
              </Tree>
            </div>
            <div style={{ width: 'calc(100% - 540px)', margin: '15px 20px' }}>
              {currentNode?.name &&
                (currentNode?.name !== NoSearchResultKey ? (
                  <>
                    <Card.Body
                      title={
                        <section style={{ width: '500px' }}>
                          <Copy text={`${currentNode?.name}`}>{`${currentNode?.name}`}</Copy>
                        </section>
                      }
                      operation={
                        <Link
                          to={`/file-release-history?namespace=${currentNode.namespace}&group=${currentNode.group}&fileName=${currentNode.name}`}
                          target={'_blank'}
                        >
                          <Text reset>查看发布历史</Text>
                        </Link>
                        // <Button type={'link'} onClick={() => {}}>
                        //   {showHistoryMap[currentNode?.name] ? '查看当前文件' : '查看发布历史'}
                        // </Button>
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
                            <FormItem label='标签'>
                              <FormText>
                                <Bubble
                                  placement={'right'}
                                  content={
                                    <>
                                      {currentNode.tags?.map(item => (
                                        <Text parent={'div'} key={item.key}>{`${item.key}:${item.value}`}</Text>
                                      ))}
                                    </>
                                  }
                                >
                                  <Text overflow>
                                    {currentNode.tags.map(item => `${item.key}:${item.value}`).join(',') || '-'}
                                  </Text>
                                </Bubble>
                              </FormText>
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem label='最后修改人'>
                              <FormText>{currentNode.modifyBy || '-'}</FormText>
                            </FormItem>
                            <FormItem label='最后发布人'>
                              <FormText>{currentNode.releaseBy || '-'}</FormText>
                            </FormItem>
                            <FormItem label='备注'>
                              <FormText>{currentNode.comment || '-'}</FormText>
                            </FormItem>
                            <FormItem label='格式'>
                              <FormText>{currentNode.format || '-'}</FormText>
                            </FormItem>
                          </Col>
                        </Row>
                      </Form>
                      <Justify
                        style={{ marginBottom: '20px' }}
                        left={
                          <>
                            <Button type={'primary'} disabled={editing} onClick={() => handlers.releaseCurrentFile()}>
                              发布
                            </Button>
                            {editing ? (
                              <Button type={'weak'} onClick={() => handlers.save()}>
                                保存
                              </Button>
                            ) : (
                              <Button type={'weak'} onClick={() => handlers.editCurrentNode()}>
                                编辑
                              </Button>
                            )}
                            {editing && (
                              <Button type={'weak'} onClick={() => handlers.cancel()}>
                                取消
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
                              recordKey={'id'}
                              records={currentHistoryDuck.selector(store).data || []}
                              columns={[
                                { key: 'id', header: '版本' },
                                { key: 'modifyTime', header: '发布时间' },
                              ]}
                              addons={[
                                scrollable({ maxHeight: '350px' }),
                                autotip({ isLoading: currentHistoryDuck.selector(store).loading }),
                                radioable({
                                  rowSelect: true,
                                  render: () => <noscript />,
                                  value: currentHistoryDuck.selector(store)?.selected?.id,
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
                            height={700}
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
            </div>
          </Row>
        </Card.Body>
      </Card>
    </>
  )
}

function getFileNameContext(fileName, status) {
  const splitArray = fileName.split('/')
  return (
    <>
      <span className='configuration-tree-node-content'>{splitArray[splitArray.length - 1]}</span>
      {FileStatus.Edited === status && <Badge theme='warning'>待发布</Badge>}
    </>
  )
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
  const { hitPath, expandedIds } = selector(store)
  if (!(Object.keys(node).length > 0)) {
    return <noscript />
  }
  return (
    <>
      {Object.keys(node)?.map(childPath => {
        if (childPath === '__isDir__') return <noscript />
        const obj = node[childPath]
        const showContent = obj.__isDir__ ? childPath : getFileNameContext(obj.name, obj.status)
        const nextPath = `${currPath}${currPath ? '/' : ''}${childPath}`
        const folderIcon = expandedIds.indexOf(obj.name) > -1 ? 'folderopen' : 'folderclose'
        return (
          <TreeNode
            id={obj.__isDir__ ? nextPath : obj.name}
            icon={<Icon type={obj.__isDir__ ? folderIcon : 'daily'} />}
            className={!obj.__isDir__ ? 'configuration-tree-node no-switcher' : 'configuration-tree-node'}
            content={hitPath.indexOf(nextPath) > -1 ? <Text theme={'warning'}>{showContent}</Text> : showContent}
            operation={
              !obj.__isDir__ && (
                <div style={{ visibility: currentNode && currentNode?.key === obj.name ? 'visible' : null }}>
                  <Dropdown appearence='pure' clickClose={true} button={<Button type='icon' icon='more' />}>
                    <List type='option'>
                      <List.Item
                        onClick={e => {
                          e.stopPropagation()
                          handlers.edit(obj.name)
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
            // selectable={!obj.__isDir__}
            key={obj.__isDir__ ? nextPath : obj.name}
          >
            {obj.__isDir__ ? renderTree(props, obj, childPath, nextPath) : null}
          </TreeNode>
        )
      })}
    </>
  )
}
