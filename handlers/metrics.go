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
	"net/url"
	"strconv"
	"strings"
	"sync"

	"golang.org/x/sync/errgroup"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/api"
	"github.com/polarismesh/polaris-console/common/model"
	"github.com/polarismesh/polaris-console/common/swagger"
)

type RetStatus string

const (
	RetUnknown     RetStatus = "unknown"
	RetSuccess     RetStatus = "success"
	RetFail        RetStatus = "fail"
	RetTimeout     RetStatus = "timeout"
	RetReject      RetStatus = "reject"
	RetFlowControl RetStatus = "flow_control"
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

			resp.Header.Set("Content-Length", strconv.FormatInt(int64(len(body)), 10))
			resp.Body = ioutil.NopCloser(bytes.NewBuffer(body))
			return nil
		}
		proxy := &httputil.ReverseProxy{Director: director, ModifyResponse: modifyResp}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

// DescribeServicesMetric 查询服务级别监控指标列表视图
func DescribeServicesMetric(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		namespace := ctx.Query("namespace")

		filter := map[string]string{}
		queryMap := ctx.Request.URL.Query()
		for i := range queryMap {
			if len(queryMap[i]) > 0 {
				filter[i] = queryMap[i][0]
			}
		}

		promResult := &sync.Map{}
		errg := &errgroup.Group{}

		errg.Go(func() error {
			// 调用 /v1/Discover 接口获取服务的列表信息数据
			discoverResp, err := listAllService(ctx, conf, namespace)
			if err != nil {
				return err
			}
			promResult.Store("services", discoverResp)
			return nil
		})

		errg.Go(func() error {
			resp, err := describeServiceMetricsRequestTimeout(conf, namespace, ctx.Query("start"), ctx.Query("end"), ctx.Query("step"))
			if err != nil {
				return err
			}
			promResult.Store("timeout", resp)
			return nil
		})

		errg.Go(func() error {
			resp, err := describeServiceMetricsRequestTotal(conf, namespace, ctx.Query("start"), ctx.Query("end"), ctx.Query("step"))
			if err != nil {
				return err
			}
			promResult.Store("total", resp)
			return nil
		})

		if err := errg.Wait(); err != nil {
			resp := model.NewResponse(int32(api.ExecuteException))
			resp.Info = err.Error()
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}

		discoverRespVal, _ := promResult.Load("services")
		timeoutRespVal, _ := promResult.Load("timeout")
		totalRespVal, _ := promResult.Load("total")

		resp, err := handleDescribeServicesMetric(discoverRespVal.(*model.BatchQueryResponse),
			timeoutRespVal.(map[string]map[string]float64), totalRespVal.(map[string]map[string]*model.ServiceMetric))
		if err != nil {
			resp := model.NewResponse(int32(api.ExecuteException))
			resp.Info = err.Error()
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}
		ctx.JSON(model.CalcCode(resp.Code), resp)
		return
	}
}

// handleDescribeServicesMetric 将服务列表的各个 metric 指标数据进行合并到 model.ServiceMetric 结构体中
func handleDescribeServicesMetric(discoverResp *model.BatchQueryResponse, timeoutResp map[string]map[string]float64,
	totalResp map[string]map[string]*model.ServiceMetric) (*model.Response, error) {
	services := discoverResp.Services

	tmpServices := make(map[string]map[string]*model.Service, len(services))
	for i := range services {
		svc := services[i]
		if _, ok := tmpServices[svc.Namespace]; !ok {
			tmpServices[svc.Namespace] = make(map[string]*model.Service)
		}
		tmpServices[svc.Namespace][svc.Name] = svc
	}

	ret := make([]*model.ServiceMetric, 0, 32)

	for ns := range totalResp {
		if _, ok := timeoutResp[ns]; !ok {
			continue
		}
		if _, ok := tmpServices[ns]; !ok {
			continue
		}

		for svcName, item := range totalResp[ns] {
			timeoutItem, ok := timeoutResp[ns][svcName]
			if !ok {
				continue
			}

			item.AvgTimeout = timeoutItem

			svc, ok := tmpServices[ns][svcName]
			if !ok {
				continue
			}
			item.TotalInstanceCount = int64(svc.TotalInstanceCount)
			item.HealthyInstanceCount = int64(svc.HealthyInstanceCount)
			ret = append(ret, item)
		}
	}

	resp := model.NewResponse(int32(api.ExecuteSuccess))
	resp.Data = ret
	return &resp, nil
}

