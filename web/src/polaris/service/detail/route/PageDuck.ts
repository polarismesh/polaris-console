import { createToPayload, reduceFromPayload } from "saga-duck";
import GridPageDuck, {
  Filter as BaseFilter,
} from "@src/polaris/common/ducks/GridPage";
import {
  RuleType,
  Destination,
  Source,
  InboundItem,
  OutboundItem,
} from "./types";
import {
  describeRoutes,
  DescribeRoutesResult,
  DescribeRoutesParams,
  modifyRoutes,
} from "./model";
import { takeLatest } from "redux-saga-catch";
import { resolvePromise } from "saga-duck/build/helper";
import { showDialog } from "@src/polaris/common/helpers/showDialog";
import Create from "./operations/Create";
import CreateDuck from "./operations/CreateDuck";
import { put, select } from "redux-saga/effects";
import { Modal } from "tea-component";
import router from "@src/polaris/common/util/router";

interface Filter extends BaseFilter {
  namespace: string;
  service: string;
  ruleType: RuleType;
  routeData: DescribeRoutesResult;
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
      SET_RULE_TYPE,
      SET_ROUTE_DATA,
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
      this.types.SET_RULE_TYPE,
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
      ruleType: reduceFromPayload<RuleType>(
        types.SET_RULE_TYPE,
        RuleType.Inbound
      ),
      routeData: reduceFromPayload<DescribeRoutesResult>(
        types.SET_ROUTE_DATA,
        null
      ),
    };
  }
  get creators() {
    const { types } = this;
    return {
      ...super.creators,
      edit: createToPayload<void>(types.EDIT),
      remove: createToPayload<number>(types.REMOVE),
      create: createToPayload<void>(types.CREATE),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEYS),
      load: createToPayload<ComposedId>(types.LOAD),
      setRuleType: createToPayload<RuleType>(types.SET_RULE_TYPE),
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
        ruleType: state.ruleType,
        routeData: state.routeData,
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
      router.navigate(`/route-create?service=${name}&namespace=${namespace}`);
    });
    yield takeLatest(types.EDIT, function* (action) {
      const {
        data: { name, namespace },
        ruleType,
      } = selector(yield select());
      const ruleIndex = action.payload;
      router.navigate(
        `/route-create?service=${name}&namespace=${namespace}&ruleIndex=${ruleIndex}&ruleType=${ruleType}`
      );
    });
    // yield takeLatest(types.REMOVE, function* (action) {
    //   const ids = action.payload;
    //   const confirm = yield Modal.confirm({
    //     message: `确认删除实例`,
    //     description: "删除后，无法恢复",
    //   });
    //   if (confirm) {
    //     const res = yield deleteInstances(ids.map((id) => ({ id })));
    //   }
    //   yield put(creators.reload());
    // });
    yield takeLatest(ducks.grid.types.FETCH_DONE, function* (action) {
      const { routeData } = action.payload;
      yield put({ type: types.SET_ROUTE_DATA, payload: routeData });
    });
    yield takeLatest(types.REMOVE, function* (action) {
      const removeIndex = action.payload;
      const { routeData, ruleType } = selector(yield select());
      const routing = routeData[0];
      routing[ruleType].splice(removeIndex, 1);
      const params = [
        {
          ...routing,
          ctime: undefined,
          mtime: undefined,
          revision: undefined,
          [ruleType]: routing[ruleType],
        },
      ];
      const confirm = yield Modal.confirm({
        message: `确认删除路由规则`,
        description: "删除后，无法恢复",
      });
      if (confirm) {
        yield modifyRoutes(params);
        yield put(creators.reload());
      }
    });
  }

  *sagaInitLoad() {
    const { ducks } = this;
  }
  async getData(filters: this["Filter"]) {
    const { page, count, namespace, service, ruleType, routeData } = filters;
    const result = await describeRoutes({
      namespace,
      service,
    });
    if (!result?.[0]) {
      return {
        totalCount: 0,
        list: [],
      };
    }
    const data = result[0];
    const offset = (page - 1) * count;
    const listSlice = data[ruleType]?.slice(offset, offset + count + 1) || [];
    return {
      totalCount: data[ruleType]?.length || 0,
      list: listSlice.map((item, index) => ({ ...item, id: offset + index })),
      routeData: result,
    };
  }
}
