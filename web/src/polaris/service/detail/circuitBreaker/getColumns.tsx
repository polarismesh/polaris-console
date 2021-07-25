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
            header: "命名空间",
            render: (x) => (
              <React.Fragment>
                <Text>
                  {x.sources
                    .map((source) =>
                      source.namespace === "*" ? "全部" : source.namespace
                    )
                    .join(",") || "-"}
                </Text>
              </React.Fragment>
            ),
          },
          {
            key: "sourceService",
            header: "服务名",
            render: (x) => (
              <Text>
                {x.sources
                  .map((source) =>
                    source.service === "*" ? "全部" : source.service
                  )
                  .join(",") || "-"}
              </Text>
            ),
          },
        ]
      : []),
    ...(ruleType === RuleType.Outbound
      ? [
          {
            key: "desNamespace",
            header: "命名空间",
            render: (x) => (
              <React.Fragment>
                <Text>
                  {x.destinations
                    .map((destination) =>
                      destination.namespace === "*"
                        ? "全部"
                        : destination.namespace
                    )
                    .join(",") || "-"}
                </Text>
              </React.Fragment>
            ),
          },
          {
            key: "desService",
            header: "服务名",
            render: (x) => (
              <Text>
                {x.destinations
                  .map((destination) =>
                    destination.service === "*" ? "全部" : destination.service
                  )
                  .join(",") || "-"}
              </Text>
            ),
          },
        ]
      : []),
    {
      key: "sourceMethod",
      header: "接口名",
      render: (x) => (
        <Text>
          {x.destinations
            .map((destination) => destination.method?.value)
            .join(",") || "-"}
        </Text>
      ),
    },
    {
      key: "labels",
      header: "请求标签",
      render: (x) => (
        <Text>
          {x.sources
            .map((source) =>
              Object.keys(source.labels).map(
                (key) => `${key}:${source.labels[key].value}`
              )
            )
            .join(",")}
        </Text>
      ),
    },
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