// describeServiceMetricsRequestTotal 查询时间段内 upstream_rq_total 的不同类比请求统计
func describeServiceMetricsRequestTotal(conf *bootstrap.Config, namespace, start, end, step string) (map[string]map[string]*model.ServiceMetric, error) {
	stepVal, _ := strconv.ParseInt(step, 10, 64)
	if stepVal < 60 {
		step = "10"
	}
	params := map[string]string{
		"start": start,
		"end":   end,
		"step":  step,
		"query": "sum(upstream_rq_total{}) by (callee_service, callee_namespace, callee_result)",
	}
	if len(namespace) != 0 {
		params["query"] = fmt.Sprintf(`sum(upstream_rq_total{callee_namespace="%s"}) by (callee_service, callee_namespace, callee_result)`, namespace)
	}

	queryParams := &url.Values{}
	for k, v := range params {
		queryParams.Add(k, v)
	}

	promqlUrl := fmt.Sprintf("http://%s/api/v1/query_range?%s", conf.MonitorServer.Address, queryParams.Encode())
	resp, err := sendToPrometheus(promqlUrl)
	if err != nil {
		return nil, err
	}

	serviceTimeout := map[string]map[string]*model.ServiceMetric{}
	for i := range resp.PrometheusData.Result {
		result := resp.PrometheusData.Result[i]
		namespace := result.Metric["callee_namespace"]
		service := result.Metric["callee_service"]
		callResult := result.Metric["callee_result"]

		if _, ok := serviceTimeout[namespace]; !ok {
			serviceTimeout[namespace] = map[string]*model.ServiceMetric{}
		}
		if _, ok := serviceTimeout[namespace][service]; !ok {
			serviceTimeout[namespace][service] = &model.ServiceMetric{
				Namespace: namespace,
				Name:      service,
			}
		}

		svc := serviceTimeout[namespace][service]

		var total int64
		for i := range result.Values {
			metricVal := fmt.Sprintf("%s", result.Values[i][1])
			if metricVal == "NaN" {
				continue
			}
			v, _ := strconv.ParseInt(metricVal, 10, 64)
			total += v
		}

		switch callResult {
		case string(RetFail):
			svc.FailedRequest += total
		case string(RetFlowControl):
			svc.LimitedRequest += total
			svc.FailedRequest += total
		case string(RetReject):
			svc.CircuitbreakerRequest += total
			svc.FailedRequest += total
		}
		svc.TotalRequest += int64(total)
		svc.CalSuccessRate()
	}

	return serviceTimeout, nil
}

// describeServiceMetricsRequestTimeout 查询时间段内 upstream_rq_timeout 的平均时延
// return map[string]map[string]float64{}
func describeServiceMetricsRequestTimeout(conf *bootstrap.Config, namespace, start, end, step string) (map[string]map[string]float64, error) {
	stepVal, _ := strconv.ParseInt(step, 10, 64)
	if stepVal < 60 {
		step = "10"
	}
	params := map[string]string{
		"start": start,
		"end":   end,
		"step":  step,
		"query": "avg(upstream_rq_timeout{}) by (callee_service, callee_namespace)",
	}
	if len(namespace) != 0 {
		params["query"] = fmt.Sprintf(`avg(upstream_rq_timeout{callee_namespace="%s"}) by (callee_service, callee_namespace, callee_result)`, namespace)
	}

	queryParams := &url.Values{}
	for k, v := range params {
		queryParams.Add(k, v)
	}

	promqlUrl := fmt.Sprintf("http://%s/api/v1/query_range?%s", conf.MonitorServer.Address, queryParams.Encode())
	resp, err := sendToPrometheus(promqlUrl)
	if err != nil {
		return nil, err
	}

	serviceTimeout := map[string]map[string]float64{}
	for i := range resp.PrometheusData.Result {
		result := resp.PrometheusData.Result[i]
		namespace := result.Metric["callee_namespace"]
		service := result.Metric["callee_service"]

		if _, ok := serviceTimeout[namespace]; !ok {
			serviceTimeout[namespace] = map[string]float64{}
		}

		var (
			totalTimeout = float64(0)
			total        = 0
		)
		for i := range result.Values {
			metricVal := fmt.Sprintf("%s", result.Values[i][1])
			if metricVal == "NaN" {
				continue
			}
			total++
			v, _ := strconv.ParseFloat(metricVal, 64)
			totalTimeout += v
		}

		if total == 0 {
			serviceTimeout[namespace][service] = 0
		} else {
			serviceTimeout[namespace][service] = totalTimeout / float64(total)
		}
	}

	return serviceTimeout, nil
}

