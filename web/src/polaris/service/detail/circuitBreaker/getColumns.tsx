import * as React from "react";
import { Column } from "@src/polaris/common/ducks/GridPage";
import { DuckCmpProps } from "saga-duck";
import { Link } from "react-router-dom";
import { Text, Icon, Modal } from "tea-component";
import Action from "@src/polaris/common/duckComponents/grid/Action";
import RoutePageDuck from "./PageDuck";
import { RuleType } from "./types";
import { isReadOnly } from "../../utils";
export default ({
  duck: { creators, selector },
  store,
}: DuckCmpProps<RoutePageDuck>): Column<any>[] => {
  const { ruleType } = selector(store);
  console.log(ruleType);
  return [
    ...(ruleType === RuleType.Inbound
      ? [
          {
            key: "sourceNamespace",
            header: "请求命名空间",
            render: (x) => (
              <React.Fragment>
                <Text>
                  {x.sources
                    .map((source) => source.namespace)
                    .join(",")
                    .replace("*", "所有") || "-"}
                </Text>
              </React.Fragment>
            ),
          },
          {
            key: "sourceService",
            header: "请求服务名",
            render: (x) => (
              <Text>
                {x.sources
                  .map((source) => source.service)
                  .join(",")
                  .replace("*", "所有") || "-"}
              </Text>
            ),
          },
        ]
      : []),
    ...(ruleType === RuleType.Outbound
      ? [
          {
            key: "desNamespace",
            header: "目标命名空间",
            render: (x) => (
              <React.Fragment>
                <Text>
                  {x.destinations
                    .map((destination) => destination.namespace)
                    .join(",")
                    .replace("*", "所有") || "-"}
                </Text>
              </React.Fragment>
            ),
          },
          {
            key: "desService",
            header: "目标服务名",
            render: (x) => (
              <Text>
                {x.destinations
                  .map((destination) => destination.service)
                  .join(",")
                  .replace("*", "所有") || "-"}
              </Text>
            ),
          },
        ]
      : []),
    {
      key: "action",
      header: "操作",
      render: (x) => {
        const {
          data: { namespace },
        } = selector(store);
        const disabled = isReadOnly(namespace);
        return (
          <React.Fragment>
            <Action
              fn={(dispatch) => dispatch(creators.edit(x.id))}
              disabled={disabled}
              tip={disabled ? "该命名空间为只读的" : "编辑"}
            >
              <Icon type={"pencil"}></Icon>
            </Action>
            <Action
              fn={(dispatch) => dispatch(creators.remove(x.id))}
              disabled={disabled}
              tip={disabled ? "该命名空间为只读的" : "删除"}
            >
              <Icon type={"delete"}></Icon>
            </Action>
          </React.Fragment>
        );
      },
    },
  ];
};
