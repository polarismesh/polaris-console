import DynamicDuck from "@src/polaris/common/ducks/DynamicDuck";
import Fetcher from "@src/polaris/common/ducks/Fetcher";
import { MetricQuerySet } from "./PageDuck";
import { getMonitorData, GetMonitorDataParams } from "./models";
import moment from "moment";

export interface DataPoint {
  time: string;
  value: number;
}
export class DynamicMonitorFetcherDuck extends DynamicDuck {
  get ProtoDuck() {
    return MonitorFetcher;
  }
}

class MonitorFetcher extends Fetcher {
  Data: Array<DataPoint>;
  Param: GetMonitorDataParams;
  fetchConfigsKey: string;
  async getDataAsync(param: this["Param"]) {
    const res = await getMonitorData(param);
    if (res.length === 0) return [];
    const convertedData = res[0].values.map((item) => {
      const [time, value] = item;
      const timeString = moment(time * 1000).format("YYYY-MM-DD HH:mm:ss");
      return {
        time: timeString,
        value: Number(value),
      };
    });
    return convertedData;
  }
}