// DescribeServiceInterfacesMetric 查询服务下接口级别监控指标列表视图
func DescribeServiceInterfacesMetric(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		namespace := ctx.Query("namespace")
		service := ctx.Query("service")
		if len(namespace) == 0 || len(service) == 0 {
			resp := model.NewResponse(int32(api.BadRequest))
			resp.Info = "namespace or service is empty"
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}

		calleeInstance := ctx.Query("callee_instance")

		promResult := &sync.Map{}
		errg := &errgroup.Group{}

		start := ctx.Query("start")
		end := ctx.Query("end")
		step := ctx.Query("step")

		// 查询接口级别的请求数量数据
		errg.Go(func() error {
			resp, err := describeServiceInterfaceMetricsRequestTotal(conf, namespace, service, calleeInstance, start, end, step)
			if err != nil {
				return err
			}
			promResult.Store("total", resp)
			return nil
		})

		// 查询接口级别的请求 avg(RT)
		errg.Go(func() error {
			resp, err := describeServiceInterfaceMetricsRequestTimeout(conf, namespace, service, calleeInstance, start, end, step)
			if err != nil {
				return err
			}
			promResult.Store("timeout", resp)
			return nil
		})

		if err := errg.Wait(); err != nil {
			resp := model.NewResponse(int32(api.ExecuteException))
			resp.Info = err.Error()
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}

		timeoutVal, _ := promResult.Load("timeout")
		totalVal, _ := promResult.Load("total")
		resp, err := handleDescribeServiceInterfacesMetric(timeoutVal.(map[string]float64), totalVal.(map[string]*model.InterfaceMetric))
		if err != nil {
			resp := model.NewResponse(int32(api.ExecuteException))
			resp.Info = err.Error()
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}
		ctx.JSON(model.CalcCode(resp.Code), resp)
		return
	}
}

const (
	allMethod     = "__ALL__"
	unknownMethod = "__UNKNOWN__"
)

func handleDescribeServiceInterfacesMetric(timeoutResp map[string]float64,
	totalResp map[string]*model.InterfaceMetric) (*model.Response, error) {
	ret := make([]*model.InterfaceMetric, 0, 32)
	var (
		allInterMetric     *model.InterfaceMetric
		unknownInterMetric *model.InterfaceMetric
	)
	for inter, val := range totalResp {
		rt, ok := timeoutResp[inter]
		if !ok {
			continue
		}

		val.AvgTimeout = rt
		if inter == allMethod {
			allInterMetric = val
			continue
		}
		if inter == unknownMethod {
			unknownInterMetric = val
			continue
		}
		ret = append(ret, val)
	}

	resp := model.NewResponse(int32(api.ExecuteSuccess))
	resp.Data = &model.InterfaceMetrics{
		CategoryService:    allInterMetric,
		CategoryUnKnown:    unknownInterMetric,
		CategoryInterfaces: ret,
	}
	return &resp, nil
}

func describeServiceInterfaceList(conf *bootstrap.Config, start, end, step string) (map[string]struct{}, error) {
	stepVal, _ := strconv.ParseInt(step, 10, 64)
	if stepVal < 60 {
		step = "10"
	}
	params := map[string]string{
		"query": "group(upstream_rq_total) by (callee_method)",
		"start": start,
		"end":   end,
		"step":  step,
	}

	queryParams := &url.Values{}
	for k, v := range params {
		queryParams.Add(k, v)
	}

	promqlUrl := fmt.Sprintf("http://%s/api/v1/query_range?%s", conf.MonitorServer.Address, queryParams.Encode())
	resp, err := sendToPrometheus(promqlUrl)
	if err != nil {
		return nil, err
	}

	interfaces := make(map[string]struct{})
	for i := range resp.PrometheusData.Result {
		result := resp.PrometheusData.Result[i]
		method := result.Metric["callee_method"]
		interfaces[method] = struct{}{}
	}

	return interfaces, nil
}

// describeServiceInterfaceMetricsRequestTotal 查询时间段内接口级别的 upstream_rq_total 的不同类比请求统计
func describeServiceInterfaceMetricsRequestTotal(conf *bootstrap.Config, namespace, service, calleeInstance, start, end, step string) (map[string]*model.InterfaceMetric, error) {
	stepVal, _ := strconv.ParseInt(step, 10, 64)
	if stepVal < 60 {
		step = "10"
	}
	params := map[string]string{
		"start": start,
		"end":   end,
		"step":  step,
		"query": fmt.Sprintf(`sum(upstream_rq_total{callee_service="%s", callee_namespace="%s"}) by (callee_method, callee_result)`, service, namespace),
	}
	if len(calleeInstance) != 0 {
		params["query"] = fmt.Sprintf(`sum(upstream_rq_total{callee_service="%s", callee_namespace="%s", callee_instance="%s"}) by (callee_method, callee_result)`, service, namespace, calleeInstance)
	}

	queryParams := &url.Values{}
	for k, v := range params {
		queryParams.Add(k, v)
	}

	promqlUrl := fmt.Sprintf("http://%s/api/v1/query_range?%s", conf.MonitorServer.Address, queryParams.Encode())
	resp, err := sendToPrometheus(promqlUrl)
	if err != nil {
		return nil, err
	}

	interfacesTimeout := map[string]*model.InterfaceMetric{
		allMethod: {},
	}
	for i := range resp.PrometheusData.Result {
		result := resp.PrometheusData.Result[i]
		callResult := result.Metric["callee_result"]
		callMethod := result.Metric["callee_method"]
		if len(callMethod) == 0 {
			callMethod = unknownMethod
		}

		if _, ok := interfacesTimeout[callMethod]; !ok {
			interfacesTimeout[callMethod] = &model.InterfaceMetric{
				InterfaceName: callMethod,
			}
		}

		inter := interfacesTimeout[callMethod]
		allInter := interfacesTimeout[allMethod]

		var total int64
		for i := range result.Values {
			metricVal := fmt.Sprintf("%s", result.Values[i][1])
			if metricVal == "NaN" {
				continue
			}
			v, _ := strconv.ParseInt(metricVal, 10, 64)
			total += v
		}

		switch callResult {
		case string(RetSuccess):
			allInter.SuccessRequest += total
			inter.SuccessRequest += total
		case string(RetFail):
			allInter.AbnormalRequest += total
			inter.AbnormalRequest += total
		case string(RetReject), string(RetFlowControl):
			allInter.FlowControlRequest += total
			inter.FlowControlRequest += total
		}

	}

	return interfacesTimeout, nil
}

