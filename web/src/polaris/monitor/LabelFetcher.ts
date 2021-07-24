import DynamicDuck from "@src/polaris/common/ducks/DynamicDuck";
import Fetcher from "@src/polaris/common/ducks/Fetcher";
import { getLabelData, GetLabelDataParams } from "./models";
import { SelectOptionWithGroup } from "tea-component";
import { OptionSumKey } from "./types";

export class DynamicLabelFetcher extends DynamicDuck {
  get ProtoDuck() {
    return LabelFetcher;
  }
}

class LabelFetcher extends Fetcher {
  Data: Array<SelectOptionWithGroup>;
  Param: GetLabelDataParams;
  fetchConfigsKey: string;
  async getDataAsync(param: this["Param"]) {
    const res = await getLabelData(param);
    if (res.length === 0) return [];
    const options = res.map((value) => ({ text: value, value }));
    return options;
  }
}
