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
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/stretchr/testify/assert"
)

func TestRefreshJWTAndParse(t *testing.T) {
	conf := &bootstrap.Config{}
	conf.WebServer.JWT.Expired = 2
	conf.WebServer.JWT.SecretKey = "polarismesh@2021"
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	userID, token := "user1", "token1"
	err := refreshJWT(c, userID, token, conf)
	assert.NoError(t, err, "refresh jwt should not fail")
	time.Sleep(time.Second)

	c.Request = &http.Request{
		Header: map[string][]string{
			"Cookie": {c.Writer.Header().Get("Set-Cookie")},
		},
	}
	targetUserID, targetToken, err := parseJWTThenSetToken(c, conf)
	assert.NoError(t, err, "parse jwt should not fail")
	if targetUserID != userID {
		t.Errorf("user id should be same to target")
	}
	if targetToken != token {
		t.Errorf("token should be same to target")
	}
	time.Sleep(2 * time.Second)
	_, _, err = parseJWTThenSetToken(c, conf)
	assert.Error(t, err, "token should be expire")
}
