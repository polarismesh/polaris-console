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

package model

type PrometheusResponse struct {
	Status         string         `json:"status"`
	PrometheusData PrometheusData `json:"data"`
}

type PrometheusData struct {
	ResultType string             `json:"resultType"`
	Result     []PrometheusResult `json:"result"`
}

type PrometheusResult struct {
	Metric map[string]string `json:"metric"`
	Values [][]interface{}   `json:"values"`
}

type ServiceMetric struct {
	Name                  string  `json:"name"`
	Namespace             string  `json:"namespace"`
	HealthyInstanceCount  int64   `json:"healthy_instance_count"`
	TotalInstanceCount    int64   `json:"total_instance_count"`
	SuccessRate           float64 `json:"success_rate"`
	TotalRequest          int64   `json:"total_request"`
	FailedRequest         int64   `json:"failed_request"`
	LimitedRequest        int64   `json:"limited_request"`
	CircuitbreakerRequest int64   `json:"circuitbreaker_request"`
	AvgTimeout            float64 `json:"avg_timeout"`
}

func (i *ServiceMetric) CalSuccessRate() {
	if i.TotalRequest != 0 {
		i.SuccessRate = (float64(i.TotalRequest) - float64(i.FailedRequest)) / float64(i.TotalRequest)
	}
}

type InterfaceMetrics struct {
	CategoryService    *InterfaceMetric   `json:"category_service"`
	CategoryUnKnown    *InterfaceMetric   `json:"category_unknown"`
	CategoryInterfaces []*InterfaceMetric `json:"category_interfaces"`
}

type InterfaceStatus string

const (
	InterfaceStatusNormal         InterfaceStatus = "normal"
	InterfaceStatusCircuitbreaker InterfaceStatus = "circuitbreaker"
)

type InterfaceMetric struct {
	InterfaceName      string          `json:"interface_name"`
	Status             InterfaceStatus `json:"status"`
	SuccessRequest     int64           `json:"success_request"`
	FlowControlRequest int64           `json:"flow_control_request"`
	AbnormalRequest    int64           `json:"abnormal_request"`
	AvgTimeout         float64         `json:"avg_timeout"`
}

type InstanceStatus string

const (
	InstanceStatusHealthy   InstanceStatus = "health"
	InstanceStatusUnHealthy InstanceStatus = "unhealth"
	InstanceStatusOffline   InstanceStatus = "offline"
)

type InstanceMetric struct {
	ID                    string         `json:"id"`
	Host                  string         `json:"host"`
	Port                  uint32         `json:"port"`
	Status                InstanceStatus `json:"status"`
	Isolate               bool           `json:"isolate"`
	SuccessRate           float64        `json:"success_rate"`
	TotalRequest          int64          `json:"total_request"`
	FailedRequest         int64          `json:"failed_request"`
	LimitedRequest        int64          `json:"limited_request"`
	CircuitbreakerRequest int64          `json:"circuitbreaker_request"`
	AvgTimeout            float64        `json:"avg_timeout"`
}

func (i *InstanceMetric) CalSuccessRate() {
	if i.TotalRequest != 0 {
		i.SuccessRate = (float64(i.TotalRequest) - float64(i.FailedRequest)) / float64(i.TotalRequest)
	}
}

type CallerMetric struct {
	Host                  string  `json:"host"`
	Namespace             string  `json:"namespace"`
	Service               string  `json:"service"`
	SuccessRate           float64 `json:"success_rate"`
	TotalRequest          int64   `json:"total_request"`
	FailedRequest         int64   `json:"failed_request"`
	LimitedRequest        int64   `json:"limited_request"`
	CircuitbreakerRequest int64   `json:"circuitbreaker_request"`
	AvgTimeout            float64 `json:"avg_timeout"`
}

func (i *CallerMetric) CalSuccessRate() {
	if i.TotalRequest != 0 {
		i.SuccessRate = (float64(i.TotalRequest) - float64(i.FailedRequest)) / float64(i.TotalRequest)
	}
}
