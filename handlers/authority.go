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
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/log"
	"go.uber.org/zap"
)

/**
 * @brief 鉴权
 */
func authority(c *gin.Context, conf *bootstrap.Config) bool {

	// 如果不开启OA鉴权，那么默认设置一个staffName
	if &conf.OAAuthority == nil || !conf.OAAuthority.EnableOAAuth {
		c.SetCookie("x-staff-name", "polaris", 24*3600, "/", "", false, false)
		return true
	}
	// 当前Unix时间戳，精确到秒，用于判断当前签名的时效性
	timestamp := c.GetHeader("timestamp")
	// 当前请求的签名(大写英文)，用于判断当前请求的合法性
	signature := c.GetHeader("signature")
	// 员工的id
	staffID := c.GetHeader("staffid")
	// 员工的英文名
	staffName := c.GetHeader("staffname")
	// 当前请求的唯一的标识
	xRioReq := c.GetHeader("x-rio-seq")
	// 微信的请求该字段为用户的 OpenID
	xExtData := c.GetHeader("x-ext-data")

	// TODO
	if !checkValidTimestamp(timestamp) {
		log.Errorf("invalid timestamp: %v", timestamp)
		c.String(401, "Invalid Timestamp")
		return false
	}

	tmpSignature := calcSignature(timestamp, conf.OAAuthority.OAToken, xRioReq, staffID, staffName, xExtData)
	if signature != tmpSignature {
		log.Errorf("signature error. signature is %v, tmpSignature is %v", signature, tmpSignature)
		c.String(401, "Signature Error")
		return false
	}

	c.SetCookie("x-staff-name", staffName, 24*3600, "/", "", false, false)
	return true
}

/**
 * @brief 检查时间戳
 */
func checkValidTimestamp(timeStr string) bool {
	now := time.Now().Unix()
	timestamp, err := strconv.ParseInt(timeStr, 10, 64)
	if err != nil {
		log.Errorf("err is %v", err)
		return false
	}

	// 必须验证timestamp与实际时间戳的误差不能超过 180 秒
	if math.Abs(float64(now-timestamp)) > 180 {
		log.Error("timestamp has an error of more than 180 seconds with the actual timestamp")
		return false
	}

	return true
}

/**
 *@brief 计算签名
 */
func calcSignature(timestamp, token, xRioReq, staffID, staffName, xExtData string) string {
	h := sha256.New()
	str := timestamp + token + xRioReq + "," + staffID + "," + staffName + "," + xExtData + timestamp
	io.WriteString(h, str)
	return strings.ToUpper(hex.EncodeToString(h.Sum(nil)))
}

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

// 检查访问 token 是否合法
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
