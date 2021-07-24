import DetailPage from "@src/polaris/common/ducks/DetailPage";
import { ComposedId } from "../types";
import { reduceFromPayload, createToPayload } from "saga-duck";
import { Service } from "../../types";
import { describeServices } from "../../model";

export default class BaseInfoDuck extends DetailPage {
  get baseUrl() {
    return null;
  }
  Data: Service;
  ComposedId: ComposedId;
  get initialFetch() {
    return false;
  }

  get watchTypes() {
    return [...super.watchTypes, this.types.LOAD];
  }
  get quickTypes() {
    enum Types {
      LOAD,
    }
    return {
      ...super.quickTypes,
      ...Types,
    };
  }
  get reducers() {
    const { types } = this;
    return {
      ...super.reducers,
      composedId: reduceFromPayload(types.LOAD, {} as ComposedId),
    };
  }
  get creators() {
    const { types } = this;
    return {
      ...super.creators,
      load: createToPayload<ComposedId>(types.LOAD),
    };
  }
  get rawSelectors() {
    type State = this["State"];
    return {
      ...super.rawSelectors,
      composedId: (state: State) => state.composedId,
    };
  }
  *saga() {
    yield* super.saga();
  }
  async getData(param: this["ComposedId"]) {
    const { name, namespace } = param;

    const res = await describeServices({
      name,
      namespace,
      offset: 0,
      limit: 10,
    });
    return res.list?.[0];
  }
}
