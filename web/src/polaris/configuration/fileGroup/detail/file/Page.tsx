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
  Modal,
  notification,
  Alert,
  Popover,
  Upload,
} from 'tea-component'
import { ConfigFileMode, ConfigFileModeMap, FileStatus, FileStatusMap, SaveFileEncodingMap } from './constants'
import { autotip, radioable, scrollable } from 'tea-component/lib/table/addons'
import FileDiff from './FileDiff'
import MonacoEditor from '@src/polaris/common/components/MocacoEditor'
import { Link } from 'react-router-dom'
import { FileFormat } from './operation/Create'
import router from '@src/polaris/common/util/router'
import { TAB } from '../Page'
import { ConfigFile } from '../../types'

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
  betaReleaseCurrentFile: () => dispatch(creators.betaReleaseCurrentFile()),
  stopBetaReleaseCurrentFile: () => dispatch(creators.stopBetaReleaseCurrentFile()),
  showReleaseHistory: v => dispatch(creators.showReleaseHistory(v)),
  select: v => dispatch(creators.select(v)),
  cancel: () => dispatch(creators.cancel()),
  getTemplate: v => dispatch(creators.getTemplate(v)),
  checkFileFormatValid: () => dispatch(creators.checkFileFormatValid()),
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
  .config-editor .tea-monaco-editor-container {
    padding-top: 50px;
  }
  .config-editor .tea-icon-fullscreenquit {
    top: 65px;
  }
  .file-tree-container {
    overflow-y: auto; 
    overflow-x: hidden;
    border: 1px solid #cfd5de;
    border-top:none;
    height:100%;
  }
