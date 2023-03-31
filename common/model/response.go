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

import "github.com/polarismesh/polaris-console/common/api"

func NewResponse(code int32) Response {
	return Response{
		Code: code,
		Info: api.Code2Info(uint32(code)),
	}
}

type Response struct {
	Code int32       `json:"code"`
	Info string      `json:"info"`
	Data interface{} `json:"data"`
}

func NewQueryResponse(code int32) *QueryResponse {
	return &QueryResponse{
		Code:   code,
		Info:   api.Code2Info(uint32(code)),
		Amount: 0,
		Size:   0,
	}
}

type QueryResponse struct {
	Code       int32       `json:"code"`
	Info       string      `json:"info"`
	Data       interface{} `json:"data"`
	Size       uint32      `json:"size"`
	Amount     uint64      `json:"amount"`
	ExtendInfo string      `json:"extend_info,omitempty"`
	HashNext   bool        `json:"hash_next,omitempty"`
}

func NewBatchWriteResponse(code int32) *BatchWriteResponse {
	return &BatchWriteResponse{
		Code:      code,
		Info:      api.Code2Info(uint32(code)),
		Responses: make([]*Response, 0, 4),
		Size:      0,
	}
}

type BatchQueryResponse struct {
	Code     uint32     `protobuf:"bytes,1,opt,name=code,proto3" json:"code,omitempty"`
	Info     string     `protobuf:"bytes,2,opt,name=info,proto3" json:"info,omitempty"`
	Amount   uint32     `protobuf:"bytes,3,opt,name=amount,proto3" json:"amount,omitempty"`
	Size     uint32     `protobuf:"bytes,4,opt,name=size,proto3" json:"size,omitempty"`
	Services []*Service `protobuf:"bytes,6,rep,name=services,proto3" json:"services,omitempty"`
}

type BatchWriteResponse struct {
	Code      int32       `json:"code"`
	Info      string      `json:"info"`
	Size      int32       `json:"size"`
	Responses []*Response `json:"responses"`
}

func (b *BatchWriteResponse) Collect(response *Response) {
	// 非200的code，都归为异常
	if CalcCode(response.Code) != 200 {
		if response.Code >= b.Code {
			b.Code = response.Code
			b.Info = api.Code2Info(uint32(b.Code))
		}
	}

	b.Size++
	b.Responses = append(b.Responses, response)
}

func CalcCode(code int32) int {
	return int(uint32(int(code / 1000)))
}

type ServerNodes struct {
	Code  int    `json:"code"`
	Info  string `json:"info"`
	Nodes []struct {
		ID   string `json:"id"`
		Host string `json:"host"`
		Port int    `json:"port"`
	} `json:"instances"`
}
