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
  FormText,
  InputNumber as TeaInputNumber,
} from "tea-component";
import {
  RULE_TYPE_OPTIONS,
  MATCH_TYPE_OPTIONS,
  MATCH_TYPE,
  RuleType,
  PolicyName,
  PolicyNameOptions,
  BreakResourceOptions,
  BREAK_RESOURCE_TYPE,
  OUTLIER_DETECT_MAP_OPTIONS,
  PolicyMap,
} from "../types";
import Input from "@src/polaris/common/duckComponents/form/Input";
import FormField from "@src/polaris/common/duckComponents/form/Field";
import Select from "@src/polaris/common/duckComponents/form/Select";
import InputNumber from "@src/polaris/common/duckComponents/form/InputNumber";
import Switch from "@src/polaris/common/duckComponents/form/Switch";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { REGEX_STAR_TIPS } from "../../limit/operations/Create";

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
const addPolicy = (field) => {
  field.setValue([
    ...field.getValue(),
    {
      policyName: PolicyName.ErrorRate,
      errorRateToOpen: 10,
      slowRateToOpen: 0,
      consecutiveErrorToOpen: 10,
      maxRt: 1,
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
        <FormField showStatusIcon={false} field={type} label={"匹配方式"}>
          <Select size="s" options={MATCH_TYPE_OPTIONS} field={type} />
        </FormField>
        <FormItem>
          <Button
            type="icon"
            icon="close"
            onClick={() => removeArrayFieldValue(field, index)}
          ></Button>
        </FormItem>
      </Form>
    );
  });
};

