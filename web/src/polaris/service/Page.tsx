import BasicLayout from "../common/components/BaseLayout";
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
  Copy,
  Bubble,
} from "tea-component";
import GridPageGrid from "../common/duckComponents/GridPageGrid";
import GridPagePagination from "../common/duckComponents/GridPagePagination";
import getColumns from "./getColumns";
import {
  filterable,
  selectable,
  expandable,
} from "tea-component/lib/table/addons";
import insertCSS from "../common/helpers/insertCSS";
import csvColumns from "./csvColumns";
import { enableNearbyString } from "./operation/CreateDuck";
import { READ_ONLY_NAMESPACE } from "./types";
import { isReadOnly } from "./utils";

insertCSS(
  "service",
  `
.justify-search{
  margin-right:20px
}
.justify-button{
  vertical-align: bottom
}
`
);

const SEARCH_METHOD_OPTIONS = [
  { text: "精确", value: "accurate" },
  { text: "模糊", value: "vague" },
];

export default function ServicePage(props: DuckCmpProps<ServicePageDuck>) {
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
    }),
    []
  );
  const columns = React.useMemo(() => getColumns(props), []);
  const {
    customFilters,
    selection,
    namespaceList,
    expandedKeys,
    grid: { list },
  } = selector(store);
  return (
    <BasicLayout
      title={"服务列表"}
      store={store}
      selectors={duck.selectors}
      header={<></>}
    >
      <Table.ActionPanel>
        <Justify
          left={
            <section style={{ marginBottom: "20px" }}>
              <Text reset className="justify-search">
                命名空间&nbsp;
                <Select
                  value={customFilters.namespace}
                  options={namespaceList}
                  onChange={(value) =>
                    handlers.setCustomFilters({
                      ...customFilters,
                      namespace: value,
                    })
                  }
                  type="simulate"
                  appearance="button"
                  style={{ width: "200px" }}
                ></Select>
              </Text>
              <Text reset className="justify-search">
                服务名&nbsp;
                <InputAdornment
                  before={
                    <Select
                      options={SEARCH_METHOD_OPTIONS}
                      value={customFilters.searchMethod}
                      onChange={(value) =>
                        handlers.setCustomFilters({
                          ...customFilters,
                          searchMethod: value,
                        })
                      }
                      style={{ width: "auto", marginRight: "0px" }}
                    />
                  }
                >
                  <Input
                    value={customFilters.serviceName}
                    onChange={(value) =>
                      handlers.setCustomFilters({
                        ...customFilters,
                        serviceName: value,
                      })
                    }
                    style={{ width: "128px" }}
                  ></Input>
                </InputAdornment>
              </Text>
              <Text reset className="justify-search">
                部门&nbsp;
                <Input
                  value={customFilters.department}
                  onChange={(value) =>
                    handlers.setCustomFilters({
                      ...customFilters,
                      department: value,
                    })
                  }
                ></Input>
              </Text>
              <Text reset className="justify-search">
                业务&nbsp;
                <Input
                  value={customFilters.business}
                  onChange={(value) =>
                    handlers.setCustomFilters({
                      ...customFilters,
                      business: value,
                    })
                  }
                ></Input>
              </Text>
              <Text reset className="justify-search">
                实例IP&nbsp;
                <Input
                  value={customFilters.instanceIp}
                  onChange={(value) =>
                    handlers.setCustomFilters({
                      ...customFilters,
                      instanceIp: value,
                    })
                  }
                ></Input>
              </Text>
              <Text reset className="justify-search">
                服务标签&nbsp;
                <Input
                  value={customFilters.serviceTag}
                  onChange={(value) => {
                    handlers.setCustomFilters({
                      ...customFilters,
                      serviceTag: value,
                    });
                  }}
                  placeholder={"示例：Key:Value"}
                ></Input>
              </Text>
            </section>
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
              <Button type={"primary"} onClick={handlers.create}>
                新建
              </Button>
              <Button
                onClick={() => handlers.remove(selection)}
                disabled={selection.length === 0}
              >
                删除
              </Button>

              {/* <Dropdown
                clickClose={false}
                style={{ marginRight: 10 }}
                button={<Button type="icon" icon="more" />}
                appearance="pure"
              >
                {(close) => (
                  <List type="option">
                    {selection?.length === 0 ? (
                      <List.Item
                        onClick={() => {
                          close();
                        }}
                        disabled={selection?.length === 0}
                        tooltip={selection?.length === 0 && "请选择实例"}
                      >
                        复制服务名
                      </List.Item>
                    ) : (
                      <Copy
                        text={selection
                          .map((id) => {
                            const item = list.find((item) => id === item.id);
                            return item?.name;
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
                          复制服务名
                        </List.Item>
                      </Copy>
                    )}
                  </List>
                )}
              </Dropdown> */}
            </>
          }
          right={
            <>
              <Button
                type={"icon"}
                icon={"refresh"}
                onClick={handlers.reload}
              ></Button>
              <Button
                type={"icon"}
                icon={"download"}
                onClick={handlers.export}
              ></Button>
            </>
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
              rowSelectable: (rowKey, { record }) =>
                !isReadOnly(record.namespace),
            }),
            expandable({
              // 已经展开的产品
              expandedKeys,
              // 发生展开行为时，回调更新展开键值
              onExpandedKeysChange: (keys) => handlers.setExpandedKeys(keys),
              render: (record) => {
                return (
                  <Form>
                    <FormItem label="服务标签">
                      <FormText>
                        {Object.keys(record.metadata || {})
                          .filter((item) => item !== enableNearbyString)
                          .map((item) => `${item}:${record.metadata[item]}`)
                          .join(" ; ") || "-"}
                      </FormText>
                    </FormItem>
                    <FormItem label="描述">
                      <FormText>{record.comment || "-"}</FormText>
                    </FormItem>{" "}
                    <FormItem label="就近访问">
                      <FormText>
                        {record.metadata?.[enableNearbyString]
                          ? "开启"
                          : "关闭"}
                      </FormText>
                    </FormItem>
                  </Form>
                );
              },
            }),
          ]}
        />
        <GridPagePagination duck={duck} dispatch={dispatch} store={store} />
      </Card>
    </BasicLayout>
  );
}
