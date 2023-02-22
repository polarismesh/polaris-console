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

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/common/model"
)

type (
	Description struct {
		Name string `json:"name"`
		Desc string `json:"desc"`
		Type string `json:"type"`
	}
)

func DescribeMetricLabels() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		resp := model.Response{
			Code: 200000,
			Info: "success",
			Data: metricLabelsDescriptions,
		}
		ctx.JSON(http.StatusOK, resp)
	}
}

func DescribeRequestInterface() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		resp := model.Response{
			Code: 200000,
			Info: "success",
			Data: interfacesDescriptions,
		}
		ctx.JSON(http.StatusOK, resp)
	}
}
