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
import {
  RULE_TYPE_OPTIONS,
  PolicyMap,
  PolicyName,
  OUTLIER_DETECT_MAP,
} from "./types";
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
      export: () => dispatch(creators.export(csvColumns, "service-list")),
      search: () => dispatch(creators.search("")),
      create: () => dispatch(creators.create()),
      remove: (payload) => dispatch(creators.remove(payload)),
      setExpandedKeys: (payload) => dispatch(creators.setExpandedKeys(payload)),
      setRuleType: (payload) => dispatch(creators.setRuleType(payload)),
    }),
    []
  );
  const {
    expandedKeys,
    grid: { list },
    ruleType,
    data: { namespace },
  } = selector(store);
  const columns = React.useMemo(() => getColumns(props), [ruleType]);

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
                  <Form
                    key={record.sources
                      .map((source) => source.namespace)
                      .join(",")}
                  >
                    {record.sources.map((source, index) => {
                      return (
                        <>
                          <FormItem
                            label="请求命名空间"
                            key={`req-namespace${index}`}
                          >
                            <FormText>
                              {(source.namespace || "-").replace("*", "所有")}
                            </FormText>
                          </FormItem>
                          <FormItem
                            label="请求服务"
                            key={`req-service${index}`}
                          >
                            <FormText>
                              {(source.service || "-").replace("*", "所有")}
                            </FormText>
                          </FormItem>
                          <FormItem label="业务标签" key={`req-labels${index}`}>
                            <FormText>
                              {Object.keys(source.labels)
                                .map(
                                  (key) => `${key}:${source.labels[key].value}`
                                )
                                .join(" ; ")}
                            </FormText>
                          </FormItem>
                        </>
                      );
                    })}
                    {record.destinations.map((destination, index) => {
                      return (
                        <>
                          <FormItem
                            label="目标命名空间"
                            key={`res-namespace${index}`}
                          >
                            <FormText>
                              {(destination.namespace || "-").replace(
                                "*",
                                "所有"
                              )}
                            </FormText>
                          </FormItem>
                          <FormItem
                            label="目标服务"
                            key={`res-service${index}`}
                          >
                            <FormText>
                              {(destination.service || "-").replace(
                                "*",
                                "所有"
                              )}
                            </FormText>
                          </FormItem>
                          <FormItem label="目标接口" key={`res-method${index}`}>
                            <FormText>
                              {destination.method?.value || "-"}
                            </FormText>
                          </FormItem>
                          <FormItem label="熔断策略" key={`res-policy${index}`}>
                            <FormText>
                              {Object.keys(destination.policy).map(
                                (key, index) => {
                                  if (key === PolicyName.ErrorRate) {
                                    return (
                                      <Text
                                        parent="p"
                                        key={index}
                                      >{`当请求个数大于${
                                        destination.policy[key]
                                          ?.requestVolumeThreshold || 10
                                      }个，且${PolicyMap[key].text}大于${
                                        destination.policy[key].errorRateToOpen
                                      }%时熔断`}</Text>
                                    );
                                  }
                                  if (key === PolicyName.SlowRate) {
                                    return (
                                      <Text
                                        parent="p"
                                        key={index}
                                      >{`以超过${destination.policy[key].maxRt}的请求作为超时请求，${PolicyMap[key].text}大于${destination.policy[key].slowRateToOpen}%时熔断`}</Text>
                                    );
                                  }
                                  if (key === PolicyName.ConsecutiveError) {
                                    return (
                                      <Text
                                        parent="p"
                                        key={index}
                                      >{`当连续请求错误超过${destination.policy[key].consecutiveErrorToOpen}个时熔断`}</Text>
                                    );
                                  }
                                }
                              )}
                            </FormText>
                          </FormItem>
                          <FormItem
                            label="熔断恢复时间"
                            key={`res-recover-time${index}`}
                          >
                            <FormText>
                              {destination.recover?.sleepWindow || "-"}
                            </FormText>
                          </FormItem>
                          <FormItem
                            label="主动探测"
                            key={`res-recover-detect${index}`}
                          >
                            <FormText>
                              {OUTLIER_DETECT_MAP[
                                destination.recover?.outlierDetectWhen
                              ]?.text || "-"}
                            </FormText>
                          </FormItem>
                        </>
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
