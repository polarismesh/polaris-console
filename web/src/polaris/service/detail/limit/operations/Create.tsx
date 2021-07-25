import React, { useRef } from "react";
import { DuckCmpProps, purify } from "saga-duck";
import CreateRouteDuck from "./CreateDuck";
import DetailPage from "@src/polaris/common/duckComponents/DetailPage";
import {
  Card,
  Form,
  FormItem,
  Segment,
  H3,
  Button,
  H4,
  Justify,
  MonacoEditor,
  Text,
  Switch,
} from "tea-component";
import {
  LIMIT_RANGE_OPTIONS,
  LIMIT_TYPE_MAP,
  LIMIT_TYPE_OPTIONS,
  LIMIT_THRESHOLD_OPTIONS,
} from "../types";
import Input from "@src/polaris/common/duckComponents/form/Input";
import FormField from "@src/polaris/common/duckComponents/form/Field";
import Select from "@src/polaris/common/duckComponents/form/Select";
import InputNumber from "@src/polaris/common/duckComponents/form/InputNumber";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { MATCH_TYPE_OPTIONS, MATCH_TYPE } from "../../route/types";
import { LimitRange } from "../model";

export const REGEX_STAR_TIPS = "正则模式下，使用*代表选择所有";

export enum EditType {
  Manual = "Manual",
  Json = "Json",
}
const EditTypeOptions = [
  {
    text: "手动配置",
    value: EditType.Manual,
  },
  {
    text: "JSON配置",
    value: EditType.Json,
  },
];

const addMetadata = (field) => {
  field.setValue([
    ...field.getValue(),
    { key: "", value: "", type: MATCH_TYPE.EXACT },
  ]);
};
const removeArrayFieldValue = (field, index) => {
  const newValue = field.getValue();
  newValue.splice(index, 1);
  field.setValue([...newValue]);
};
const addAmount = (field) => {
  field.setValue([
    ...field.getValue(),
    {
      maxAmount: 0,
      validDuration: 0,
    },
  ]);
};
const getMetadataForm = (field) => {
  return [...field.asArray()].map((metadataField, index) => {
    const { key, value, type } = metadataField.getFields([
      "key",
      "value",
      "type",
    ]);
    const isRegex = type.getValue() === MATCH_TYPE.REGEX;
    return (
      <Form layout={"inline"}>
        <FormField
          showStatusIcon={false}
          field={key}
          label={"标签键"}
          message={isRegex && REGEX_STAR_TIPS}
        >
          <Input field={key} />
        </FormField>
        <FormField
          showStatusIcon={false}
          field={value}
          label={"标签值"}
          message={isRegex && REGEX_STAR_TIPS}
        >
          <Input field={value} />
        </FormField>
        <FormField field={type} label={"匹配方式"}>
          <Select size="s" options={MATCH_TYPE_OPTIONS} field={type} />
        </FormField>
        {field.getValue()?.length > 1 && (
          <Button
            type="icon"
            icon="close"
            onClick={() => removeArrayFieldValue(field, index)}
          ></Button>
        )}
        <Button
          type={"icon"}
          icon={"plus"}
          onClick={() => addMetadata(field)}
        ></Button>
      </Form>
    );
  });
};

