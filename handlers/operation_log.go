/**
 * Tencent is pleased to support the open source community by making Polaris available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	httpcommon "github.com/polarismesh/polaris-console/common/http"
	"github.com/polarismesh/polaris-console/common/model"
)

// Resource 操作资源
type Resource string

// 定义包含的资源类型
const (
	RNamespace         Resource = "Namespace"
	RService           Resource = "Service"
	RRouting           Resource = "Routing"
	RCircuitBreaker    Resource = "CircuitBreaker"
	RInstance          Resource = "Instance"
	RRateLimit         Resource = "RateLimit"
	RUser              Resource = "User"
	RUserGroup         Resource = "UserGroup"
	RUserGroupRelation Resource = "UserGroupRelation"
	RAuthStrategy      Resource = "AuthStrategy"
	RConfigGroup       Resource = "ConfigGroup"
	RConfigFile        Resource = "ConfigFile"
	RConfigFileRelease Resource = "ConfigFileRelease"
)

// OperationType 操作类型
type OperationType string

// 定义包含的操作类型
const (
	// OCreate 新建
	OCreate OperationType = "Create"
	// ODelete 删除
	ODelete OperationType = "Delete"
	// OUpdate 更新
	OUpdate OperationType = "Update"
	// OUpdateIsolate 更新隔离状态
	OUpdateIsolate OperationType = "UpdateIsolate"
	// OUpdateToken 更新token
	OUpdateToken OperationType = "UpdateToken"
	// OUpdateGroup 更新用户-用户组关联关系
	OUpdateGroup OperationType = "UpdateGroup"
	// OEnableRateLimit 更新启用状态
	OUpdateEnable OperationType = "UpdateEnable"
)

var (
	_resourceTypeInfos = map[string]string{
		string(RNamespace):         "命名空间",
		string(RService):           "服务",
		string(RInstance):          "服务实例",
		string(RRouting):           "路由规则",
		string(RRateLimit):         "限流规则",
		string(RCircuitBreaker):    "熔断规则",
		string(RUser):              "用户",
		string(RUserGroup):         "用户组",
		string(RAuthStrategy):      "鉴权策略",
		string(RConfigGroup):       "配置分组",
		string(RConfigFile):        "配置文件",
		string(RConfigFileRelease): "配置发布",

		string(OCreate):        "创建",
		string(ODelete):        "删除",
		string(OUpdate):        "更新",
		string(OUpdateIsolate): "更新实例隔离状态",
		string(OUpdateGroup):   "更新用户组",
		string(OUpdateEnable):  "更新启用状态",
	}

	_searchOperationLogParams = map[string]struct{}{
		"namespace":        {},
		"resource_type":    {},
		"resource_name":    {},
		"operation_type":   {},
		"operator":         {},
		"operation_detail": {},
		"start_time":       {},
		"end_time":         {},
		"limit":            {},
		"offset":           {},
		"extend_info":      {},
	}
)

type OperationLogResponse struct {
	Code       uint32            `json:"code"`
	Info       string            `json:"info"`
	Total      uint64            `json:"total"`
	Size       uint32            `json:"size"`
	HasNext    bool              `json:"has_next"`
	Data       []OperationRecord `json:"data,omitempty"`
	ExtendInfo string            `json:"extend_info,omitempty"`
}

type OperationRecord struct {
	ResourceType    string `json:"resource_type"`
	ResourceName    string `json:"resource_name"`
	Namespace       string `json:"namespace"`
	OperationType   string `json:"operation_type"`
	Operator        string `json:"operator"`
	OperationDetail string `json:"operation_detail"`
	HappenTime      string `json:"happen_time"`
}

func DescribeOperationHistoryLog(conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if !verifyAccessPermission(ctx, conf) {
			return
		}
		if len(conf.OperationServer.RequestURL) == 0 {
			ctx.JSON(http.StatusOK, model.QueryResponse{
				Code:     200000,
				Size:     0,
				Amount:   0,
				HashNext: false,
			})
			return
		}
		reader, err := GetHistoryLogReader(conf)
		if err != nil {
			ctx.JSON(http.StatusNotFound, model.Response{
				Code: 400404,
				Info: err.Error(),
			})
			return
		}
		if reader == nil {
			ctx.JSON(http.StatusOK, model.Response{
				Code: 200000,
				Info: "success",
			})
			return
		}

		filters := httpcommon.ParseQueryParams(ctx.Request)
		param, err := parseHttpQueryToSearchParams(filters, _searchOperationLogParams)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, model.Response{
				Code: 400000,
				Info: err.Error(),
			})
			return
		}

		resp := &OperationLogResponse{}
		if err := reader.Query(context.Background(), param, resp); err != nil {
			ctx.JSON(http.StatusInternalServerError, model.Response{
				Code: 500000,
				Info: err.Error(),
			})
			return
		}

		ctx.JSON(http.StatusOK, resp)
		return
	}
}

// DescribeOperationTypes describe operation type desc list
func DescribeOperationTypes(conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ret := make([]TypeInfo, 0, len(_resourceTypeInfos))
		for k, v := range _resourceTypeInfos {
			ret = append(ret, TypeInfo{
				Type: string(k),
				Desc: v,
			})
		}

		ctx.JSON(http.StatusOK, model.Response{
			Code: 200000,
			Info: "success",
			Data: ret,
		})
	}
}
