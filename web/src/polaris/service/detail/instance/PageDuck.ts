import { createToPayload, reduceFromPayload } from "saga-duck";
import GridPageDuck, {
  Filter as BaseFilter,
} from "@src/polaris/common/ducks/GridPage";
import {
  Instance,
  HEALTH_STATUS,
  ISOLATE_STATUS,
  BATCH_EDIT_TYPE,
} from "./types";
import { describeInstances, deleteInstances } from "./model";
import { takeLatest } from "redux-saga-catch";
import { resolvePromise } from "saga-duck/build/helper";
import { showDialog } from "@src/polaris/common/helpers/showDialog";
// import Create from "./operation/Create";
// import CreateDuck from "./operation/CreateDuck";
import { put, select } from "redux-saga/effects";
import CreateDuck from "./operations/CreateDuck";
import Create from "./operations/Create";
import { data } from "jquery";
import { Modal } from "tea-component";

export const EmptyCustomFilter = {
  host: "",
  port: null,
  weight: null,
  protocol: "",
  version: "",
  keys: "",
  values: "",
  healthy: "true",
  isolate: null,
};

interface Filter extends BaseFilter {
  namespace: string;
  service: string;
  host?: string;
  port?: number;
  weight?: number;
  protocol?: string;
  version?: string;
  metadata?: string;
  healthy?: boolean;
  isolate?: boolean;
  customFilters: CustomFilters;
}
interface CustomFilters {
  host?: string;
  port?: number;
  weight?: number;
  protocol?: string;
  version?: string;
  metadata?: string;
  healthy?: any;
  isolate?: any;
}
interface ComposedId {
  name: string;
  namespace: string;
}
export default class ServicePageDuck extends GridPageDuck {
  Filter: Filter;
  Item: Instance;
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
      SET_NAMESPACE_LIST,
      SET_EXPANDED_KEYS,
      MODIFY_WEIGHT,
      MODIFY_HEALTH_STATUS,
      MODIFY_ISOLATE_STATUS,
      LOAD,
      SET_LAST_SEARCH_PARAMS
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
    return [...super.watchTypes, this.types.SEARCH, this.types.LOAD];
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
      customFilters: reduceFromPayload<CustomFilters>(
        types.SET_CUSTOM_FILTERS,
        EmptyCustomFilter
      ),
      selection: reduceFromPayload<string[]>(types.SET_SELECTION, []),
      lastSearchParams: reduceFromPayload<string>(types.SET_LAST_SEARCH_PARAMS, ''),
      expandedKeys: reduceFromPayload<string[]>(
        types.SET_EXPANDED_KEYS,
        new Array(100).map((i, index) => index.toString())
      ),
    };
  }
  get creators() {
    const { types } = this;
    return {
      ...super.creators,
      setCustomFilters: createToPayload<CustomFilters>(
        types.SET_CUSTOM_FILTERS
      ),
      edit: createToPayload<Instance>(types.EDIT),
      remove: createToPayload<string[]>(types.REMOVE),
      create: createToPayload<void>(types.CREATE),
      setSelection: createToPayload<string[]>(types.SET_SELECTION),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEYS),
      load: createToPayload<ComposedId>(types.LOAD),
      modifyWeight: createToPayload<Instance[]>(types.MODIFY_WEIGHT),
      modifyHealthStatus: createToPayload<Instance[]>(
        types.MODIFY_HEALTH_STATUS
      ),
      modifyIsolateStatus: createToPayload<Instance[]>(
        types.MODIFY_ISOLATE_STATUS
      ),
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
        customFilters: state.customFilters,
      }),
      customFilters: (state: State) => state.customFilters,
      selection: (state: State) => state.selection,
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
      const res = yield* resolvePromise(
        new Promise((resolve) => {
          showDialog(Create, CreateDuck, function* (duck: CreateDuck) {
            try {
              resolve(
                yield* duck.execute(
                  {},
                  { isModify: false, service: name, namespace }
                )
              );
            } finally {
              resolve(false);
            }
          });
        })
      );
      if (res) {
        yield put(creators.reload());
      }
    });
    yield takeLatest(types.EDIT, function* (action) {
      const {
        data: { name, namespace },
      } = selector(yield select());
      const data = action.payload;
      const res = yield* resolvePromise(
        new Promise((resolve) => {
          showDialog(Create, CreateDuck, function* (duck: CreateDuck) {
            try {
              resolve(
                yield* duck.execute(data, {
                  isModify: true,
                  service: name,
                  namespace,
                  instance: data,
                })
              );
            } finally {
              resolve(false);
            }
          });
        })
      );
      if (res) {
        yield put(creators.reload());
      }
    });
    yield takeLatest(ducks.grid.types.FETCH_DONE,function*(action){
      const {searchParams,list} = action.payload
      const {selection} = selector(yield select())
      const validSelection = selection.filter(id=>!!list.find(item=>item.id===id))
      yield put(creators.setSelection(validSelection))
      yield put({type:types.SET_LAST_SEARCH_PARAMS,payload: JSON.stringify(searchParams)})
    })
    yield takeLatest(
      [
        types.MODIFY_ISOLATE_STATUS,
        types.MODIFY_HEALTH_STATUS,
        types.MODIFY_WEIGHT,
      ],
      function* (action) {
        const batchEditType =
          action.type === types.MODIFY_WEIGHT
            ? BATCH_EDIT_TYPE.WEIGHT
            : action.type === types.MODIFY_ISOLATE_STATUS
            ? BATCH_EDIT_TYPE.ISOLATE
            : BATCH_EDIT_TYPE.HEALTHY;
        const {
          data: { name, namespace },
        } = selector(yield select());
        const list = ducks.grid.selectors.list(yield select());
        const ids = action.payload;
        const instances = ids.map((id) =>
          list.find((instance) => instance.id === id)
        );
        const res = yield* resolvePromise(
          new Promise((resolve) => {
            showDialog(Create, CreateDuck, function* (duck: CreateDuck) {
              try {
                resolve(
                  yield* duck.execute(instances[0], {
                    isModify: true,
                    service: name,
                    namespace,
                    batchEditType,
                    instance: instances[0],
                    instances,
                  })
                );
              } finally {
                resolve(false);
              }
            });
          })
        );
        if (res) {
          yield put(creators.reload());
        }
      }
    );
    yield takeLatest(types.REMOVE, function* (action) {
      const ids = action.payload;
      const confirm = yield Modal.confirm({
        message: `确认删除实例`,
        description: "删除后，无法恢复",
      });
      if (confirm) {
        const res = yield deleteInstances(ids.map((id) => ({ id })));
        yield put(creators.reload());
      }
    });
  }

  *sagaInitLoad() {
    const { ducks } = this;
  }
  async getData(filters: this["Filter"]) {
    const {
      page,
      count,
      namespace,
      service,
      customFilters: {
        host,
        port,
        weight,
        protocol,
        version,
        healthy,
        isolate,
        metadata,
      },
    } = filters;
    const [keys, values] = (metadata || "").split(":");
    const searchParams = {
      limit: count,
      offset: (page - 1) * count,
      namespace,
      service,
      host: host || undefined,
      port: port || undefined,
      weight: weight || undefined,
      protocol: protocol || undefined,
      version: version || undefined,
      healthy: healthy === "" ? undefined : healthy,
      isolate: isolate === "" ? undefined : isolate,
      keys: keys || undefined,
      values: values || undefined,
    }
    const result = await describeInstances(searchParams);
    return {
      totalCount: result.totalCount,
      list: result.list || [],
      searchParams
    };
  }
}
