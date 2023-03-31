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

type DiscoverRequest_DiscoverRequestType int32

const (
	DiscoverRequest_UNKNOWN         DiscoverRequest_DiscoverRequestType = 0
	DiscoverRequest_INSTANCE        DiscoverRequest_DiscoverRequestType = 1
	DiscoverRequest_CLUSTER         DiscoverRequest_DiscoverRequestType = 2
	DiscoverRequest_ROUTING         DiscoverRequest_DiscoverRequestType = 3
	DiscoverRequest_RATE_LIMIT      DiscoverRequest_DiscoverRequestType = 4
	DiscoverRequest_CIRCUIT_BREAKER DiscoverRequest_DiscoverRequestType = 5
	DiscoverRequest_SERVICES        DiscoverRequest_DiscoverRequestType = 6
	DiscoverRequest_NAMESPACES      DiscoverRequest_DiscoverRequestType = 12
	DiscoverRequest_FAULT_DETECTOR  DiscoverRequest_DiscoverRequestType = 13
)

type DiscoverRequest struct {
	Type    DiscoverRequest_DiscoverRequestType `protobuf:"varint,1,opt,name=type,proto3,enum=v1.DiscoverRequest_DiscoverRequestType" json:"type,omitempty"`
	Service *Service                            `protobuf:"bytes,2,opt,name=service,proto3" json:"service,omitempty"`
}

type DiscoverResponse struct {
	Code      uint32      `protobuf:"bytes,1,opt,name=code,proto3" json:"code,omitempty"`
	Info      string      `protobuf:"bytes,2,opt,name=info,proto3" json:"info,omitempty"`
	Service   *Service    `protobuf:"bytes,4,opt,name=service,proto3" json:"service,omitempty"`
	Services  []*Service  `protobuf:"bytes,9,rep,name=services,proto3" json:"services,omitempty"`
	Instances []*Instance `protobuf:"bytes,5,rep,name=instances,proto3" json:"instances,omitempty"`
}

type Service struct {
	Name                 string            `json:"name,omitempty"`
	Namespace            string            `json:"namespace,omitempty"`
	Metadata             map[string]string `json:"metadata,omitempty"`
	Ports                string            `json:"ports,omitempty"`
	Token                string            `protobuf:"bytes,12,opt,name=token,proto3" json:"token,omitempty"`
	TotalInstanceCount   uint32            `json:"total_instance_count,omitempty"`
	HealthyInstanceCount uint32            `json:"healthy_instance_count,omitempty"`
}

type Instance struct {
	Id           string            `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	Service      string            `protobuf:"bytes,2,opt,name=service,proto3" json:"service,omitempty"`
	Namespace    string            `protobuf:"bytes,3,opt,name=namespace,proto3" json:"namespace,omitempty"`
	VpcId        string            `protobuf:"bytes,21,opt,name=vpc_id,proto3" json:"vpc_id,omitempty"`
	Host         string            `protobuf:"bytes,4,opt,name=host,proto3" json:"host,omitempty"`
	Port         uint32            `protobuf:"bytes,5,opt,name=port,proto3" json:"port,omitempty"`
	Protocol     string            `protobuf:"bytes,6,opt,name=protocol,proto3" json:"protocol,omitempty"`
	Version      string            `protobuf:"bytes,7,opt,name=version,proto3" json:"version,omitempty"`
	Priority     uint32            `protobuf:"bytes,8,opt,name=priority,proto3" json:"priority,omitempty"`
	Weight       uint32            `protobuf:"bytes,9,opt,name=weight,proto3" json:"weight,omitempty"`
	Healthy      bool              `protobuf:"bytes,11,opt,name=healthy,proto3" json:"healthy,omitempty"`
	Isolate      bool              `protobuf:"bytes,12,opt,name=isolate,proto3" json:"isolate,omitempty"`
	Metadata     map[string]string `protobuf:"bytes,14,rep,name=metadata,proto3" json:"metadata,omitempty" protobuf_key:"bytes,1,opt,name=key,proto3" protobuf_val:"bytes,2,opt,name=value,proto3"`
	LogicSet     string            `protobuf:"bytes,15,opt,name=logic_set,proto3" json:"logic_set,omitempty"`
	Ctime        string            `protobuf:"bytes,16,opt,name=ctime,proto3" json:"ctime,omitempty"`
	Mtime        string            `protobuf:"bytes,17,opt,name=mtime,proto3" json:"mtime,omitempty"`
	Revision     string            `protobuf:"bytes,18,opt,name=revision,proto3" json:"revision,omitempty"`
	ServiceToken string            `protobuf:"bytes,19,opt,name=service_token,proto3" json:"service_token,omitempty"`
}
