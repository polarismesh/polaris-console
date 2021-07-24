import BasicLayout from "@src/polaris/common/components/BaseLayout";
import React from "react";
import { DuckCmpProps } from "saga-duck";
import ServicePageDuck, { EmptyCustomFilter } from "./PageDuck";
import {
  Button,
  Card,
  Justify,
  Table,
  Text,
  Select,
  Input,
  Dropdown,
  InputAdornment,
  List,
  FormItem,
  Form,
  FormText,
  InputNumber,
  Copy,
  Bubble,
} from "tea-component";
import GridPageGrid from "@src/polaris/common/duckComponents/GridPageGrid";
import GridPagePagination from "@src/polaris/common/duckComponents/GridPagePagination";
import getColumns from "./getColumns";
import {
  filterable,
  selectable,
  expandable,
} from "tea-component/lib/table/addons";
import insertCSS from "@src/polaris/common/helpers/insertCSS";
import csvColumns from "./csvColumns";
import {
  HEALTH_STATUS,
  HEALTH_STATUS_MAP,
  ISOLATE_STATUS_MAP,
  ISOLATE_STATUS,
  HEALTH_CHECK_METHOD_MAP,
} from "./types";
import { isReadOnly } from "../../utils";

insertCSS(
  "service-detail-instance",
  `
.justify-search{
  margin-right:20px;
  margin-top:20px;
}
.justify-button{
  vertical-align: bottom;
}

`
);
insertCSS(
  "service-detail-input",
  `
  .input-style > .tea-input{
    width:150px;
  }
  .input-style {
    width:150px;
  }
`
);

const HealthStatusOptions = [
  {
    text: HEALTH_STATUS_MAP[HEALTH_STATUS.HEALTH].text,
    value: String(HEALTH_STATUS.HEALTH),
  },
  {
    text: HEALTH_STATUS_MAP[HEALTH_STATUS.ABNORMAL].text,
    value: String(HEALTH_STATUS.ABNORMAL),
  },
];

const IsolateStatusOptions = [
  {
    text: ISOLATE_STATUS_MAP[ISOLATE_STATUS.ISOLATE].text,
    value: String(ISOLATE_STATUS.ISOLATE),
  },
  {
    text: ISOLATE_STATUS_MAP[ISOLATE_STATUS.UNISOLATED].text,
    value: String(ISOLATE_STATUS.UNISOLATED),
  },
];

