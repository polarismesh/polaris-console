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

package operation

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
	ResourceTypeInfos = map[string]string{
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
	}

	OperationTypeInfos = map[string]string{
		string(OCreate):        "创建",
		string(ODelete):        "删除",
		string(OUpdate):        "更新",
		string(OUpdateIsolate): "更新实例隔离状态",
		string(OUpdateGroup):   "更新用户组",
		string(OUpdateEnable):  "更新启用状态",
	}
)
