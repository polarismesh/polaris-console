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
	"io/ioutil"
	"net/http"
	"net/http/httputil"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/model"
	"github.com/polarismesh/polaris-console/common/swagger"
)

type (
	Description struct {
		Name        string   `json:"name"`
		Desc        string   `json:"desc"`
		Type        string   `json:"type"`
		QueryLabels []string `json:"query_labels"`
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

func DescribeRequestInterface(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Header.Add("Polaris-Token", polarisServer.PolarisToken)
		c.Request.Header.Del("Cookie")

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = polarisServer.Address
			req.URL.Path = "/apidocs.json"
			req.Host = polarisServer.Address
			req.RequestURI = "/apidocs.json"
		}
		modifyResp := func(resp *http.Response) error {
			body, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				return err
			}
			if err := resp.Body.Close(); err != nil {
				return err
			}

			apiDocs := &swagger.OpenAPI{}
			if err := json.Unmarshal(body, apiDocs); err != nil {
				return err
			}

			copyInterfacesDescriptions := make([]Description, 0, 16)
			copyInterfacesDescriptions = append(copyInterfacesDescriptions, interfacesDescriptions...)
			paths := apiDocs.Paths
			for path, info := range paths {
				methodName, methodInfo := info.GetMethod()
				if methodInfo == nil {
					continue
				}
				for _, tag := range methodInfo.Tags {
					if tag == "Client" {
						goto END
					}
				}

				copyInterfacesDescriptions = append(copyInterfacesDescriptions, Description{
					Name: methodName + ":" + path,
					Desc: methodInfo.Summary,
					Type: "OpenAPI",
					QueryLabels: []string{
						methodName + ":" + path,
					},
				})

			END:
			}

			body, err = json.Marshal(copyInterfacesDescriptions)
			if err != nil {
				return err
			}

			resp.Body = ioutil.NopCloser(bytes.NewBuffer(body))
			return nil
		}
		proxy := &httputil.ReverseProxy{Director: director, ModifyResponse: modifyResp}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
