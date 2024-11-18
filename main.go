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

package main

import (
	"fmt"

	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/handlers"
	"github.com/polarismesh/polaris-console/router"
)

func main() {
	// 加载配置
	configFilePath := "polaris-console.yaml"
	config, err := bootstrap.LoadConfig(configFilePath)
	if err != nil {
		fmt.Printf("[ERROR] loadConfig fail\n")
		return
	}

	handlers.NewAdminGetter(config)

	// 初始化相关配置
	bootstrap.Initialize(config)
	// 设置模式
	bootstrap.SetMode(config)
	// 路由请求
	router.Router(config)
}