// describeServiceInterfaceMetricsRequestTimeout 查询时间段内接口级别 upstream_rq_timeout 的平均时延
// return map[string]float64{}
func describeServiceInterfaceMetricsRequestTimeout(conf *bootstrap.Config, namespace, service, calleeInstance, start, end, step string) (map[string]float64, error) {
	stepVal, _ := strconv.ParseInt(step, 10, 64)
	if stepVal < 60 {
		step = "10"
	}
	params := map[string]string{
		"start": start,
		"end":   end,
		"step":  step,
		"query": fmt.Sprintf(`avg(upstream_rq_timeout{callee_service="%s", callee_namespace="%s"}) by (callee_method)`, service, namespace),
	}
	if len(calleeInstance) != 0 {
		params["query"] = fmt.Sprintf(`avg(upstream_rq_timeout{callee_service="%s", callee_namespace="%s", callee_instance="%s"}) by (callee_method, callee_result)`, service, namespace, calleeInstance)
	}

	queryParams := &url.Values{}
	for k, v := range params {
		queryParams.Add(k, v)
	}

	promqlUrl := fmt.Sprintf("http://%s/api/v1/query_range?%s", conf.MonitorServer.Address, queryParams.Encode())
	resp, err := sendToPrometheus(promqlUrl)
	if err != nil {
		return nil, err
	}

	interfaceTimeout := map[string]float64{
		allMethod: 0,
	}

	var (
		allTotalTimeout = float64(0)
		allTotal        = 0
	)

	for i := range resp.PrometheusData.Result {
		result := resp.PrometheusData.Result[i]
		callMethod := result.Metric["callee_method"]
		if len(callMethod) == 0 {
			callMethod = unknownMethod
		}

		if _, ok := interfaceTimeout[callMethod]; !ok {
			interfaceTimeout[callMethod] = 0
		}

		var (
			totalTimeout = float64(0)
			total        = 0
		)
		for i := range result.Values {
			metricVal := fmt.Sprintf("%s", result.Values[i][1])
			if metricVal == "NaN" {
				continue
			}
			total++
			allTotal++
			v, _ := strconv.ParseFloat(metricVal, 64)
			totalTimeout += v
			allTotalTimeout += v
		}

		if total != 0 {
			interfaceTimeout[callMethod] = totalTimeout / float64(total)
		} else {
			interfaceTimeout[callMethod] = 0
		}
	}

	if allTotal != 0 {
		interfaceTimeout[allMethod] = allTotalTimeout / float64(allTotal)
	} else {
		interfaceTimeout[allMethod] = 0
	}
	return interfaceTimeout, nil
}

// DescribeServiceInstancesMetric 查询服务下实例级别监控指标列表视图
func DescribeServiceInstancesMetric(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		namespace := ctx.Query("namespace")
		service := ctx.Query("service")
		if len(namespace) == 0 || len(service) == 0 {
			resp := model.NewResponse(int32(api.BadRequest))
			resp.Info = "namespace or service is empty"
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}
		start := ctx.Query("start")
		end := ctx.Query("end")
		step := ctx.Query("step")
		calleeMethod := ctx.Query("callee_method")

		promResult := &sync.Map{}
		errg := &errgroup.Group{}

		errg.Go(func() error {
			// 调用 /v1/Discover 接口获取服务的实例列表信息数据
			discoverResp, err := sendDiscoverRequest(ctx, conf, namespace, service, model.DiscoverRequest_INSTANCE)
			if err != nil {
				return err
			}
			promResult.Store("instances", discoverResp)
			return nil
		})

		errg.Go(func() error {
			resp, err := describeServiceInstanceRequestTimeout(conf, service, namespace, calleeMethod, start, end, step)
			if err != nil {
				return err
			}
			promResult.Store("timeout", resp)
			return nil
		})

		errg.Go(func() error {
			resp, err := describeServiceInstanceRequestTotal(conf, service, namespace, calleeMethod, start, end, step)
			if err != nil {
				return err
			}
			promResult.Store("total", resp)
			return nil
		})

		if err := errg.Wait(); err != nil {
			resp := model.NewResponse(int32(api.ExecuteException))
			resp.Info = err.Error()
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}

		discoverResp, _ := promResult.Load("instances")
		timeoutVal, _ := promResult.Load("timeout")
		totalVal, _ := promResult.Load("total")
		resp, err := handleDescribeServiceInstancesMetric(discoverResp.(*model.DiscoverResponse), timeoutVal.(map[string]float64), totalVal.(map[string]*model.InstanceMetric))
		if err != nil {
			resp := model.NewResponse(int32(api.ExecuteException))
			resp.Info = err.Error()
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}
		ctx.JSON(model.CalcCode(resp.Code), resp)
		return
	}
}

