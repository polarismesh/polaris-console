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
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/handlers"
)

/**
 * @brief 路由请求
 */
func Router(config *bootstrap.Config) {
	r := gin.Default()
	// 加载静态资源
	r.Static("/static", config.WebServer.WebPath+"static")

	// 加载界面
	r.LoadHTMLGlob(config.WebServer.WebPath + "index.html")
	r.GET("/", handlers.PolarisPage(config))

	// 获取部门数据
	r.GET("/HRFoundation-Unit", handlers.GetDepartment(config))
	// 通过企业微信名获取部门数据
	r.GET("/getStaffDept", handlers.ReverseProxyForDepartment(&config.HRData, config))
	// 查询路由/限流/熔断日志记录
	r.POST("/log/search/elasticsearch", handlers.ReverseProxyForLogRecord(&config.ZhiYan))

	// 监控请求路由组
	mv1 := r.Group(config.WebServer.MonitorURL)
	mv1.GET("/query_range", handlers.ReverseProxyForMonitorServer(&config.MonitorServer))
	mv1.GET("/label/:resource/values", handlers.ReverseProxyForMonitorServer(&config.MonitorServer))

	// 鉴权请求
	AuthRouter(r, config)

	// 服务请求
	DiscoveryRouter(r, config)

	// 配置请求
	ConfigRouter(r, config)

	address := fmt.Sprintf("%v:%v", config.WebServer.ListenIP, config.WebServer.ListenPort)
	r.Run(address)
}