const renderInboundRule = (props) => {
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
    inboundDestinations,
    inboundSources,
    outboundDestinations,
    outboundSources,
    editType,
    ruleType,
    inboundNamespace,
    inboundService,
    outboundNamespace,
    outboundService,
  } = formApi.getFields([
    "inboundDestinations",
    "inboundSources",
    "outboundDestinations",
    "outboundSources",
    "editType",
    "ruleType",
    "inboundNamespace",
    "inboundService",
    "outboundNamespace",
    "outboundService",
  ]);
  const isInbound = ruleType.getValue() === RuleType.Inbound;
  let sources = isInbound ? inboundSources : outboundSources;
  let destinations = isInbound ? inboundDestinations : outboundDestinations;
  let ruleNamespace = isInbound ? inboundNamespace : outboundNamespace;
  let ruleService = isInbound ? inboundService : outboundService;
  return (
    <>
      <FormItem
        label={<H3 style={{ margin: "10px 0" }}>规则配置</H3>}
      ></FormItem>
      <FormItem
        label={
          <H4 style={{ margin: "10px 0" }}>
            {isInbound ? "对于以下服务" : "本服务调用以下服务时"}
          </H4>
        }
      ></FormItem>
      <Form>
        <Form style={{ width: "800px" }}>
          <Form layout={"inline"}>
            <FormField
              showStatusIcon={false}
              field={ruleNamespace}
              label={"命名空间"}
              message={REGEX_STAR_TIPS}
            >
              <Input field={ruleNamespace} />
            </FormField>
            <FormField
              showStatusIcon={false}
              field={ruleService}
              label={"服务"}
              message={REGEX_STAR_TIPS}
            >
              <Input field={ruleService} />
            </FormField>
          </Form>
        </Form>
      </Form>
      <FormItem
        label={
          <H3 style={{ margin: "10px 0" }}>
            {isInbound ? "调用本服务的以下接口时：" : "本服务调用以下接口时"}
          </H3>
        }
      ></FormItem>

      <Form style={{ width: "100%", marginBottom: "20px" }}>
        <Form style={{ width: "800px" }} layout={"inline"}>
          {[...destinations.asArray()].map((field, index) => {
            const { method } = field.getFields(["method"]);
            const { value: methodValue } = method.getFields(["value"]);
            return (
              <FormField
                showStatusIcon={false}
                field={methodValue}
                label={"接口"}
              >
                <Input field={methodValue} />
              </FormField>
            );
          })}
        </Form>
      </Form>
      {[...sources.asArray()].map((field) => {
        const { labels } = field.getFields(["namespace", "service", "labels"]);
        return (
          <>
            <FormItem
              label={
                <H3 style={{ margin: "10px 0" }}>调用带有以下标签接口时：</H3>
              }
            ></FormItem>
            <Form>
              <Form style={{ width: "800px" }}>
                {getMetadataForm(labels)}
                <Button
                  type={"icon"}
                  icon={"plus"}
                  onClick={() => addMetadata(labels)}
                ></Button>
              </Form>
            </Form>
          </>
        );
      })}
      <FormItem
        label={
          <H3 style={{ margin: "10px 0" }}>满足以下任意条件时，进行熔断：</H3>
        }
      ></FormItem>
      {[...destinations.asArray()].map((field, index) => {
        const { policy, resource, recover, resourceSetMark } = field.getFields([
          "policy",
          "resource",
          "recover",
          "resourceSetMark",
        ]);
        const { sleepWindow, outlierDetectWhen } = recover.getFields([
          "sleepWindow",
          "outlierDetectWhen",
        ]);
        return (
          <>
            <Form style={{ width: "100%", marginBottom: "20px" }}>
              <Form style={{ width: "800px" }}>
                {[...policy.asArray()].map((policyItem) => {
                  const {
                    policyName,
                    errorRateToOpen,
                    slowRateToOpen,
                    maxRt,
                    requestVolumeThreshold,
                    consecutiveErrorToOpen,
                  } = policyItem.getFields([
                    "policyName",
                    "errorRateToOpen",
                    "slowRateToOpen",
                    "maxRt",
                    "requestVolumeThreshold",
                    "consecutiveErrorToOpen",
                  ]);
                  const threshold =
                    policyName.getValue() === PolicyName.ErrorRate
                      ? errorRateToOpen
                      : consecutiveErrorToOpen;
                  return (
                    <Form layout={"inline"}>
                      <FormField
                        field={policyName}
                        label={"条件"}
                        showStatusIcon={false}
                      >
                        <Select
                          field={policyName}
                          options={PolicyNameOptions}
                        />
                      </FormField>
                      <FormItem>
                        <FormText>{">="}</FormText>
                      </FormItem>
                      <FormField showStatusIcon={false} field={threshold}>
                        <InputNumber
                          hideButton
                          field={threshold}
                          unit={PolicyMap[policyName.getValue()]?.unit}
                          min={0}
                          max={100}
                        />
                      </FormField>
                      {policyName.getValue() === PolicyName.SlowRate && (
                        <FormField
                          showStatusIcon={false}
                          field={maxRt}
                          label={"最大响应时间"}
                        >
                          <InputNumber
                            size="m"
                            field={maxRt}
                            unit={"秒"}
                            min={0}
                          />
                        </FormField>
                      )}
                      {policyName.getValue() === PolicyName.ErrorRate && (
                        <FormField
                          showStatusIcon={false}
                          field={requestVolumeThreshold}
                          label={"请求数阈值"}
                        >
                          <InputNumber
                            hideButton
                            size="m"
                            field={requestVolumeThreshold}
                            unit={"个"}
                            min={0}
                          />
                        </FormField>
                      )}
                      {policy.getValue().length > 1 && (
                        <FormItem>
                          <Button
                            type="icon"
                            icon="close"
                            onClick={() => removeArrayFieldValue(policy, index)}
                          ></Button>
                        </FormItem>
                      )}
                    </Form>
                  );
                })}
                <Button
                  type={"icon"}
                  icon={"plus"}
                  onClick={() => addPolicy(policy)}
                ></Button>
              </Form>
            </Form>
            <FormItem
              label={<H3 style={{ margin: "10px 0" }}>满足以下条件时恢复：</H3>}
            ></FormItem>
            <Form>
              <Form layout="inline" style={{ width: "800px" }}>
                <FormField
                  showStatusIcon={false}
                  field={sleepWindow}
                  label={"等待时间大于"}
                >
                  <TeaInputNumber
                    value={Number(sleepWindow.getValue().replace("s", ""))}
                    hideButton
                    unit="秒"
                    min={0}
                    onChange={(value) => sleepWindow.setValue(`${value}s`)}
                  ></TeaInputNumber>
                </FormField>
              </Form>
            </Form>
            <FormItem
              label={<H3 style={{ margin: "10px 0" }}>熔断粒度：</H3>}
            ></FormItem>
            <Form>
              <Form layout="inline" style={{ width: "800px" }}>
                <FormItem label={"粒度"}>
                  <Segment
                    options={BreakResourceOptions}
                    value={resource.getValue()}
                    onChange={(value) => resource.setValue(value)}
                  ></Segment>
                </FormItem>
              </Form>
            </Form>
            <FormItem
              label={<H3 style={{ margin: "10px 0" }}>主动探测：</H3>}
            ></FormItem>
            <Form>
              <Form layout="inline" style={{ width: "800px" }}>
                <FormItem label={"探测规则"}>
                  <Segment
                    options={OUTLIER_DETECT_MAP_OPTIONS}
                    value={outlierDetectWhen.getValue()}
                    onChange={(value) => outlierDetectWhen.setValue(value)}
                  ></Segment>
                </FormItem>
              </Form>
            </Form>
          </>
        );
      })}
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
    form: { values },
    ruleIndex,
  } = selector(store);
  const formApi = form.getAPI(store, dispatch);
  const {
    editType,
    ruleType,
    inboundJsonValue,
    outboundJsonValue,
  } = formApi.getFields([
    "editType",
    "ruleType",
    "inboundJsonValue",
    "outboundJsonValue",
  ]);
  const handlers = React.useMemo(
    () => ({
      submit: () => dispatch(duck.creators.submit()),
    }),
    []
  );
  const ref = useRef(null);
  const isEdit = Number(ruleIndex) !== -1;
  const currentJsonValue =
    ruleType.getValue() === RuleType.Inbound
      ? inboundJsonValue
      : outboundJsonValue;
  return (
    <DetailPage
      store={store}
      duck={duck}
      dispatch={dispatch}
      title={ruleIndex === -1 ? "新建熔断规则" : "编辑熔断规则"}
      backRoute={`/service-detail?namespace=${namespace}&name=${service}&tab=circuitBreaker`}
    >
      <Card>
        <Card.Body>
          <Form>
            <FormItem label={"编辑方式"}>
              <Segment
                options={EditTypeOptions}
                value={editType.getValue()}
                onChange={(value) => editType.setValue(value as any)}
              ></Segment>
            </FormItem>
            {!isEdit && (
              <FormItem label={"规则类型"}>
                <Segment
                  options={RULE_TYPE_OPTIONS}
                  value={ruleType.getValue()}
                  onChange={(value) => ruleType.setValue(value as any)}
                ></Segment>
              </FormItem>
            )}
            {editType.getValue() === EditType.Json && (
              <FormItem
                message={
                  <Text theme={"danger"}>
                    {currentJsonValue.getTouched() &&
                      currentJsonValue.getError()}
                  </Text>
                }
                label={"JSON编辑"}
              >
                <section
                  style={{ border: "1px solid #ebebeb", width: "1000px" }}
                >
                  <MonacoEditor
                    ref={ref}
                    monaco={monaco}
                    height={400}
                    width={1000}
                    language="json"
                    value={currentJsonValue.getValue()}
                    onChange={(value) => {
                      currentJsonValue.setTouched(true);
                      currentJsonValue.setValue(value);
                    }}
                  />
                </section>
              </FormItem>
            )}
          </Form>
          {editType.getValue() === EditType.Manual && renderInboundRule(props)}
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
