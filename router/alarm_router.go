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
	"os"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/log"
	"github.com/polarismesh/polaris-console/handlers"
	"go.uber.org/zap"
)

// AlarmRuleRouter alarm rule router
// TODO 需要登录态操作
func AlarmRuleRouter(webSvr *gin.Engine, config *bootstrap.Config) {
	_, err := handlers.NewAlarmChangeEventSubscriber(config)
	if err != nil {
		log.Error("create alarm change event subscriber", zap.Error(err))
		os.Exit(-1)
	}

	v1 := webSvr.Group("/alert/v1")
	v1.POST("/rules", handlers.CreateAlarmRules(config))
	v1.PUT("/rules", handlers.UpdateAlarmRules(config))
	v1.POST("/rules/delete", handlers.DeleteAlarmRules(config))
	v1.PUT("/rules/enable", handlers.EnableAlarmRules(config))
	v1.GET("/rules", handlers.DescribeAlarmRules(config))

}
