import React from "react";
import { DuckCmpProps, purify } from "saga-duck";
import Duck from "./CreateDuck";
import { Form, FormItem, FormText, Button } from "tea-component";
import FormField from "@src/polaris/common/duckComponents/form/Field";
import Input from "@src/polaris/common/duckComponents/form/Input";
import Dialog from "@src/polaris/common/duckComponents/Dialog";
import Switch from "@src/polaris/common/duckComponents/form/Switch";
import InputNumber from "@src/polaris/common/duckComponents/form/InputNumber";
import Select from "@src/polaris/common/duckComponents/form/Select";
import { MetricNameOptions, LabelKeyOptions } from "../types";
import moment from "moment";
import TimeSelect from "@src/polaris/common/components/TimeSelect";

export const TimePickerTab = [
  {
    text: "近1小时",
    date: [moment().subtract(1, "h"), moment()],
  },
  {
    text: "近1天",
    date: [moment().subtract(1, "d"), moment()],
  },
  {
    text: "近1周",
    date: [moment().subtract(1, "w"), moment()],
  },
];

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
      title={"新建监控图表"}
    >
      <CreateForm duck={duck} store={store} dispatch={dispatch} />
    </Dialog>
  );
}
const addFilter = (field) => {
  field.setValue([...field.getValue(), { labelKey: "", labelValue: "" }]);
};
const removeArrayFieldValue = (field, index) => {
  const newValue = field.getValue();
  newValue.splice(index, 1);
  field.setValue([...newValue]);
};
const CreateForm = purify(function CreateForm(props: DuckCmpProps<Duck>) {
  const { duck, store, dispatch } = props;
  const {
    ducks: { form },
    selectors,
  } = duck;

  const formApi = form.getAPI(store, dispatch);
  const { metricName, monitorFilters, filterTime } = formApi.getFields([
    "metricName",
    "monitorFilters",
    "filterTime",
  ]);
  const { isModify } = selectors.options(store);
  const filteredLabelKeyOptions = LabelKeyOptions.map((item) => {
    const hasThisKey = !!monitorFilters.getValue()?.find((filter) => {
      return filter.labelKey === item.value;
    });
    return { ...item, disabled: hasThisKey };
  });
  const { start, end } = filterTime.getFields(["start", "end"]);
  const [initStart, initEnd] = TimePickerTab[0].date;

  return (
    <div style={{ minHeight: "300px" }}>
      <Form>
        <FormItem label={"时间选择"}>
          <TimeSelect
            tabs={TimePickerTab}
            style={{ display: "inline-block" }}
            defaultIndex={isModify ? undefined : 0}
            changeDate={({ from, to }) => {
              filterTime.setValue({
                start: moment(from).unix(),
                end: moment(to).unix(),
              });
            }}
            range={{
              min: moment().subtract(29, "y"),
              max: moment(),
              maxLength: 3,
            }}
            from={
              isModify
                ? new Date(start.getValue() * 1000).toString()
                : undefined
            }
            to={
              isModify ? new Date(end.getValue() * 1000).toString() : undefined
            }
          />
        </FormItem>
        <FormField field={metricName} label="指标名" required>
          <Select
            type={"simulate"}
            appearance={"button"}
            field={metricName}
            options={MetricNameOptions}
            size="m"
          />
        </FormField>
        <FormItem label="筛选条件">
          <Form>
            {[...monitorFilters.asArray()].map((field, index) => {
              const { labelKey, labelValue } = field.getFields([
                "labelKey",
                "labelValue",
              ]);
              return (
                <Form layout={"inline"}>
                  <FormField
                    showStatusIcon={false}
                    field={labelKey}
                    label={"条件"}
                  >
                    <Select
                      type={"simulate"}
                      appearance={"button"}
                      size="m"
                      field={labelKey}
                      options={filteredLabelKeyOptions}
                      boxSizeSync
                    />
                  </FormField>
                  <FormField
                    showStatusIcon={false}
                    field={labelValue}
                    label={"条件值"}
                  >
                    <Input field={labelValue} />
                  </FormField>
                  {monitorFilters.getValue().length > 1 && (
                    <FormItem>
                      <Button
                        type="icon"
                        icon="close"
                        onClick={() =>
                          removeArrayFieldValue(monitorFilters, index)
                        }
                      ></Button>
                    </FormItem>
                  )}
                </Form>
              );
            })}
            <Button
              type={"icon"}
              icon={"plus"}
              onClick={() => addFilter(monitorFilters)}
            ></Button>
          </Form>
        </FormItem>
      </Form>
    </div>
  );
});
