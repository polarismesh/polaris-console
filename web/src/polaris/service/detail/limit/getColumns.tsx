import * as React from "react";
import { Column } from "@src/polaris/common/ducks/GridPage";
import { DuckCmpProps } from "saga-duck";
import { Link } from "react-router-dom";
import { Text, Icon, Modal, Switch } from "tea-component";
import Action from "@src/polaris/common/duckComponents/grid/Action";
import RoutePageDuck from "./PageDuck";
import { RateLimit, LimitRange, LimitType } from "./model";
import { LIMIT_RANGE_MAP, LIMIT_TYPE_OPTIONS, LIMIT_TYPE_MAP } from "./types";
import { isReadOnly } from "../../utils";
export default ({
  duck: { creators, selector },
  dispatch,
  store,
}: DuckCmpProps<RoutePageDuck>): Column<RateLimit>[] => {
  return [
    {
      key: "type",
      header: "限流类型",
      render: (x: RateLimit) => (
        <React.Fragment>
          <Text>
            {LIMIT_RANGE_MAP[!x.type ? LimitRange.GLOBAL : x.type].text}
          </Text>
        </React.Fragment>
      ),
    },
    {
      key: "ratelimitAction",
      header: "限流行为",
      render: (x: RateLimit) => (
        <React.Fragment>
          <Text>
            {LIMIT_TYPE_MAP[!x.action ? LimitType.REJECT : x.action].text}
          </Text>
        </React.Fragment>
      ),
    },
    {
      key: "labels",
      header: "匹配标签",
      render: (x) => (
        <Text overflow>
          {Object.keys(x.labels)
            .map((key) => `${key}:${x.labels[key].value}`)
            .join(" ; ")}
        </Text>
      ),
    },
    {
      key: "priority",
      header: "优先级",
      render: (x) => (
        <React.Fragment>
          <Text>{x.priority}</Text>
        </React.Fragment>
      ),
    },
    {
      key: "mtime",
      header: "更新时间",
      render: (x) => (
        <React.Fragment>
          <Text>{x.mtime}</Text>
        </React.Fragment>
      ),
    },
    {
      key: "disable",
      header: "是否启用",
      render: (x) => {
        const {
          data: { namespace },
        } = selector(store);
        const disabled = isReadOnly(namespace);
        return (
          <Switch
            value={!x.disable}
            onChange={() => dispatch(creators.toggleStatus(x))}
            disabled={disabled}
            tooltip={disabled && "该命名空间为只读的"}
          ></Switch>
        );
      },
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
              fn={(dispatch) => dispatch(creators.edit(x))}
              disabled={disabled}
              tip={disabled ? "该命名空间为只读的" : "编辑"}
            >
              <Icon type={"pencil"}></Icon>
            </Action>
            <Action
              fn={(dispatch) => dispatch(creators.remove([x.id]))}
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
