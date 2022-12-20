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

func LogRouter(r *gin.Engine, config *bootstrap.Config) {
	logUrl := config.WebServer.LogURL
	if "" == logUrl {
		logUrl = "/log/v1"
	}
	// 后端server路由组
	v1 := r.Group(logUrl)
	// 创建命名空间
	v1.GET("/event/history", handlers.DescribeEventLog(config))
	// 创建服务
	v1.GET("/event/types", handlers.DescribeEventTypes(config))
	// 创建命名空间
	v1.GET("/operation/history", handlers.DescribeOperationHistoryLog(config))
	// 创建服务
	v1.GET("/operation/types", handlers.DescribeOperationTypes(config))
	// 创建服务
	v1.GET("/operation/resource/types", handlers.DescribeOperationResourceTypes(config))
}
