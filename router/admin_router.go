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
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/model"
	"github.com/polarismesh/polaris-console/handlers"
)

// AdminRouter 路由请求
func AdminRouter(webSvr *gin.Engine, config *bootstrap.Config) {
	// 后端server路由组
	v1 := webSvr.Group("/admin/v1")
	v1.GET("/apidocs.json", handlers.ReverseProxyNoAuthForServer(&config.PolarisServer, config))
	v1.GET("/functions", handlers.DescribeFunctuionList())
	v1.GET("/console/ability", func(ctx *gin.Context) {
		futures := strings.Split(config.Futures, ",")
		resp := model.Response{
			Code: 200000,
			Info: "success",
			Data: futures,
		}
		ctx.JSON(http.StatusOK, resp)
	})

	// 后端server路由组
	admin := webSvr.Group("/maintain/v1")
	admin.GET("/server/functions", handlers.ReverseProxyNoAuthForServer(&config.PolarisServer, config))
	admin.GET("/mainuser/exist", handlers.ReverseHandleAdminUserExist(&config.PolarisServer, config))
	admin.POST("/mainuser/create", handlers.ReverseProxyNoAuthForServer(&config.PolarisServer, config))
	admin.GET("/bootstrap/config", handlers.ReverseHandleBootstrap(&config.PolarisServer, config))
}