func handleDescribeServiceInstancesMetric(discoverResp *model.DiscoverResponse, timeoutVal map[string]float64,
	totalVal map[string]*model.InstanceMetric) (*model.Response, error) {
	instanceMap := map[string]*model.Instance{}
	for i := range discoverResp.Instances {
		ins := discoverResp.Instances[i]
		key := fmt.Sprintf("%s:%d", ins.Host, ins.Port)
		instanceMap[key] = ins
	}

	ret := make([]*model.InstanceMetric, 0, len(totalVal))

	for key := range totalVal {
		insMetric := totalVal[key]
		timeout, ok := timeoutVal[key]
		if !ok {
			continue
		}
		insMetric.AvgTimeout = timeout
		acutalIns, ok := instanceMap[key]
		if ok {
			insMetric.ID = acutalIns.Id
			insMetric.Host = acutalIns.Host
			insMetric.Port = acutalIns.Port
			insMetric.Isolate = acutalIns.Isolate
			if acutalIns.Healthy {
				insMetric.Status = model.InstanceStatusHealthy
			} else {
				insMetric.Status = model.InstanceStatusUnHealthy
			}
		} else {
			insMetric.Status = model.InstanceStatusOffline
			// insMetric.PutExtendInfo("offline_time", commontime.Time2String(time.Now()))
		}

		ret = append(ret, insMetric)
	}

	resp := model.NewResponse(int32(api.ExecuteSuccess))
	resp.Data = ret
	return &resp, nil
}

func describeServiceInstanceRequestTimeout(conf *bootstrap.Config, service, namespace, calleeMethod,
	start, end, step string) (map[string]float64, error) {
	stepVal, _ := strconv.ParseInt(step, 10, 64)
	if stepVal < 60 {
		step = "10"
	}
	params := map[string]string{
		"start": start,
		"end":   end,
		"step":  step,
		"query": fmt.Sprintf(`avg(upstream_rq_timeout{callee_service="%s", callee_namespace="%s"}) by (callee_instance)`, service, namespace),
	}
	if len(calleeMethod) != 0 {
		params["query"] = fmt.Sprintf(`avg(upstream_rq_timeout{callee_service="%s", callee_namespace="%s", callee_method="%s"}) by (callee_instance)`, service, namespace, calleeMethod)
	}

	queryParams := &url.Values{}
	for k, v := range params {
		queryParams.Add(k, v)
	}

	promqlUrl := fmt.Sprintf("http://%s/api/v1/query_range?%s", conf.MonitorServer.Address, queryParams.Encode())
	resp, err := sendToPrometheus(promqlUrl)
	if err != nil {
		return nil, err
	}

	instanceTimeout := map[string]float64{}
	for i := range resp.PrometheusData.Result {
		result := resp.PrometheusData.Result[i]
		instanceKey := result.Metric["callee_instance"]

		if _, ok := instanceTimeout[instanceKey]; !ok {
			instanceTimeout[instanceKey] = 0
		}

		var (
			totalTimeout = float64(0)
			total        = 0
		)
		for i := range result.Values {
			metricVal := fmt.Sprintf("%s", result.Values[i][1])
			if metricVal == "NaN" {
				continue
			}
			total++
			v, _ := strconv.ParseFloat(metricVal, 64)
			totalTimeout += v
		}

		if total == 0 {
			instanceTimeout[instanceKey] = 0
		} else {
			instanceTimeout[instanceKey] = totalTimeout / float64(total)
		}
	}

	return instanceTimeout, nil
}

