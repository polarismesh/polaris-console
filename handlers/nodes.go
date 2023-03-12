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
	"errors"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/model"
)

func DescribeServerNodes(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !verifyAccessPermission(c, conf) {
			return
		}

		c.Request.Header.Add("Polaris-Token", polarisServer.PolarisToken)
		c.Request.Header.Del("Cookie")

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = polarisServer.Address
			req.URL.Path = "/naming/v1/instances"
			req.URL.RawQuery = "limit=10&offset=0&namespace=Polaris&service=polaris.checker"
			req.Host = polarisServer.Address
		}

		modifyResp := func(resp *http.Response) error {
			body, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				return err
			}
			if err := resp.Body.Close(); err != nil {
				return err
			}

			serverNodes := &model.ServerNodes{}
			if err := json.Unmarshal(body, serverNodes); err != nil {
				return err
			}
			if model.CalcCode(int32(serverNodes.Code)) != 200 {
				return errors.New(serverNodes.Info)
			}

			nodeIps := make([]string, 0, len(serverNodes.Nodes))
			for i := range serverNodes.Nodes {
				nodeIps = append(nodeIps, serverNodes.Nodes[i].Host)
			}
			nodesResp := &model.Response{
				Code: int32(serverNodes.Code),
				Info: serverNodes.Info,
				Data: nodeIps,
			}

			body, err = json.Marshal(nodesResp)
			if err != nil {
				return err
			}

			resp.Header.Set("Content-Length", strconv.FormatInt(int64(len(body)), 10))
			resp.Body = ioutil.NopCloser(bytes.NewBuffer(body))
			return nil
		}

		proxy := &httputil.ReverseProxy{Director: director, ModifyResponse: modifyResp}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