`,
)

export function toHighlightLanguage(format?: string) {
  if (!format) {
    return FileFormat.TEXT
  }
  // monaco 对 .properties 格式需要将语言转为 ini
  // @see https://github.com/microsoft/monaco-editor/blob/main/src/basic-languages/ini/ini.contribution.ts
  if (format === FileFormat.PROPERTIES) {
    return 'ini'
  }
  if (format === 'yml') {
    return 'yaml'
  }
  return format
}

function fetchConfigFile(props: DuckCmpProps<Duck>) {
  const { duck, store } = props
  const { selectors } = duck
  const handlers = getHandlers(props)
  const composedId = selectors.composedId(store)
  const searchKeyword = selectors.searchKeyword(store)
  handlers.fetchData({
    namespace: composedId.namespace,
    group: composedId.group,
    name: searchKeyword || undefined,
  })
  handlers.cancel()
  notification.success({ description: '刷新成功' })
}

export default function Page(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props
  const { selectors, selector, ducks } = duck
  const handlers = getHandlers(props)
  const expandedIds = selectors.expandedIds(store)
  const currentNode = selectors.currentNode(store)
  const searchKeyword = selectors.searchKeyword(store)
  const editing = selectors.editing(store)
  const fileTree = selectors.fileTree(store)
  const { showHistoryMap, editContent, data, formatError } = selector(store)
  const currentHistoryDuck = ducks.configFileDynamicDuck.getDuck(currentNode?.name)

  function RefreshConfigButton(): JSX.Element {
    const [modalVisible, setModalVisible] = React.useState(false)
    const refreshFiles = () => {
      if (editing) {
        setModalVisible(true)
      } else {
        fetchConfigFile(props)
        closeModal()
      }
    }
    const closeModal = () => setModalVisible(false)
    return (
      <>
        <Button type={'weak'} onClick={refreshFiles}>
          刷新配置
        </Button>
        <Modal visible={modalVisible} caption={'提示'} onClose={closeModal}>
          <Modal.Body>注意，刷新会导致丢失当前编辑内容</Modal.Body>
          <Modal.Footer>
            <Button type={'primary'} onClick={() => fetchConfigFile(props)}>
              确定
            </Button>
            <Button type={'weak'} onClick={closeModal}>
              取消
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

  return (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              <Button type={'primary'} disabled={!data.editable} onClick={() => handlers.add()}>
                新增
              </Button>
              <RefreshConfigButton />
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
            <div style={{ width: '450px', height: 1002, overflowY: 'hidden', margin: '15px 20px' }}>
              <SearchBox
                value={searchKeyword}
                onChange={handlers.setSearchKeyword}
                placeholder={'请输入文件名搜索'}
                onSearch={handlers.searchPath}
                style={{ width: '100%' }}
              />
              <div className={'file-tree-container'}>
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
                  style={{ width: '450px', maxWidth: '450px' }}
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
                          to={`/configuration?namespace=${currentNode.namespace}&group=${currentNode.group}&fileName=${currentNode.name}&tab=release`}
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
                              <Bubble
                                placement={'right'}
                                content={
                                  currentNode.tags.length > 3
                                    ? currentNode.tags?.map(item => (
                                        <Text parent={'div'} key={item.key}>{`${item.key}:${item.value}`}</Text>
                                      ))
                                    : null
                                }
                              >
                                <FormText>
                                  <Text overflow style={{ width: '100%' }}>
                                    {currentNode.tags
                                      ?.slice(0, 3)
                                      ?.map(item => `${item.key}:${item.value}`)
                                      .join(',') || '-'}
                                    {currentNode.tags?.length > 3 ? '...' : ''}
                                  </Text>
                                </FormText>
                              </Bubble>
                            </FormItem>
                            <FormItem label='加密状态'>
                              <FormText>
                                <Text theme={currentNode.encrypted ? 'warning' : 'text'}>
                                  {currentNode.encrypted
                                    ? `已开启加密, 加密算法为: ${currentNode.encryptAlgo}`
                                    : '未加密'}
                                </Text>
                              </FormText>
                            </FormItem>

                            {currentNode.supported_client !== ConfigFileMode.Default && (
                              <>
                                <FormItem label={'文件保存编码'}>
                                  <FormText>{SaveFileEncodingMap[currentNode?.persistent?.encoding] || '-'}</FormText>
                                </FormItem>
                                <FormItem label={'后置脚本命令'}>
                                  <FormText>
                                    <div style={{ textOverflow: 'ellipsis', width: '150px', display: 'inline-block' }}>
                                      {currentNode?.persistent?.postCmd || '-'}
                                    </div>
                                    {currentNode?.persistent?.postCmd && (
                                      <Popover
                                        placement='top-start'
                                        overlay={
                                          <Card>
                                            <Card.Body>
                                              <pre>{currentNode?.persistent?.postCmd}</pre>
                                            </Card.Body>
                                          </Card>
                                        }
                                        trigger={'click'}
                                      >
                                        <Button type={'link'}>{'显示全部'}</Button>
                                      </Popover>
                                    )}
                                  </FormText>
                                </FormItem>
                              </>
                            )}
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
                            <FormItem label={'推送方式'}>
                              <FormText>{ConfigFileModeMap[currentNode.supported_client]}</FormText>
                            </FormItem>
                            {currentNode.supported_client !== ConfigFileMode.Default && (
                              <>
                                <FormItem label={'配置下发路径'}>
                                  <FormText>{currentNode?.persistent?.path || '-'}</FormText>
                                </FormItem>
                              </>
                            )}
                          </Col>
                        </Row>
                      </Form>
                      <Justify
                        style={{ marginBottom: '20px' }}
                        left={
                          <>
                            <Button
                              type={'primary'}
                              disabled={editing || !data.editable || isBetaingRelease(currentNode)}
                              onClick={() => handlers.releaseCurrentFile()}
                            >
                              发布
                            </Button>
                            {/* {isBetaingRelease(currentNode) ? (
                              <Button
                                type={'primary'}
                                disabled={editing || !data.editable}
                                onClick={() => handlers.stopBetaReleaseCurrentFile()}
                              >
                                停止灰度
                              </Button>
                            ) : (
                              <Button
                                type={'weak'}
                                disabled={editing || !data.editable}
                                onClick={() => handlers.betaReleaseCurrentFile()}
                              >
                                灰度发布
                              </Button>
                            )} */}
                            {editing ? (
                              <>
                                <Button type={'weak'} onClick={() => handlers.getTemplate(currentNode)}>
                                  应用模板
                                </Button>
                                <Button
                                  type={'weak'}
                                  onClick={() => handlers.save()}
                                  disabled={editContent === ''}
                                  tooltip={editContent === '' && '不能修改为空'}
                                >
                                  保存
                                </Button>
                              </>
                            ) : (
                              <Button
                                disabled={!data.editable || isBetaingRelease(currentNode)}
                                type={'weak'}
                                onClick={() => handlers.editCurrentNode()}
                              >
                                编辑
                              </Button>
                            )}
                            {editing && (
                              <Button type={'weak'} onClick={() => handlers.cancel()}>
                                取消
                              </Button>
                            )}
                            <Upload
                              maxSize={500 * 1024}
                              beforeUpload={(file, files, isAccepted) => {
                                if (isAccepted) {
                                  const readFileTask = new Promise<string>((resolve, reject) => {
                                    const reader = new FileReader()
                                    reader.readAsText(file, 'utf8')
                                    reader.onload = event => {
                                      resolve(event.target.result.toString())
                                    }
                                    reader.onerror = event => reject(`文件读取出错: ${event.target.error.toString()}`)
                                  })
                                  readFileTask
                                    .then(res => {
                                      handlers.editCurrentNode()
                                      handlers.setEditContent(res)
                                    })
                                    .catch(err => {
                                      notification.error({ description: err.toString() })
                                    })
                                  return false
                                } else {
                                  notification.error({
                                    description: `文件大小大于${500 * 1024}bytes，请重新上传`,
                                  })
                                }
                                // 文件不符合 accept，无法被选中
                                return false
                              }}
                            >
                              <Button>{'上传文件'}</Button>
                            </Upload>
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
                                  format={toHighlightLanguage(currentNode?.format)}
                                />
                              </section>
                            ) : (
                              <Text>请选择发布记录</Text>
                            )}
                          </Col>
                        </Row>
                      ) : (
                        <>
                          {formatError && (
                            <Alert type={'error'} style={{ marginBottom: '20px' }}>
                              <Text parent={'div'}>
                                {formatError.name}:{formatError.reason}
                              </Text>
                              <Text parent={'div'}>{formatError.message}</Text>
                            </Alert>
                          )}
                          <section
                            style={{ border: '1px solid #cfd5de', width: '100%', height: '750px' }}
                            className={'config-editor'}
                          >
                            <MonacoEditor
                              language={toHighlightLanguage(currentNode?.format)}
                              value={editing ? editContent : currentNode?.content}
                              options={{ readOnly: !editing }}
                              height={700}
                              width={'100%'}
                              onChange={v => {
                                handlers.setEditContent(v)
                                handlers.checkFileFormatValid()
                              }}
                            />
                          </section>
                        </>
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

export function isBetaingRelease(file: ConfigFile) {
  return file.status === FileStatus.Betaing
}

function getFileNameContext(fileName, status, file) {
  const splitArray = fileName.split('/')
  return (
    <div>
      <span className='configuration-tree-node-content'>
        {splitArray[splitArray.length - 1]}({file.id})
      </span>
      {FileStatus.Edited === status && <Badge theme='warning'>待发布</Badge>}
      {FileStatus.Betaing === status && <Badge theme='warning'>灰度发布中</Badge>}
      {FileStatus.Normal === status && <Badge theme='success'>已发布</Badge>}
      {file.isEncrypt && <Badge theme='warning'>已加密</Badge>}
    </div>
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
  const {
    hitPath,
    expandedIds,
    data: { editable, deleteable },
  } = selector(store)
  if (!(Object.keys(node).length > 0)) {
    return <noscript />
  }
  return (
    <>
      {Object.keys(node)?.map(childPath => {
        if (childPath === '__isDir__') return <noscript />
        const obj = node[childPath]
        const showContent = obj.__isDir__ ? childPath : getFileNameContext(obj.name, obj.status, obj)
        const nextPath = `${currPath}${currPath ? '/' : ''}${childPath}`
        const folderIcon = expandedIds.indexOf(obj.name) > -1 ? 'folderopen' : 'folderclose'
        const { namespace, group, name } = currentNode
        return (
          <TreeNode
            id={obj.__isDir__ ? nextPath : obj.name}
            icon={<Icon type={obj.__isDir__ ? folderIcon : 'daily'} />}
            className={!obj.__isDir__ ? 'configuration-tree-node no-switcher' : 'configuration-tree-node'}
            content={hitPath.indexOf(nextPath) > -1 ? <Text theme={'warning'}>{showContent}</Text> : showContent}
            operation={
              !obj.__isDir__ && (
                <div style={{ visibility: currentNode && currentNode?.key === obj.name ? 'visible' : null }}>
                  <span
                    onClick={e => {
                      e.stopPropagation()
                    }}
                  >
                    <Copy text={obj.id} />
                  </span>
                  <Dropdown appearence='pure' clickClose={true} button={<Button type='icon' icon='more' />}>
                    <List type='option'>
                      <List.Item
                        onClick={e => {
                          e.stopPropagation()
                          handlers.edit(obj.name)
                        }}
                        disabled={!editable}
                      >
                        编辑
                      </List.Item>
                      <List.Item
                        onClick={e => {
                          e.stopPropagation()
                          router.navigate(
                            `/filegroup-detail?namespace=${namespace}&group=${group}&fileName=${name}&tab=${TAB.Version}`,
                          )
                        }}
                      >
                        {'查看配置版本'}
                      </List.Item>
                      <List.Item
                        onClick={e => {
                          e.stopPropagation()
                          router.navigate(
                            `/filegroup-detail?namespace=${namespace}&group=${group}&fileName=${name}&tab=${TAB.History}`,
                          )
                        }}
                      >
                        {'查看发布历史'}
                      </List.Item>
                      <List.Item onClick={() => handlers.delete(obj.name)} disabled={deleteable === false}>
                        删除
                      </List.Item>
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