func describeServiceInstanceRequestTotal(conf *bootstrap.Config, service, namespace, calleeMethod,
	start, end, step string) (map[string]*model.InstanceMetric, error) {
	stepVal, _ := strconv.ParseInt(step, 10, 64)
	if stepVal < 60 {
		step = "10"
	}
	params := map[string]string{
		"start": start,
		"end":   end,
		"step":  step,
		"query": fmt.Sprintf(`sum(upstream_rq_total{callee_service="%s", callee_namespace="%s"}) by (callee_instance, callee_result)`, service, namespace),
	}
	if len(calleeMethod) != 0 {
		params["query"] = fmt.Sprintf(`sum(upstream_rq_total{callee_service="%s", callee_namespace="%s", callee_method="%s"}) by (callee_instance)`, service, namespace, calleeMethod)
	}

	queryParams := &url.Values{}
	for k, v := range params {
		queryParams.Add(k, v)
	}

	promqlUrl := fmt.Sprintf("http://%s/api/v1/query_range?%s", conf.MonitorServer.Address, queryParams.Encode())
	resp, err := sendToPrometheus(promqlUrl)
	if err != nil {
		return nil, err
	}

	instanceTotal := map[string]*model.InstanceMetric{}
	for i := range resp.PrometheusData.Result {
		result := resp.PrometheusData.Result[i]
		callResult := result.Metric["callee_result"]
		instanceKey := result.Metric["callee_instance"]

		if _, ok := instanceTotal[instanceKey]; !ok {
			endpoint := strings.Split(instanceKey, ":")
			host := ""
			port := uint32(0)
			if len(endpoint) == 1 {
				host = instanceKey
				port = 0
			}
			if len(endpoint) == 2 {
				host = endpoint[0]
				val, _ := strconv.ParseUint(endpoint[1], 10, 32)
				port = uint32(val)
			}
			instanceTotal[instanceKey] = &model.InstanceMetric{
				Host: host,
				Port: port,
			}
		}
		ins := instanceTotal[instanceKey]

		var total int64
		for i := range result.Values {
			metricVal := fmt.Sprintf("%s", result.Values[i][1])
			if metricVal == "NaN" {
				continue
			}
			v, _ := strconv.ParseInt(metricVal, 10, 64)
			total += v
		}

		switch callResult {
		case string(RetFail):
			ins.FailedRequest += total
		case string(RetFlowControl):
			ins.LimitedRequest += total
			ins.FailedRequest += total
		case string(RetReject):
			ins.CircuitbreakerRequest += total
			ins.FailedRequest += total
		}

		ins.TotalRequest += total
		ins.CalSuccessRate()
	}

	return instanceTotal, nil
}

// DescribeServiceCallerMetric 查询服务调用者级别监控指标列表视图
func DescribeServiceCallerMetric(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		namespace := ctx.Query("callee_namespace")
		service := ctx.Query("callee_service")
		if len(namespace) == 0 || len(service) == 0 {
			resp := model.NewResponse(int32(api.BadRequest))
			resp.Info = "callee_namespace or callee_service is empty"
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}
		start := ctx.Query("start")
		end := ctx.Query("end")
		step := ctx.Query("step")
		calleeMethod := ctx.Query("callee_method")
		calleeInstance := ctx.Query("callee_instance")

		promResult := &sync.Map{}
		errg := &errgroup.Group{}

		errg.Go(func() error {
			resp, err := describeServiceCallerMetricRequestTimeout(conf, service, namespace, calleeMethod, calleeInstance, start, end, step)
			if err != nil {
				return err
			}
			promResult.Store("timeout", resp)
			return nil
		})

		errg.Go(func() error {
			resp, err := describeServiceCallerMetricRequestTotal(conf, service, namespace, calleeMethod, calleeInstance, start, end, step)
			if err != nil {
				return err
			}
			promResult.Store("total", resp)
			return nil
		})

		if err := errg.Wait(); err != nil {
			resp := model.NewResponse(int32(api.ExecuteException))
			resp.Info = err.Error()
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}

		timeoutVal, _ := promResult.Load("timeout")
		totalVal, _ := promResult.Load("total")
		resp, err := handleDescribeServiceCallerMetric(timeoutVal.(map[string]map[string]map[string]float64), totalVal.(map[string]map[string]map[string]*model.CallerMetric))
		if err != nil {
			resp := model.NewResponse(int32(api.ExecuteException))
			resp.Info = err.Error()
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}
		ctx.JSON(model.CalcCode(resp.Code), resp)
		return
	}
}

func handleDescribeServiceCallerMetric(timeoutVal map[string]map[string]map[string]float64, totalVal map[string]map[string]map[string]*model.CallerMetric) (*model.Response, error) {

	ret := make([]*model.CallerMetric, 0, len(totalVal))

	for ns := range totalVal {
		for svc := range totalVal[ns] {
			for callerIp := range totalVal[ns][svc] {
				callerMetric := totalVal[ns][svc][callerIp]
				if _, ok := timeoutVal[ns]; !ok {
					continue
				}
				if _, ok := timeoutVal[ns][svc]; !ok {
					continue
				}
				if _, ok := timeoutVal[ns][svc][callerIp]; !ok {
					continue
				}
				callerMetric.AvgTimeout = timeoutVal[ns][svc][callerIp]
				ret = append(ret, callerMetric)
			}
		}
	}

	resp := model.NewResponse(int32(api.ExecuteSuccess))
	resp.Data = ret
	return &resp, nil
}

