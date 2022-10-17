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
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/log"
	"go.uber.org/zap"
)

type User struct {
	ID          string `json:"id"`
	AuthToken   string `json:"auth_token"`
	TokenEnable bool   `json:"token_enable"`
}

type GetUserTokenResponse struct {
	Code int    `json:"code"`
	Info string `json:"info"`
	User *User  `json:"user"`
}

// checkAuthoration 检查访问 token 是否合法
func checkAuthoration(ctx *gin.Context, conf *bootstrap.Config) bool {
	userId := ctx.Request.Header.Get("x-polaris-user")
	accessToken := ctx.Request.Header.Get("x-polaris-token")
	if userId == "" {
		log.Error("denied request to server because user-id is empty")
		return false
	}
	if accessToken == "" {
		log.Error("denied request to server because token is empty")
		return false
	}

	reqUrl := fmt.Sprintf("http://%s%s?id=%s", conf.PolarisServer.Address, conf.WebServer.AuthURL+"/user/token", userId)
	req, err := http.NewRequest(http.MethodGet, reqUrl, nil)
	if err != nil {
		log.Error("create query user's token req fail", zap.Error(err), zap.String("user-id", userId))
		return false
	}
	req.Header.Set("x-polaris-token", accessToken)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Error("do request to get user token fail", zap.Error(err))
		return false
	}

	data := &GetUserTokenResponse{}

	defer resp.Body.Close()

	bs, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("read body all data fail", zap.Error(err))
		return false
	}

	if err := json.Unmarshal(bs, data); err != nil {
		log.Error("unmarshal to GetUserTokenResponse fail", zap.Error(err))
		return false
	}

	if data.User != nil && data.Code == 200000 {
		return strings.Compare(accessToken, data.User.AuthToken) == 0
	}

	log.Error("compare user access-token fail", zap.String("user-id", userId))
	return false
}
