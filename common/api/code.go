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

package api

// 北极星错误码
// 六位构成，前面三位参照HTTP Status的标准
// 后面三位，依据内部的具体错误自定义
const (
	ExecuteSuccess      uint32 = 200000
	DataNoChange        uint32 = 200001
	NoNeedUpdate        uint32 = 200002
	BadRequest          uint32 = 400000
	ParseException      uint32 = 400001
	EmptyRequest        uint32 = 400002
	BatchSizeOverLimit  uint32 = 400003
	InvalidRequestID    uint32 = 400100
	InvalidParameter    uint32 = 400103
	EmptyQueryParameter uint32 = 400104
	NotFoundResource    uint32 = 400202
	ExistedResource     uint32 = 400201
	ExecuteException    uint32 = 500000
	StoreLayerException uint32 = 500001
)

// code to string
// code的字符串描述信息
var code2info = map[uint32]string{
	ExecuteSuccess:      "execute success",
	DataNoChange:        "discover data is no change",
	NoNeedUpdate:        "update data is no change, no need to update",
	NotFoundResource:    "not found resource",
	BadRequest:          "bad request",
	ParseException:      "request decode failed",
	EmptyRequest:        "empty request",
	BatchSizeOverLimit:  "batch size over the limit",
	InvalidRequestID:    "invalid request id",
	InvalidParameter:    "invalid parameter",
	EmptyQueryParameter: "query instance parameter is empty",
	ExecuteException:    "execute exception",
	ExistedResource:     "existed resource",
	StoreLayerException: "store layer exception",
}

// code to info
func Code2Info(code uint32) string {
	info, ok := code2info[code]
	if ok {
		return info
	}

	return ""
}