func describeServiceCallerMetricRequestTotal(conf *bootstrap.Config, service, namespace, calleeMethod,
	calleeInstance, start, end, step string) (map[string]map[string]map[string]*model.CallerMetric, error) {
	stepVal, _ := strconv.ParseInt(step, 10, 64)
	if stepVal < 60 {
		step = "10"
	}
	params := map[string]string{
		"start": start,
		"end":   end,
		"step":  step,
		"query": fmt.Sprintf(`sum(upstream_rq_total{callee_service="%s", callee_namespace="%s"}) by (caller_namespace, caller_service, caller_ip, callee_result)`, service, namespace),
	}
	if len(calleeMethod) != 0 {
		params["query"] = fmt.Sprintf(`sum(upstream_rq_total{callee_service="%s", callee_namespace="%s", callee_method="%s"}) by (caller_namespace, caller_service, caller_ip)`, service, namespace, calleeMethod)
	}
	if len(calleeInstance) != 0 {
		params["query"] = fmt.Sprintf(`sum(upstream_rq_total{callee_service="%s", callee_namespace="%s", callee_instance="%s"}) by (caller_namespace, caller_service, caller_ip)`, service, namespace, calleeInstance)
	}
	if len(calleeMethod) != 0 && len(calleeInstance) != 0 {
		params["query"] = fmt.Sprintf(`sum(upstream_rq_total{callee_service="%s", callee_namespace="%s", callee_method="%s", callee_instance="%s"}) by (caller_namespace, caller_service, caller_ip)`, service, namespace, calleeMethod, calleeInstance)
	}

	queryParams := &url.Values{}
	for k, v := range params {
		queryParams.Add(k, v)
	}

	promqlUrl := fmt.Sprintf("http://%s/api/v1/query_range?%s", conf.MonitorServer.Address, queryParams.Encode())
	resp, err := sendToPrometheus(promqlUrl)
	if err != nil {
		return nil, err
	}

	callerTotal := map[string]map[string]map[string]*model.CallerMetric{}
	for i := range resp.PrometheusData.Result {
		result := resp.PrometheusData.Result[i]
		callResult := result.Metric["callee_result"]
		callerIp := result.Metric["caller_ip"]
		callerService := result.Metric["caller_service"]
		callerNamespace := result.Metric["caller_namespace"]

		if _, ok := callerTotal[callerNamespace]; !ok {
			callerTotal[callerNamespace] = make(map[string]map[string]*model.CallerMetric)
		}
		if _, ok := callerTotal[callerNamespace][callerService]; !ok {
			callerTotal[callerNamespace][callerService] = make(map[string]*model.CallerMetric)
		}
		if _, ok := callerTotal[callerNamespace][callerService][callerIp]; !ok {
			callerTotal[callerNamespace][callerService][callerIp] = &model.CallerMetric{
				Host:      callerIp,
				Service:   callerService,
				Namespace: callerNamespace,
			}
		}

		caller := callerTotal[callerNamespace][callerService][callerIp]

		var total int64
		for i := range result.Values {
			metricVal := fmt.Sprintf("%s", result.Values[i][1])
			if metricVal == "NaN" {
				continue
			}
			v, _ := strconv.ParseInt(metricVal, 10, 64)
			total += v
		}

		switch callResult {
		case string(RetFail):
			caller.FailedRequest += total
		case string(RetFlowControl):
			caller.LimitedRequest += total
			caller.FailedRequest += total
		case string(RetReject):
			caller.CircuitbreakerRequest += total
			caller.FailedRequest += total
		}

		caller.TotalRequest += total
		caller.CalSuccessRate()
	}

	return callerTotal, nil
}

func describeServiceCallerMetricRequestTimeout(conf *bootstrap.Config, service, namespace, calleeMethod, calleeInstance,
	start, end, step string) (map[string]map[string]map[string]float64, error) {
	stepVal, _ := strconv.ParseInt(step, 10, 64)
	if stepVal < 60 {
		step = "10"
	}
	params := map[string]string{
		"start": start,
		"end":   end,
		"step":  step,
		"query": fmt.Sprintf(`avg(upstream_rq_timeout{callee_service="%s", callee_namespace="%s"}) by (caller_namespace, caller_service, caller_ip)`, service, namespace),
	}
	if len(calleeMethod) != 0 {
		params["query"] = fmt.Sprintf(`avg(upstream_rq_timeout{callee_service="%s", callee_namespace="%s", callee_method="%s"}) by (caller_namespace, caller_service, caller_ip)`, service, namespace, calleeMethod)
	}
	if len(calleeInstance) != 0 {
		params["query"] = fmt.Sprintf(`avg(upstream_rq_timeout{callee_service="%s", callee_namespace="%s", callee_instance="%s"}) by (caller_namespace, caller_service, caller_ip)`, service, namespace, calleeInstance)
	}
	if len(calleeInstance) != 0 && len(calleeMethod) != 0 {
		params["query"] = fmt.Sprintf(`avg(upstream_rq_timeout{callee_service="%s", callee_namespace="%s", callee_method="%s", callee_instance="%s"}) by (caller_namespace, caller_service, caller_ip)`, service, namespace, calleeMethod, calleeInstance)
	}

	queryParams := &url.Values{}
	for k, v := range params {
		queryParams.Add(k, v)
	}

	promqlUrl := fmt.Sprintf("http://%s/api/v1/query_range?%s", conf.MonitorServer.Address, queryParams.Encode())
	resp, err := sendToPrometheus(promqlUrl)
	if err != nil {
		return nil, err
	}

	callerTimeout := map[string]map[string]map[string]float64{}
	for i := range resp.PrometheusData.Result {
		result := resp.PrometheusData.Result[i]
		callerIp := result.Metric["caller_ip"]
		callerService := result.Metric["caller_service"]
		callerNamespace := result.Metric["caller_namespace"]

		if _, ok := callerTimeout[callerNamespace]; !ok {
			callerTimeout[callerNamespace] = make(map[string]map[string]float64)
		}
		if _, ok := callerTimeout[callerNamespace][callerService]; !ok {
			callerTimeout[callerNamespace][callerService] = make(map[string]float64)
		}
		if _, ok := callerTimeout[callerNamespace][callerService][callerIp]; !ok {
			callerTimeout[callerNamespace][callerService][callerIp] = 0
		}

		var (
			totalTimeout = float64(0)
			total        = 0
		)
		for i := range result.Values {
			metricVal := fmt.Sprintf("%s", result.Values[i][1])
			if metricVal == "NaN" {
				continue
			}
			total++
			v, _ := strconv.ParseFloat(metricVal, 64)
			totalTimeout += v
		}

		if total == 0 {
			callerTimeout[callerNamespace][callerService][callerIp] = 0
		} else {
			callerTimeout[callerNamespace][callerService][callerIp] = totalTimeout / float64(total)
		}
	}

	return callerTimeout, nil
}

