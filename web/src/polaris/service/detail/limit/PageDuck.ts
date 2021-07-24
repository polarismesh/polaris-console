import { createToPayload, reduceFromPayload } from "saga-duck";
import GridPageDuck, {
  Filter as BaseFilter,
} from "@src/polaris/common/ducks/GridPage";
import {
  describeLimitRules,
  LimitRange,
  RateLimit,
  LimitResource,
  LimitType,
  deleteRateLimit,
  modifyRateLimit,
} from "./model";
import { takeLatest } from "redux-saga-catch";
import { resolvePromise } from "saga-duck/build/helper";
import { showDialog } from "@src/polaris/common/helpers/showDialog";
// import Create from "./operations/Create";
// import CreateDuck from "./operations/CreateDuck";
import { put, select } from "redux-saga/effects";
import { Modal } from "tea-component";
import router from "@src/polaris/common/util/router";

interface Filter extends BaseFilter {
  namespace: string;
  service: string;
  limitRange: LimitRange;
}

interface ComposedId {
  name: string;
  namespace: string;
}
export default class ServicePageDuck extends GridPageDuck {
  Filter: Filter;
  Item: any;
  get baseUrl() {
    return null;
  }
  get quickTypes() {
    enum Types {
      SET_CUSTOM_FILTERS,
      EDIT,
      REMOVE,
      CREATE,
      SET_SELECTION,
      SET_EXPANDED_KEYS,
      SET_LIMIT_RANGE,
      SET_ROUTE_DATA,
      TOGGLE_STATUS,
      LOAD,
    }
    return {
      ...super.quickTypes,
      ...Types,
    };
  }
  get initialFetch() {
    return false;
  }
  get recordKey() {
    return "id";
  }
  get watchTypes() {
    return [
      ...super.watchTypes,
      this.types.SEARCH,
      this.types.LOAD,
      this.types.SET_LIMIT_RANGE,
    ];
  }
  get params() {
    return [...super.params];
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
    };
  }
  get reducers() {
    const { types } = this;
    return {
      ...super.reducers,
      data: reduceFromPayload<ComposedId>(types.LOAD, {} as any),
      expandedKeys: reduceFromPayload<string[]>(types.SET_EXPANDED_KEYS, []),
      limitRange: reduceFromPayload<LimitRange>(
        types.SET_LIMIT_RANGE,
        LimitRange.LOCAL
      ),
      selection: reduceFromPayload<string[]>(types.SET_SELECTION, []),
    };
  }
  get creators() {
    const { types } = this;
    return {
      ...super.creators,
      edit: createToPayload<RateLimit>(types.EDIT),
      remove: createToPayload<string[]>(types.REMOVE),
      create: createToPayload<void>(types.CREATE),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEYS),
      setSelection: createToPayload<string[]>(types.SET_SELECTION),
      load: createToPayload<ComposedId>(types.LOAD),
      setLimitRange: createToPayload<LimitRange>(types.SET_LIMIT_RANGE),
      toggleStatus: createToPayload<RateLimit>(types.TOGGLE_STATUS),
    };
  }
  get rawSelectors() {
    type State = this["State"];
    return {
      ...super.rawSelectors,
      filter: (state: State) => ({
        page: state.page,
        count: state.count,
        keyword: state.keyword,
        service: state.data.name,
        namespace: state.data.namespace,
        limitRange: state.limitRange,
      }),
    };
  }

  *saga() {
    const { types, creators, selector, ducks } = this;
    yield* this.sagaInitLoad();
    yield* super.saga();
    yield takeLatest(types.CREATE, function* () {
      const {
        data: { name, namespace },
      } = selector(yield select());
      router.navigate(
        `/ratelimit-create?service=${name}&namespace=${namespace}`
      );
    });
    yield takeLatest(types.EDIT, function* (action) {
      const {
        data: { name, namespace },
      } = selector(yield select());
      const { id } = action.payload;
      router.navigate(
        `/ratelimit-create?service=${name}&namespace=${namespace}&ruleId=${id}`
      );
    });

    yield takeLatest(types.REMOVE, function* (action) {
      const deleteList = action.payload;

      const confirm = yield Modal.confirm({
        message: `确认删除限流规则`,
        description: "删除后，无法恢复",
      });
      if (confirm) {
        yield deleteRateLimit(deleteList.map((id) => ({ id })));
        yield put(creators.reload());
      }
    });
    yield takeLatest(types.TOGGLE_STATUS, function* (action) {
      const item = action.payload;
      const param = {
        ...item,
        disable: !item.disable,
        ctime: undefined,
        mtime: undefined,
        revision: undefined,
      };

      yield modifyRateLimit([param]);
      yield put(creators.reload());
    });
  }

  *sagaInitLoad() {
    const { ducks } = this;
  }
  async getData(filters: this["Filter"]) {
    const { page, count, namespace, service } = filters;
    const result = await describeLimitRules({
      namespace,
      service,
      offset: (page - 1) * count,
      limit: count,
    });
    result.list = result.list.map((item) => ({
      ...item,
      //太怪了，这里如果没有disable字段，代表是启用状态，我晕了
      disable: item.disable === true ? true : false,
    }));
    return result;
  }
}
