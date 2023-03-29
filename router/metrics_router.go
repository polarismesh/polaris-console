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

package router

import (
	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/handlers"
)

// MetricsRouter 路由请求
func MetricsRouter(webSvr *gin.Engine, config *bootstrap.Config) {
	// 后端server路由组
	v1 := webSvr.Group("/metrics/v1")
	v1.GET("/labels", handlers.DescribeMetricLabels())
	v1.GET("/server/interfaces", handlers.DescribeRequestInterface(&config.PolarisServer, config))
	v1.GET("/server/nodes", handlers.DescribeServerNodes(&config.PolarisServer, config))
	v1.GET("/services", handlers.DescribeServicesMetric(&config.PolarisServer, config))
	v1.GET("/services/interfaces", handlers.DescribeServiceInterfacesMetric(&config.PolarisServer, config))
	v1.GET("/services/instances", handlers.DescribeServiceInstancesMetric(&config.PolarisServer, config))
	v1.GET("/callers", handlers.DescribeServiceCallerMetric(&config.PolarisServer, config))
	v1.GET("/services/instances/list", handlers.DescribeServiceInstances(config))
}
