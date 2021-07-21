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
	"io"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/common/log"
)

/**
 * @brief OA鉴权
 */
type OAAuthority struct {
	EnableOAAuth bool   `yaml:"enableOAAuth"`
	OAToken      string `yaml:"oaToken"`
}

/**
 * @brief 鉴权
 */
func authority(c *gin.Context, oaAuthority *OAAuthority) bool {
	// 如果不开启OA鉴权，那么默认设置一个staffName
	if oaAuthority == nil || !oaAuthority.EnableOAAuth {
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

	tmpSignature := calcSignature(timestamp, oaAuthority.OAToken, xRioReq, staffID, staffName, xExtData)
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
