import React from "react";
import { DuckCmpProps, purify } from "saga-duck";
import Duck from "./CreateDuck";
import {
  Form,
  Segment,
  Select,
  Text,
  Icon,
  Bubble,
  FormItem,
  FormText,
} from "tea-component";
import FormField from "@src/polaris/common/duckComponents/form/Field";
import Input from "@src/polaris/common/duckComponents/form/Input";
import Dialog from "@src/polaris/common/duckComponents/Dialog";
import Switch from "@src/polaris/common/duckComponents/form/Switch";
import InputNumber from "@src/polaris/common/duckComponents/form/InputNumber";
import {
  HEALTH_STATUS_OPTIONS,
  HEALTH_CHECK_METHOD_OPTIONS,
  BATCH_EDIT_TYPE,
} from "../types";

export default function Create(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props;
  const { selectors } = duck;
  const visible = selectors.visible(store);
  if (!visible) {
    return <noscript />;
  }
  const data = selectors.data(store);

  return (
    <Dialog
      duck={duck}
      store={store}
      dispatch={dispatch}
      size="l"
      title={data.host ? "编辑服务实例" : "新建服务实例"}
    >
      <CreateForm duck={duck} store={store} dispatch={dispatch} />
    </Dialog>
  );
}

const CreateForm = purify(function CreateForm(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props;
  const {
    ducks: { form },
    selectors,
  } = duck;

  const formApi = form.getAPI(store, dispatch);
  const {
    host,
    port,
    weight,
    protocol,
    version,
    metadata,
    healthy,
    isolate,
    enableHealthCheck,
    healthCheckMethod,
    ttl,
  } = formApi.getFields([
    "host",
    "port",
    "weight",
    "protocol",
    "version",
    "metadata",
    "healthy",
    "isolate",
    "enableHealthCheck",
    "healthCheckMethod",
    "ttl",
  ]);
  const { isModify, batchEditType } = selectors.options(store);
  if (batchEditType) {
    let item;
    switch (batchEditType) {
      case BATCH_EDIT_TYPE.WEIGHT:
        item = (
          <FormField field={weight} label={"权重"} required>
            <InputNumber field={weight} hideButton></InputNumber>
          </FormField>
        );
        break;
      case BATCH_EDIT_TYPE.HEALTHY:
        item = (
          <FormField field={healthy} label={"健康状态"}>
            <Switch field={healthy} />
          </FormField>
        );
        break;
      case BATCH_EDIT_TYPE.ISOLATE:
        item = (
          <FormField
            field={isolate}
            label={
              <>
                <Text>是否隔离</Text>
                <Bubble
                  content={
                    "隔离状态下，主调方无法发现隔离的服务实例，无论实例IP是否健康"
                  }
                >
                  <Icon type={"info"}></Icon>
                </Bubble>
              </>
            }
          >
            <Switch field={isolate} />
          </FormField>
        );
        break;
    }
    return <Form>{item}</Form>;
  }
  return (
    <>
      <Form>
        <FormField field={host} label="实例IP" required>
          {isModify ? (
            <FormText>{host.getValue()}</FormText>
          ) : (
            <Input
              field={host}
              placeholder={
                "多个IP以英文逗号、英文分号、空格或换行分隔，每次最多添加100个IP"
              }
              size={"l"}
              multiline
              disabled={isModify}
            />
          )}
        </FormField>
        <FormField field={port} label={"端口"} required>
          {isModify ? (
            <FormText>{port.getValue()}</FormText>
          ) : (
            <Input
              field={port}
              placeholder={
                "多个端口以英文逗号、英文分号、空格或换行分隔，每次最多添加100个端口"
              }
              size={"l"}
              multiline
              disabled={isModify}
            />
          )}
        </FormField>
        <FormField field={weight} label={"权重"} required>
          <InputNumber field={weight} min={0}></InputNumber>
        </FormField>
        <FormField field={protocol} label={"协议"}>
          <Input field={protocol} size={"l"} />
        </FormField>
        <FormField field={version} label={"版本"}>
          <Input field={version} size={"l"} />
        </FormField>
        <FormField
          field={metadata}
          label={
            <>
              <Text>实例标签</Text>
              <Bubble
                content={"实例标签可用于标识实例的用处、特征，格式为key:value"}
              >
                <Icon type={"info"}></Icon>
              </Bubble>
            </>
          }
        >
          <Input
            field={metadata}
            placeholder={
              "每个key最长不超过128个字符，每个value最长不超过4096个字符\n标签数量不能超过64个"
            }
            size={"l"}
            multiline
          />
        </FormField>
        <FormField field={healthy} label={"健康状态"}>
          <Switch field={healthy} />
        </FormField>
        <FormField
          field={enableHealthCheck}
          label={
            <>
              <Text>开启健康检查</Text>
              <Bubble content={"如果开启，服务端负责检查服务实例的健康状态"}>
                <Icon type={"info"}></Icon>
              </Bubble>
            </>
          }
        >
          <Switch field={enableHealthCheck} />
        </FormField>
        {enableHealthCheck.getValue() && (
          <FormItem label={"健康检查方式"}>
            <Form style={{ width: "420px" }}>
              <FormField field={healthCheckMethod} label={"检查方式"}>
                <Select
                  value={healthCheckMethod.getValue()}
                  options={HEALTH_CHECK_METHOD_OPTIONS}
                  onChange={(value) => healthCheckMethod.setValue(value)}
                  type={"simulate"}
                  appearance={"button"}
                  size="m"
                ></Select>
              </FormField>
              <FormField field={ttl} label="TTL">
                <InputNumber
                  hideButton
                  min={0}
                  field={ttl}
                  unit={"秒"}
                ></InputNumber>
              </FormField>
            </Form>
          </FormItem>
        )}
        <FormField
          field={isolate}
          label={
            <>
              <Text>是否隔离</Text>
              <Bubble
                content={
                  "隔离状态下，主调方无法发现隔离的服务实例，无论实例IP是否健康"
                }
              >
                <Icon type={"info"}></Icon>
              </Bubble>
            </>
          }
        >
          <Switch field={isolate} />
        </FormField>
      </Form>
    </>
  );
});
