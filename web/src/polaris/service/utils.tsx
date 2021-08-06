import { READ_ONLY_NAMESPACE } from "./types";
import { Modal, Table } from "tea-component";
import React from "react";
import { scrollable } from "tea-component/lib/table/addons";
import LabelTable from "../common/components/LabelTable";

export const isReadOnly = (namespace: string) => {
  return READ_ONLY_NAMESPACE.indexOf(namespace) !== -1;
};

export const showAllLabels = (labels) => {
  Modal.confirm({
    message: `标签展示`,
    description: (
      <>
        <LabelTable labels={labels}></LabelTable>
      </>
    ),
  });
};
