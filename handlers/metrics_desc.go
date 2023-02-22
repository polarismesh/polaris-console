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

var (
	metricLabelsDescriptions = []Description{}

	interfacesDescriptions = []Description{
		{
			Name: "/v1/RegisterInstance",
			Desc: "注册服务实例",
			Type: "Register",
			QueryLabels: []string{
				"POST:/v1/RegisterInstance", "/v1.PolarisGRPC/RegisterInstance", "POST:/eureka/apps/{application}",
			},
		},
		{
			Name: "/v1/DeregisterInstance",
			Desc: "反注册服务实例",
			Type: "Register",
			QueryLabels: []string{
				"POST:/v1/DeregisterInstance", "/v1.PolarisGRPC/DeregisterInstance", "DELETE:/eureka/apps/{application}/{instanceId}",
			},
		},
		{
			Name: "/v1/ReportClient",
			Desc: "上报客户端",
			Type: "Register",
			QueryLabels: []string{
				"POST:/v1/ReportClient", "/v1.PolarisGRPC/ReportClient",
			},
		},
		{
			Name: "/v1/Heartbeat",
			Desc: "上报实例心跳",
			Type: "HealthCheck",
			QueryLabels: []string{
				"POST:/v1/Heartbeat", "/v1.PolarisGRPC/Heartbeat", "PUT:/eureka/apps/{application}/{instanceId}",
			},
		},
		{
			Name: "/v1/Discover",
			Desc: "服务发现",
			Type: "Discovery",
			QueryLabels: []string{
				"POST:/v1/Discover", "/v1.PolarisGRPC/Discover", "GET:/eureka/apps", "GET:/eureka/apps/{application}", "GET:/eureka/apps/{application}/{instanceId}",
			},
		},
		{
			Name:        "/config/v1/GetConfigFile",
			Desc:        "获取单个配置文件",
			Type:        "Config",
			QueryLabels: []string{"GET:/config/v1/GetConfigFile", "/v1.PolarisConfigGRPC/GetConfigFile"},
		},
		{
			Name:        "/config/v1/WatchConfigFile",
			Desc:        "监听配置文件",
			Type:        "Config",
			QueryLabels: []string{"GET:/config/v1/WatchConfigFile", "/v1.PolarisConfigGRPC/WatchConfigFiles"},
		},
	}
)
