import BasicLayout from "@src/polaris/common/components/BaseLayout";
import React from "react";
import { DuckCmpProps } from "saga-duck";
import ServicePageDuck from "./PageDuck";
import {
  Button,
  Card,
  Justify,
  Table,
  Segment,
  Form,
  FormText,
  FormItem,
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
import { RULE_TYPE_OPTIONS } from "./types";
import { isReadOnly } from "../../utils";

insertCSS(
  "service-detail-instance",
  `
.justify-search{
  margin-right:20px
}
.justify-button{
  vertical-align: bottom
}
`
);

export default function ServiceInstancePage(
  props: DuckCmpProps<ServicePageDuck>
) {
  const { duck, store, dispatch } = props;
  const { creators, selectors, selector } = duck;
  const handlers = React.useMemo(
    () => ({
      reload: () => dispatch(creators.reload()),
      search: () => dispatch(creators.search("")),
      create: () => dispatch(creators.create()),
      remove: (payload) => dispatch(creators.remove(payload)),
      setExpandedKeys: (payload) => dispatch(creators.setExpandedKeys(payload)),
      setRuleType: (payload) => dispatch(creators.setRuleType(payload)),
    }),
    []
  );
  const columns = React.useMemo(() => getColumns(props), []);
  const {
    expandedKeys,
    grid: { list },
    ruleType,
    data: { namespace },
  } = selector(store);
  return (
    <>
      <Table.ActionPanel>
        <Justify
          left={
            <>
              <Button
                type={"primary"}
                onClick={handlers.create}
                disabled={isReadOnly(namespace)}
                tooltip={isReadOnly(namespace) && "该命名空间为只读的"}
              >
                新建
              </Button>
              <Segment
                options={RULE_TYPE_OPTIONS}
                value={ruleType}
                onChange={handlers.setRuleType}
              ></Segment>
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
            expandable({
              // 已经展开的产品
              expandedKeys,
              // 发生展开行为时，回调更新展开键值
              onExpandedKeysChange: (keys) => handlers.setExpandedKeys(keys),
              render: (record) => {
                return (
                  <Form>
                    {record.sources.map((source) => {
                      return (
                        <>
                          <FormItem label="请求命名空间">
                            <FormText>
                              {source.namespace.replace("*", "所有")}
                            </FormText>
                          </FormItem>
                          <FormItem label="请求服务">
                            <FormText>
                              {source.service.replace("*", "所有")}
                            </FormText>
                          </FormItem>
                          <FormItem label="请求服务标签">
                            <FormText>
                              {Object.keys(source.metadata)
                                .map(
                                  (key) =>
                                    `${key}:${source.metadata[key].value}`
                                )
                                .join(" ; ")}
                            </FormText>
                          </FormItem>
                        </>
                      );
                    })}
                    {record.destinations.map((destination, index) => {
                      return (
                        <FormItem label={`实例分组${index + 1}`}>
                          <Form layout="inline">
                            <FormItem label="目标命名空间">
                              <FormText>{destination.namespace}</FormText>
                            </FormItem>
                            <FormItem label="目标服务">
                              <FormText>{destination.service}</FormText>
                            </FormItem>
                            <FormItem label="目标权重">
                              <FormText>{destination.weight}</FormText>
                            </FormItem>
                            <FormItem label="目标优先级">
                              <FormText>{destination.priority}</FormText>
                            </FormItem>
                            <FormItem label="目标是否隔离">
                              <FormText>
                                {destination.isolate ? "隔离" : "不隔离"}
                              </FormText>
                            </FormItem>
                            <FormItem label="目标服务标签">
                              <FormText>
                                {Object.keys(destination.metadata)
                                  .map(
                                    (key) =>
                                      `${key}:${destination.metadata[key].value}`
                                  )
                                  .join(" ; ")}
                              </FormText>
                            </FormItem>
                          </Form>
                        </FormItem>
                      );
                    })}
                  </Form>
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
