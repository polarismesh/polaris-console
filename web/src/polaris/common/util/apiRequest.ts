import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { notification } from "tea-component";
import tips from "./tips";
import { delay } from "redux-saga";

export interface APIRequestOption {
  action: string;
  data?: any;
  opts?: AxiosRequestConfig;
}
export interface ApiResponse {
  code: number;
  message: string;
}

export async function apiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options;
  try {
    tips.showLoading({});
    const res = (await axios
      .post<T & ApiResponse>(action, data, {
        ...opts,
      })
      .catch(function (error) {
        if (error.response) {
          notification.error({
            title: "请求错误",
            description: error.response?.data?.info,
          });
        }
      })) as AxiosResponse<T & ApiResponse>;
    console.log(res);
    return res.data;
  } catch (e) {
    console.error(e);
  } finally {
    tips.hideLoading();
  }
}
export async function getApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options;
  try {
    tips.showLoading({});
    const res = await axios.get<T & ApiResponse>(action, {
      params: data,
      ...opts,
    });
    if (res.status >= 400) {
      throw res;
    }
    return res.data;
  } catch (e) {
    notification.error(e);
    console.error(e);
  } finally {
    tips.hideLoading();
  }
}
export async function putApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options;
  try {
    tips.showLoading({});
    const res = await axios.put<T & ApiResponse>(action, data, {
      ...opts,
    });
    if (res.status >= 400) {
      throw res.data;
    }
    return res.data;
  } catch (e) {
    console.error(e);
  } finally {
    tips.hideLoading();
  }
}
/**
 * 获取所有的列表
 * @param fetchFun 模板函数需要支持pageNo,pageSize参数
 * @param listKey 返回结果中列表的键名称 默认list
 */
export function getAllList<
  TParam extends { pageNo?: number; pageSize?: number },
  TResult
>(
  fetchFun: (
    params?: TParam
  ) => Promise<{ [list: string]: Array<TResult> } | { totalCount: number }>,
  listKey = "list"
) {
  return async function (params: TParam) {
    let allList = [],
      pageNo = 1;
    const pageSize = 50;
    while (true) {
      // 每次获取获取50条
      params = { ...params, pageNo, pageSize };

      const result = await fetchFun({
        ...params,
        pageNo,
        pageSize,
      } as TParam);

      allList = allList.concat(result[listKey]);

      if (allList.length >= result.totalCount) {
        // 返回
        break;
      } else {
        pageNo++;
      }
    }
    return {
      list: allList,
      totalCount: allList.length,
    };
  };
}
