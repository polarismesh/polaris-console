import BasicLayout from "@src/polaris/common/components/BaseLayout";
import React from "react";
import { DuckCmpProps } from "saga-duck";
import RuleLimitPageDuck from "./PageDuck";
import {
  Button,
  Card,
  Justify,
  Table,
  Segment,
  Form,
  FormText,
  FormItem,
  Text,
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
import { LimitResource } from "./model";
import { LIMIT_TYPE_MAP } from "./types";
import { MATCH_TYPE_MAP } from "../circuitBreaker/types";
import { MATCH_TYPE } from "../route/types";
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

export default function RuleLimitPage(props: DuckCmpProps<RuleLimitPageDuck>) {
  const { duck, store, dispatch } = props;
  const { creators, selectors, selector } = duck;
  const handlers = React.useMemo(
    () => ({
      reload: () => dispatch(creators.reload()),
      export: () => dispatch(creators.export(csvColumns, "service-list")),
      search: () => dispatch(creators.search("")),
      create: () => dispatch(creators.create()),
      remove: (payload) => dispatch(creators.remove(payload)),
      setExpandedKeys: (payload) => dispatch(creators.setExpandedKeys(payload)),
      setLimitRange: (payload) => dispatch(creators.setLimitRange(payload)),
      select: (payload) => dispatch(creators.setSelection(payload)),
    }),
    []
  );
  const columns = React.useMemo(() => getColumns(props), []);
  const {
    expandedKeys,
    grid: { list },
    selection,
    limitRange,
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
              <Button
                onClick={() => handlers.remove(selection)}
                disabled={!selection || selection?.length <= 0}
              >
                删除
              </Button>
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
                const method = record.labels?.["method"] || {};
                return (
                  <Form>
                    <FormItem label="匹配接口">
                      <FormText>
                        {method.value
                          ? `匹配值：${method?.value} 匹配模式：${
                              MATCH_TYPE_MAP[method?.type || MATCH_TYPE.EXACT]
                                .text
                            }`
                          : "-"}
                      </FormText>
                    </FormItem>
                    <FormItem label="优先级">
                      <FormText>{record.priority}</FormText>
                    </FormItem>
                    <FormItem label="限流资源">
                      <FormText>
                        {!record.resource ? LimitResource.QPS : record.resource}
                      </FormText>
                    </FormItem>
                    <FormItem label="请求服务标签">
                      <FormText>
                        {Object.keys(record.labels)
                          .map((key) => `${key}:${record.labels[key].value}`)
                          .join(" ; ")}
                      </FormText>
                    </FormItem>
                    <FormItem label="限流规则">
                      <FormText>
                        {record.amounts.map((amount) => {
                          return (
                            <Text parent="p">
                              当{amount.validDuration}内，收到符合条件的请求超过
                              {amount.maxAmount}个，将会进行
                              {LIMIT_TYPE_MAP[record.action].text}限流
                            </Text>
                          );
                        })}
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
    </>
  );
}
