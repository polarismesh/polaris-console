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
	"net/http"
	"net/http/httputil"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/log"
)

/**
 * @brief 服务(规则)负责人信息
 */
type ServiceOwner struct {
	Namespace string
	Name      string
	Owners    map[string]bool
}

/**
 * @brief 反向代理
 */
func ReverseProxyForLogin(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config, check bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok := authority(c, conf); !ok {
			return
		}

		if &conf.OAAuthority != nil && !conf.OAAuthority.EnableOAAuth && check {
			// 检查负责人
			if ok := checkOwner(c); !ok {
				return
			}
		}

		c.Request.Header.Add("Polaris-Token", polarisServer.PolarisToken)
		c.Request.Header.Del("Cookie")

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = polarisServer.Address
			req.Host = polarisServer.Address
		}
		proxy := &httputil.ReverseProxy{Director: director}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

/**
 * @brief 反向代理
 */
func ReverseProxyForServer(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config, check bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok := authority(c, conf); !ok {
			c.Status(http.StatusProxyAuthRequired)
			return
		}

		if ok := checkAuthoration(c, conf); !ok {
			c.Status(http.StatusProxyAuthRequired)
			return
		}

		if &conf.OAAuthority != nil && conf.OAAuthority.EnableOAAuth && check {
			// 检查负责人
			if ok := checkOwner(c); !ok {
				return
			}
		}

		c.Request.Header.Add("Polaris-Token", polarisServer.PolarisToken)
		c.Request.Header.Del("Cookie")

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = polarisServer.Address
			req.Host = polarisServer.Address
		}
		proxy := &httputil.ReverseProxy{Director: director}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

func ReverseProxyForMonitorServer(monitorServer *bootstrap.MonitorServer) gin.HandlerFunc {
	return func(c *gin.Context) {

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = monitorServer.Address
			req.Host = monitorServer.Address
		}
		proxy := &httputil.ReverseProxy{Director: director}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

/**
 * @brief 检查负责人
 */
func checkOwner(c *gin.Context) bool {
	serviceOwners := convertServiceOwners(c.Request.Header.Get("owners"))
	if serviceOwners == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"info": "权限校验错误",
		})
		return false
	}

	staffName := c.Request.Header.Get("Staffname")
	for _, service := range serviceOwners {
		if _, ok := service.Owners[staffName]; !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code": http.StatusInternalServerError,
				"info": "不是资源" + service.Namespace + "/" + service.Name + "的负责人，没有操作权限",
			})
			return false
		}
	}
	return true
}

/**
 * @brief 处理头部owner字段
 */
func convertServiceOwners(headerOwner string) []*ServiceOwner {
	var serviceOwners []*ServiceOwner
	// 分割服务
	services := strings.Split(headerOwner, "&")

	for _, service := range services {
		service = strings.ReplaceAll(service, ";", ",")
		serviceSlice := strings.Split(service, ",")
		// 命名空间+服务名+至少一个负责人，长度不能小于3
		if len(serviceSlice) < 3 {
			log.Infof("owner in header is %s", headerOwner)
			return serviceOwners
		}
		owners := make(map[string]bool)
		for index, item := range serviceSlice {
			if index == 0 || index == 1 {
				continue
			}
			owners[item] = true
		}
		item := &ServiceOwner{
			Namespace: serviceSlice[0],
			Name:      serviceSlice[1],
			Owners:    owners,
		}
		serviceOwners = append(serviceOwners, item)
	}
	return serviceOwners
}

/**
 * @brief department的反向代理
 */
func ReverseProxyForDepartment(hrData *bootstrap.HRData, conf *bootstrap.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok := authority(c, conf); !ok {
			return
		}

		getStaffDepartment(hrData, c)
	}
}

/**
 * @brief 熔断记录查询的反向代理
 */
func ReverseProxyForLogRecord(zhiyan *bootstrap.ZhiYan) gin.HandlerFunc {
	return func(c *gin.Context) {
		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = zhiyan.Host
			req.Host = zhiyan.Host
			req.Header.Set("token", zhiyan.Token)
			req.Header.Set("projectname", zhiyan.ProjectName)
		}
		proxy := &httputil.ReverseProxy{Director: director}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
