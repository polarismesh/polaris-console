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
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/model"
)

func ClsInfoRouter(webSvr *gin.Engine, config *bootstrap.Config) {
	v1 := webSvr.Group("/cls/v1")
	v1.GET("/info", func(ctx *gin.Context) {
		if !config.HasFutures(model.FutureLogObservability) {
			resp := model.Response{
				Code: 200000,
				Info: "success",
				Data: map[string]string{
					"topic_id":   "",
					"topic_name": "",
					"link":       "",
				},
			}
			ctx.JSON(http.StatusOK, resp)
		}

		detail := strings.Split(os.Getenv("CLS_TOPIC_INFO"), ":")
		resp := model.Response{
			Code: 200000,
			Info: "success",
			Data: map[string]string{
				"topic_id":   detail[0],
				"topic_name": detail[1],
				"link":       fmt.Sprintf("https://console.cloud.tencent.com/cls/topic/detail?region=%s&id=%s", os.Getenv("REGION"), detail[0]),
			},
		}
		ctx.JSON(http.StatusOK, resp)
	})
}
