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
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/api"
	"github.com/polarismesh/polaris-console/common/log"
	"github.com/polarismesh/polaris-console/common/model"
	"go.uber.org/zap"
)

func ReverseHandleBootstrap(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Header.Add("Polaris-Token", polarisServer.PolarisToken)
		c.Request.Header.Del("Cookie")

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = polarisServer.Address
			req.Host = polarisServer.Address
		}
		proxy := &httputil.ReverseProxy{Director: director, ModifyResponse: func(resp *http.Response) error {
			if resp.StatusCode != http.StatusNotFound {
				return nil
			}
			if err := resp.Body.Close(); err != nil {
				return err
			}
			body := []byte(`
			{
				"code": 200000,
				"info": "success",
			}
			`)
			resp.StatusCode = http.StatusOK
			resp.Header["Content-Length"] = []string{fmt.Sprint(len(body))}
			resp.Body = io.NopCloser(bytes.NewReader(body))
			return nil
		}}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

// ReverseHandleAdminUserExist 反向代理
func ReverseHandleAdminUserExist(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Header.Add("Polaris-Token", polarisServer.PolarisToken)
		c.Request.Header.Del("Cookie")

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = polarisServer.Address
			req.Host = polarisServer.Address
		}
		proxy := &httputil.ReverseProxy{Director: director, ModifyResponse: func(resp *http.Response) error {
			if resp.StatusCode == http.StatusNotFound {
				if err := resp.Body.Close(); err != nil {
					return err
				}
				body := []byte(`
				{
					"code": 200000,
					"info": "success",
					"user": {
					    "name": "polaris"
					}
				}
				`)
				resp.StatusCode = http.StatusOK
				resp.Header["Content-Length"] = []string{fmt.Sprint(len(body))}
				resp.Body = io.NopCloser(bytes.NewReader(body))
			}
			return nil
		}}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

type FunctionDesc struct {
	Name    string `json:"name"`
	Display string `json:"display"`
	Tip     string `json:"tip"`
}

func DescribeFunctuionList() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		exportFuncFile := os.Getenv("POLARIS_EXPORT_FUNCTION_FILE")
		data, err := ioutil.ReadFile(exportFuncFile)
		if err != nil {
			log.Error("read function export file fail", zap.Error(err))
			resp := model.Response{
				Code: int32(api.ExecuteSuccess),
				Data: []FunctionDesc{},
			}
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}

		ret := make([]FunctionDesc, 0, 4)
		if err := json.Unmarshal(data, &ret); err != nil {
			log.Error("unmarshal function export file fail", zap.Error(err))
			resp := model.Response{
				Code: int32(api.ExecuteException),
				Info: err.Error(),
				Data: []FunctionDesc{},
			}
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}

		resp := model.Response{
			Code: int32(api.ExecuteSuccess),
			Data: ret,
		}
		ctx.JSON(model.CalcCode(resp.Code), resp)
	}
}
