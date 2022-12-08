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

type TypeInfo struct {
	Type string `json:"type"`
	Desc string `json:"desc"`
}

// InstanceEventType 探测事件类型
type InstanceEventType string

const (
	// EventDiscoverNone empty discover event
	EventDiscoverNone InstanceEventType = "EventDiscoverNone"
	// EventInstanceOnline instance becoming online
	EventInstanceOnline InstanceEventType = "InstanceOnline"
	// EventInstanceTurnUnHealth Instance becomes unhealthy
	EventInstanceTurnUnHealth InstanceEventType = "InstanceTurnUnHealth"
	// EventInstanceTurnHealth Instance becomes healthy
	EventInstanceTurnHealth InstanceEventType = "InstanceTurnHealth"
	// EventInstanceOpenIsolate Instance is in isolation
	EventInstanceOpenIsolate InstanceEventType = "InstanceOpenIsolate"
	// EventInstanceCloseIsolate Instance shutdown isolation state
	EventInstanceCloseIsolate InstanceEventType = "InstanceCloseIsolate"
	// EventInstanceOffline Instance offline
	EventInstanceOffline InstanceEventType = "InstanceOffline"
	// EventInstanceSendHeartbeat Instance send heartbeat package to server
	EventInstanceSendHeartbeat InstanceEventType = "InstanceSendHeartbeat"
)

var (
	_instanceEventInfo = map[InstanceEventType]string{
		EventInstanceOnline:       "实例上线",
		EventInstanceOffline:      "实例下线",
		EventInstanceTurnHealth:   "实例恢复健康",
		EventInstanceTurnUnHealth: "实例出现异常",
		EventInstanceOpenIsolate:  "实例开启隔离",
		EventInstanceCloseIsolate: "实例关闭隔离",
	}

	_searchEventLogParams = map[string]struct{}{
		"namespace":   {},
		"service":     {},
		"instance":    {},
		"start_time":  {},
		"end_time":    {},
		"limit":       {},
		"offset":      {},
		"extend_info": {},
	}
)

type EventRecordLogResponse struct {
	Code       uint32        `json:"code"`
	Info       string        `json:"info"`
	Total      uint64        `json:"total,omitempty"`
	Size       uint32        `json:"size,omitempty"`
	HasNext    bool          `json:"has_next"`
	Data       []EventRecord `json:"data"`
	ExtendInfo string        `json:"extend_info,omitempty"`
}

type EventRecord struct {
	EventType  string `json:"event_type"`
	Namespace  string `json:"namespace"`
	Service    string `json:"service"`
	InstanceID string `json:"instance_id"`
	Host       string `json:"host"`
	Port       int    `json:"port"`
	EventTime  string `json:"event_time"`
}

func DescribeEventLog(conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if !verifyAccessPermission(ctx, conf) {
			return
		}
		if len(conf.EventServer.RequestURL) == 0 {
			ctx.JSON(http.StatusOK, model.QueryResponse{
				Code:     200000,
				Size:     0,
				Amount:   0,
				HashNext: false,
			})
			return
		}
		reader, err := GetEventLogReader(conf)
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
		param, err := parseHttpQueryToSearchParams(filters, _searchEventLogParams)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, model.Response{
				Code: 400000,
				Info: err.Error(),
			})
			return
		}

		resp := &EventRecordLogResponse{}
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

func DescribeEventTypes(conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ret := make([]TypeInfo, 0, len(_instanceEventInfo))
		for k, v := range _instanceEventInfo {
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