export default function ServiceInstancePage(
  props: DuckCmpProps<ServicePageDuck>
) {
  const { duck, store, dispatch } = props;
  const { creators, selectors, selector } = duck;
  const handlers = React.useMemo(
    () => ({
      reload: () => dispatch(creators.reload()),
      export: () => dispatch(creators.export(csvColumns, "service-list")),
      search: () => dispatch(creators.search("")),
      setCustomFilters: (filters) =>
        dispatch(creators.setCustomFilters(filters)),
      clear: () => dispatch(creators.setCustomFilters(EmptyCustomFilter)),
      create: () => dispatch(creators.create()),
      select: (payload) => dispatch(creators.setSelection(payload)),
      remove: (payload) => dispatch(creators.remove(payload)),
      setExpandedKeys: (payload) => dispatch(creators.setExpandedKeys(payload)),
      modifyWeight: (payload) => dispatch(creators.modifyWeight(payload)),
      modifyHealthStatus: (payload) =>
        dispatch(creators.modifyHealthStatus(payload)),
      modifyIsolateStatus: (payload) =>
        dispatch(creators.modifyIsolateStatus(payload)),
    }),
    []
  );
  const columns = React.useMemo(() => getColumns(props), []);
  const {
    customFilters,
    selection,
    expandedKeys,
    grid: { list },
    data: { namespace },
  } = selector(store);

  return (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              <section style={{ marginBottom: "20px" }}>
                <Text reset className="justify-search">
                  实例IP&nbsp;
                  <Input
                    value={customFilters.host}
                    onChange={(value) =>
                      handlers.setCustomFilters({
                        ...customFilters,
                        host: value,
                      })
                    }
                    className="input-style"
                  ></Input>
                </Text>
                <Text reset className="justify-search">
                  端口&nbsp;
                  <InputNumber
                    hideButton
                    value={customFilters.port}
                    onChange={(value) =>
                      handlers.setCustomFilters({
                        ...customFilters,
                        port: value,
                      })
                    }
                    className={"input-style"}
                  ></InputNumber>
                </Text>
                <Text reset className="justify-search">
                  协议&nbsp;
                  <Input
                    value={customFilters.protocol}
                    onChange={(value) =>
                      handlers.setCustomFilters({
                        ...customFilters,
                        protocol: value,
                      })
                    }
                    className={"input-style"}
                  ></Input>
                </Text>
                <Text reset className="justify-search">
                  版本&nbsp;
                  <Input
                    value={customFilters.version}
                    onChange={(value) =>
                      handlers.setCustomFilters({
                        ...customFilters,
                        version: value,
                      })
                    }
                    className={"input-style"}
                  ></Input>
                </Text>

                <Text reset className="justify-search">
                  健康状态&nbsp;
                  <Select
                    value={String(customFilters.healthy)}
                    options={HealthStatusOptions}
                    onChange={(value) =>
                      handlers.setCustomFilters({
                        ...customFilters,
                        healthy: value === "true" ? true : false,
                      })
                    }
                    type="simulate"
                    appearance="button"
                    className={"input-style"}
                  ></Select>
                </Text>
                <Text reset className="justify-search">
                  隔离状态&nbsp;
                  <Select
                    value={String(customFilters.isolate)}
                    options={IsolateStatusOptions}
                    onChange={(value) =>
                      handlers.setCustomFilters({
                        ...customFilters,
                        isolate: value === "true" ? true : false,
                      })
                    }
                    type="simulate"
                    appearance="button"
                    className={"input-style"}
                  ></Select>
                </Text>
              </section>
            </>
          }
        />
        <Justify
          left={
            <>
              <Button
                type={"primary"}
                className={"justify-button"}
                onClick={handlers.search}
              >
                查询
              </Button>
              <Button className={"justify-button"} onClick={handlers.clear}>
                重置
              </Button>
              <Button
                type={"primary"}
                onClick={handlers.create}
                disabled={isReadOnly(namespace)}
                tooltip={isReadOnly(namespace) && "该命名空间为只读的"}
              >
                新建
              </Button>
              <Button
                onClick={() => handlers.remove(selection)}
                disabled={selection.length === 0}
              >
                删除
              </Button>
              <Dropdown
                clickClose={false}
                style={{ marginRight: 10 }}
                button={
                  <Button
                    disabled={selection?.length === 0}
                    tooltip={selection?.length === 0 && "请选择实例"}
                  >
                    修改
                  </Button>
                }
                appearance="pure"
              >
                {(close) => (
                  <List type="option">
                    <List.Item
                      onClick={() => {
                        handlers.modifyWeight(selection);
                        close();
                      }}
                      disabled={selection?.length === 0}
                      tooltip={selection?.length === 0 && "请选择实例"}
                    >
                      修改权重
                    </List.Item>
                    <List.Item
                      onClick={() => {
                        handlers.modifyHealthStatus(selection);
                        close();
                      }}
                      disabled={selection?.length === 0}
                      tooltip={selection?.length === 0 && "请选择实例"}
                    >
                      修改健康状态
                    </List.Item>
                    <List.Item
                      onClick={() => {
                        handlers.modifyIsolateStatus(selection);
                        close();
                      }}
                      disabled={selection?.length === 0}
                      tooltip={selection?.length === 0 && "请选择实例"}
                    >
                      修改隔离状态
                    </List.Item>

                    {selection?.length === 0 ? (
                      <List.Item
                        disabled={selection?.length === 0}
                        tooltip={selection?.length === 0 && "请选择实例"}
                      >
                        复制IP
                      </List.Item>
                    ) : (
                      <Copy
                        text={selection
                          .map((id) => {
                            const item = list.find((item) => id === item.id);
                            return `${item?.host}:${item?.port}`;
                          })
                          .join(";")}
                      >
                        <List.Item
                          onClick={() => {
                            close();
                          }}
                          disabled={selection?.length === 0}
                          tooltip={selection?.length === 0 && "请选择实例"}
                        >
                          复制IP
                        </List.Item>
                      </Copy>
                    )}
                  </List>
                )}
              </Dropdown>
            </>
          }
          right={
            <Button
              type={"icon"}
              icon={"refresh"}
              onClick={handlers.reload}
            ></Button>
          }
        />
      </Table.ActionPanel>
      <Card>
        <GridPageGrid
          duck={duck}
          dispatch={dispatch}
          store={store}
          columns={columns}
          addons={[
            selectable({
              all: true,
              value: selection,
              onChange: handlers.select,
              rowSelectable: (rowKey, { record }) => !isReadOnly(namespace),
            }),
            expandable({
              // 已经展开的产品
              expandedKeys,
              // 发生展开行为时，回调更新展开键值
              onExpandedKeysChange: (keys) => handlers.setExpandedKeys(keys),
              render: (record) => {
                return (
                  <>
                    <Form>
                      <FormItem label="实例ID">
                        <FormText>
                          <Text
                            overflow
                            tooltip={record.id}
                            style={{ width: "100px" }}
                          >
                            {record.id}
                          </Text>
                          <Copy text={record.id}>
                            <Button type={"icon"} icon={"copy"}></Button>
                          </Copy>
                        </FormText>
                      </FormItem>
                      <FormItem label="健康检查">
                        <FormText>
                          {record.healthCheck?.type ? "开启" : "关闭"}
                        </FormText>
                      </FormItem>
                      {record.healthCheck?.type && (
                        <FormItem label="健康检查方式">
                          <FormText>
                            检查方式：
                            {
                              HEALTH_CHECK_METHOD_MAP[record.healthCheck?.type]
                                .text
                            }
                            ; TTL：{`${record.healthCheck?.heartbeat?.ttl}秒`}
                          </FormText>
                        </FormItem>
                      )}
                      <FormItem label="实例标签">
                        <FormText>
                          {Object.keys(record.metadata || {})
                            .map((item) => `${item}:${record.metadata[item]}`)
                            .join(" ; ") || "-"}
                        </FormText>
                      </FormItem>
                    </Form>
                  </>
                );
              },
            }),
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </>
  );
}