func listAllService(ctx *gin.Context, conf *bootstrap.Config, namespace string) (*model.BatchQueryResponse, error) {
	userID, token, err := parseJWTThenSetToken(ctx, conf)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://%s%s/services/all?namespace="+namespace, conf.PolarisServer.Address, conf.WebServer.NamingV1URL), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("X-Polaris-Token", token)
	req.Header.Add("X-Polaris-User", userID)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	data, _ := io.ReadAll(resp.Body)
	defer resp.Body.Close()

	discoverResp := &model.BatchQueryResponse{}
	if err := json.Unmarshal(data, discoverResp); err != nil {
		return nil, err
	}
	if discoverResp.Code != api.ExecuteSuccess {
		return nil, fmt.Errorf("code=%d, info=%s", discoverResp.Code, discoverResp.Info)
	}

	return discoverResp, nil
}

func sendDiscoverRequest(ctx *gin.Context, conf *bootstrap.Config, namespace,
	service string, dt model.DiscoverRequest_DiscoverRequestType) (*model.DiscoverResponse, error) {

	_, token, err := parseJWTThenSetToken(ctx, conf)
	if err != nil {
		return nil, err
	}

	req := &model.DiscoverRequest{
		Type: dt,
		Service: &model.Service{
			Namespace: namespace,
			Name:      service,
			Token:     token,
		},
	}

	data, _ := json.Marshal(req)

	resp, err := http.Post(fmt.Sprintf("http://%s/v1/Discover", conf.PolarisServer.Address), "application/json", bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}

	data, _ = io.ReadAll(resp.Body)
	defer resp.Body.Close()

	discoverResp := &model.DiscoverResponse{}
	if err := json.Unmarshal(data, discoverResp); err != nil {
		return nil, err
	}
	if discoverResp.Code != api.ExecuteSuccess {
		return nil, fmt.Errorf("code=%d, info=%s", discoverResp.Code, discoverResp.Info)
	}

	return discoverResp, nil
}

func sendToPrometheus(promqlUrl string) (*model.PrometheusResponse, error) {
	resp, err := http.Get(promqlUrl)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)

	ret := &model.PrometheusResponse{}
	if err := json.Unmarshal(data, ret); err != nil {
		return nil, err
	}
	return ret, nil
}

func DescribeServiceInstances(conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		namespace := ctx.Query("namespace")
		service := ctx.Query("service")
		if len(namespace) == 0 || len(service) == 0 {
			resp := model.NewResponse(int32(api.BadRequest))
			resp.Info = "callee_namespace or callee_service is empty"
			ctx.JSON(model.CalcCode(resp.Code), resp)
			return
		}

		discoverResp, err := sendDiscoverRequest(ctx, conf, namespace, service, model.DiscoverRequest_INSTANCE)
		if err != nil {
			if discoverResp != nil {
				resp := model.NewResponse(int32(discoverResp.Code))
				resp.Info = discoverResp.Info
				ctx.JSON(model.CalcCode(resp.Code), resp)
				return
			}
			ctx.JSON(model.CalcCode(int32(api.ExecuteException)), err.Error())
			return
		}

		resp := model.NewResponse(int32(api.ExecuteSuccess))
		resp.Data = discoverResp.Instances
		ctx.JSON(model.CalcCode(resp.Code), resp)
		return
	}
}
