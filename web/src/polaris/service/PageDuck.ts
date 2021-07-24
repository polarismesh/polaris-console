import { createToPayload, reduceFromPayload } from "saga-duck";
import GridPageDuck, { Filter as BaseFilter } from "../common/ducks/GridPage";
import { Service, Namespace } from "./types";
import { describeServices, describeNamespaces, deleteService } from "./model";
import { takeLatest } from "redux-saga-catch";
import { resolvePromise } from "saga-duck/build/helper";
import { showDialog } from "../common/helpers/showDialog";
import Create from "./operation/Create";
import CreateDuck from "./operation/CreateDuck";
import { put } from "redux-saga/effects";
import { Modal } from "tea-component";

export const EmptyCustomFilter = {
  namespace: "",
  serviceName: "",
  instanceIp: "",
  serviceTag: "",
  searchMethod: "accurate",
  department: "",
  business: "",
};

interface Filter extends BaseFilter {
  namespace: string;
  serviceName: string;
  instanceIp: string;
  serviceTag: string;
  searchMethod?: string;
  department?: string;
  business?: string;
}
interface CustomFilters {
  namespace?: string;
  serviceName?: string;
  instanceIp?: string;
  serviceTag?: string;
  searchMethod?: string;
  department?: string;
  business?: string;
}
export interface NamespaceItem extends Namespace {
  text: string;
  value: string;
}
export interface ServiceItem extends Service {
  id: string;
}
export default class ServicePageDuck extends GridPageDuck {
  Filter: Filter;
  Item: ServiceItem;
  get baseUrl() {
    return "/#/service";
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
    return [...super.watchTypes, this.types.SEARCH];
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
      customFilters: reduceFromPayload<CustomFilters>(
        types.SET_CUSTOM_FILTERS,
        EmptyCustomFilter
      ),
      selection: reduceFromPayload<string[]>(types.SET_SELECTION, []),
      namespaceList: reduceFromPayload<NamespaceItem[]>(
        types.SET_NAMESPACE_LIST,
        []
      ),
      expandedKeys: reduceFromPayload<string[]>(types.SET_EXPANDED_KEYS, []),
    };
  }
  get creators() {
    const { types } = this;
    return {
      ...super.creators,
      setCustomFilters: createToPayload<CustomFilters>(
        types.SET_CUSTOM_FILTERS
      ),
      edit: createToPayload<Service>(types.EDIT),
      remove: createToPayload<string[]>(types.REMOVE),
      create: createToPayload<void>(types.CREATE),
      setSelection: createToPayload<string[]>(types.SET_SELECTION),
      setExpandedKeys: createToPayload<string[]>(types.SET_EXPANDED_KEYS),
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
        namespace: state.customFilters.namespace,
        serviceName: state.customFilters.serviceName,
        instanceIp: state.customFilters.instanceIp,
        serviceTag: state.customFilters.serviceTag,
        searchMethod: state.customFilters.searchMethod,
      }),
      customFilters: (state: State) => state.customFilters,
      selection: (state: State) => state.selection,
      namespaceList: (state: State) => state.namespaceList,
    };
  }
  *loadNamespaceList() {
    const namespaceList = yield describeNamespaces();
    yield put({
      type: this.types.SET_NAMESPACE_LIST,
      payload: namespaceList.map((item) => ({
        ...item,
        text: item.name,
        value: item.name,
      })),
    });
  }

  *saga() {
    const { types, creators } = this;
    yield* this.sagaInitLoad();
    yield* super.saga();
    yield* this.loadNamespaceList();
    yield takeLatest(types.CREATE, function* () {
      const res = yield* resolvePromise(
        new Promise((resolve) => {
          showDialog(Create, CreateDuck, function* (duck: CreateDuck) {
            try {
              resolve(yield* duck.execute({}, { isModify: false }));
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
      const data = action.payload;
      const res = yield* resolvePromise(
        new Promise((resolve) => {
          showDialog(Create, CreateDuck, function* (duck: CreateDuck) {
            try {
              resolve(yield* duck.execute(data, { isModify: true }));
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
    yield takeLatest(types.REMOVE, function* (action) {
      const data = action.payload;
      const params = data.map((item) => {
        const [namespace, name] = item.split("#");
        return { namespace, name };
      });
      const confirm = yield Modal.confirm({
        message: `确认删除服务`,
        description: "删除后，无法恢复",
      });
      if (confirm) {
        const res = yield deleteService(params);
        console.log(res);
      }
      yield put(creators.reload());
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
      serviceTag,
      instanceIp,
      searchMethod,
      department,
      business,
    } = filters;
    const [keys, values] = serviceTag.split(":");
    let serviceName = filters.serviceName;
    if (searchMethod === "vague" && serviceName) {
      serviceName = serviceName + "*";
    }
    const result = await describeServices({
      limit: count,
      offset: (page - 1) * count,
      namespace: namespace || undefined,
      name: serviceName || undefined,
      keys: keys || undefined,
      values: values || undefined,
      host: instanceIp || undefined,
      department: department || undefined,
      business: business || undefined,
    });
    return {
      totalCount: result.totalCount,
      list:
        result.list?.map((item) => ({
          ...item,
          id: `${item.namespace}#${item.name}`,
        })) || [],
    };
  }
}
