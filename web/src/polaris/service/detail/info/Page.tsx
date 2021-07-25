import formatDate from "@src/polaris/common/util/formatDate";
import React from "react";
import { DuckCmpProps } from "saga-duck";
import {
  Card,
  Col,
  Form,
  LoadingTip,
  Row,
  Table,
  Text,
  FormItem,
  FormText,
} from "tea-component";
import { autotip } from "tea-component/lib/table/addons";
import BaseInfoDuck from "./PageDuck";
import { enableNearbyString } from "../../operation/CreateDuck";

export default function BaseInfo(props: DuckCmpProps<BaseInfoDuck>) {
  const { duck, store } = props;
  const { selector } = duck;
  const { loading, data } = selector(store);
  if (loading) return <LoadingTip />;
  if (!data) return <noscript />;
  const serviceTags = Object.keys(data.metadata || {})
    .filter((item) => item !== enableNearbyString)
    .map((item) => `${item}:${data.metadata[item]}`);
  const ports = (data.ports && data.ports.split(",")) || [];
  return (
    <>
      <Card>
        <Card.Body>
          <Form layout="inline">
            <Row>
              <Col>
                <FormItem label={"命名空间"}>
                  <FormText>{data.namespace}</FormText>
                </FormItem>
                <FormItem label={"服务名"}>
                  <FormText>{data.name}</FormText>
                </FormItem>
                <FormItem label={"部门"}>
                  <FormText>{data.department || "-"}</FormText>
                </FormItem>
                <FormItem label={"业务"}>
                  <FormText>{data.business || "-"}</FormText>
                </FormItem>
                <FormItem label={"创建时间"}>
                  <FormText>{data.ctime}</FormText>
                </FormItem>
                <FormItem label={"修改时间"}>
                  <FormText>{data.mtime}</FormText>
                </FormItem>
                <FormItem label={"版本号"}>
                  <FormText>{data.revision}</FormText>
                </FormItem>
                <FormItem label={`服务标签(${serviceTags.length}个)`}>
                  <FormText>{serviceTags.join(" ; ") || "-"}</FormText>
                </FormItem>
                <FormItem label={"描述"}>
                  <FormText>{data.comment || "-"}</FormText>
                </FormItem>
                <FormItem label={"就近访问"}>
                  <FormText>
                    {data.metadata?.[enableNearbyString] ? "开启" : "关闭"}
                  </FormText>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