const renderLimitRule = (props) => {
  const { duck, store, dispatch } = props;
  const {
    selector,
    creators,
    ducks: { form },
  } = duck;
  const {
    service,
    namespace,
    form: { values },
    ruleIndex,
  } = selector(store);
  const formApi = form.getAPI(store, dispatch);
  const {
    action,
    resource,
    amounts,
    disable,
    priority,
    labels,
    amountMode,
    type,
    method,
  } = formApi.getFields([
    "service",
    "namespace",
    "type",
    "action",
    "resource",
    "amounts",
    "disable",
    "priority",
    "labels",
    "amountMode",
    "method",
  ]);
  const { value: methodValue, type: methodType } = method.getFields([
    "value",
    "type",
  ]);
  return (
    <>
      <FormItem
        label={<H3 style={{ margin: "10px 0" }}>本服务的以下接口被调用时</H3>}
      ></FormItem>
      <Form style={{ width: "850px" }}>
        <Form style={{ width: "100%" }} layout="inline">
          <FormField
            field={methodValue}
            label={"接口"}
            message={
              methodType.getValue() === MATCH_TYPE.REGEX && REGEX_STAR_TIPS
            }
          >
            <Input field={methodValue} />
          </FormField>
          <FormField field={methodType} label={"匹配方式"}>
            <Select size="s" options={MATCH_TYPE_OPTIONS} field={methodType} />
          </FormField>
        </Form>
      </Form>
      <>
        <FormItem
          label={<H3 style={{ margin: "10px 0" }}>对带有以下标签的请求</H3>}
        ></FormItem>
        <Form style={{ width: "850px" }}>
          <Form style={{ width: "100%" }}>{getMetadataForm(labels)}</Form>
        </Form>
      </>
      <FormItem
        label={
          <H3 style={{ margin: "10px 0" }}>如果满足以下任意条件，进行限流</H3>
        }
      ></FormItem>
      <Form>
        <Form style={{ width: "850px" }}>
          {[...amounts.asArray()].map((field, index) => {
            const { maxAmount, validDuration } = field.getFields([
              "maxAmount",
              "validDuration",
            ]);

            return (
              <Form layout={"inline"}>
                <FormField field={validDuration} label={"统计时长"}>
                  <InputNumber
                    hideButton
                    min={0}
                    unit={"秒"}
                    field={validDuration}
                  />
                </FormField>
                <FormField field={maxAmount} label={"请求数"}>
                  <InputNumber
                    hideButton
                    min={0}
                    unit={"次"}
                    field={maxAmount}
                  />
                </FormField>
                {amounts.getValue()?.length > 1 && (
                  <>
                    <Button
                      type="icon"
                      icon="close"
                      onClick={() => removeArrayFieldValue(amounts, index)}
                    ></Button>
                  </>
                )}
                <Button
                  type={"icon"}
                  icon={"plus"}
                  onClick={() => addAmount(amounts)}
                ></Button>
              </Form>
            );
          })}
        </Form>
      </Form>
      <Form style={{ marginTop: "20px" }}>
        <FormItem label={"限流效果"}>
          <Segment
            options={LIMIT_TYPE_OPTIONS}
            value={action.getValue()}
            onChange={(value) => action.setValue(value)}
          ></Segment>
        </FormItem>

        {type.getValue() === LimitRange.GLOBAL && (
          <>
            <FormItem label={"阈值模式"}>
              <Segment
                options={LIMIT_THRESHOLD_OPTIONS}
                value={amountMode.getValue()}
                onChange={(value) => amountMode.setValue(value)}
              ></Segment>
            </FormItem>
          </>
        )}
        <FormItem label={"优先级"}>
          <InputNumber hideButton min={0} field={priority} />
        </FormItem>
        <FormItem label={"是否启用"}>
          <Switch
            value={!disable.getValue()}
            onChange={(value) => {
              disable.setValue(!value);
            }}
          ></Switch>
        </FormItem>
      </Form>
    </>
  );
};

export default purify(function CreateRoute(
  props: DuckCmpProps<CreateRouteDuck>
) {
  const { duck, store, dispatch } = props;
  const {
    selector,
    creators,
    ducks: { form },
  } = duck;
  const {
    service,
    namespace,
    ruleId,
    form: { values },
  } = selector(store);
  const formApi = form.getAPI(store, dispatch);
  const { editType, type, jsonValue } = formApi.getFields([
    "editType",
    "type",
    "jsonValue",
  ]);
  const handlers = React.useMemo(
    () => ({
      submit: () => dispatch(duck.creators.submit()),
    }),
    []
  );
  const ref = useRef(null);
  const isEdit = !!ruleId;
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={isEdit ? "编辑限流规则" : "新建限流规则"}
      backRoute={`/service-detail?namespace=${namespace}&name=${service}&tab=ratelimit`}
    >
      <Card>
        <Card.Body>
          <Form>
            {/* <FormItem label={"编辑方式"}>
              <Segment
                options={EditTypeOptions}
                value={editType.getValue()}
                onChange={(value) => editType.setValue(value as any)}
              ></Segment>
            </FormItem> */}
            <FormItem label={"限流类型"}>
              <Segment
                options={LIMIT_RANGE_OPTIONS}
                value={type.getValue()}
                onChange={(value) => type.setValue(value as any)}
              ></Segment>
            </FormItem>
            {editType.getValue() === EditType.Json && (
              <FormItem
                message={
                  <Text theme={"danger"}>
                    {jsonValue.getTouched() && jsonValue.getError()}
                  </Text>
                }
                label={"JSON编辑"}
              >
                <section
                  style={{ border: "1px solid #cfd5de", width: "1000px" }}
                >
                  <MonacoEditor
                    ref={ref}
                    monaco={monaco}
                    height={400}
                    width={1000}
                    language="json"
                    value={jsonValue.getValue()}
                    onChange={(value) => {
                      jsonValue.setTouched(true);
                      jsonValue.setValue(value);
                    }}
                  />
                </section>
              </FormItem>
            )}
          </Form>
          {editType.getValue() === EditType.Manual && renderLimitRule(props)}
        </Card.Body>
        <Card.Footer>
          <Button
            type={"primary"}
            onClick={handlers.submit}
            style={{ margin: "10px" }}
          >
            提交
          </Button>
        </Card.Footer>
      </Card>
    </DetailPage>
  );
});
