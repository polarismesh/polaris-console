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

// ConfigRouter 路由请求
func ConfigRouter(r *gin.Engine, config *bootstrap.Config) {
	// 配置中心
	configV1 := r.Group(config.WebServer.ConfigURL)
	// 配置文件组
	configV1.POST("configfilegroups", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	configV1.GET("configfilegroups", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	configV1.DELETE("configfilegroups", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	configV1.PUT("configfilegroups", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 配置文件
	configV1.POST("configfiles", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	configV1.GET("configfiles", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	configV1.GET("configfiles/by-group", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	configV1.GET("configfiles/search", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	configV1.PUT("configfiles", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	configV1.DELETE("configfiles", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	configV1.DELETE("configfiles/batchdelete", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 发布配置文件
	configV1.POST("configfiles/release", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 查询单个配置发布信息
	configV1.GET("configfiles/release", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 查询配置发布列表
	configV1.GET("configfiles/releases", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 配置发布回滚
	configV1.PUT("configfiles/releases/rollback", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 删除配置发布记录信息
	configV1.POST("configfiles/releases/delete", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 查询配置发布的版本列表
	configV1.GET("configfiles/release/versions", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 取消配置灰度发布
	configV1.POST("configfiles/releases/stopbeta", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 配置文件发布历史
	configV1.GET("configfiles/releasehistory", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	//配置文件模板
	configV1.GET("configfiletemplates", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 配置导入导出
	configV1.POST("configfiles/export", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	configV1.POST("configfiles/import", handlers.ReverseProxyForServer(&config.PolarisServer, config))
	// 配置加密算法
	configV1.GET("configfiles/encryptalgorithm", handlers.ReverseProxyForServer(&config.PolarisServer, config))
}
