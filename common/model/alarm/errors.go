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

package alarm

import "errors"

var (
	ErrorAlarmNameInvalid    = errors.New("alarm rule name invalid")
	ErrorAlarmTopicInvalid   = errors.New("alarm rule topic invalid")
	ErrorAlarmMessageInvalid = errors.New("alarm rule message invalid")
	ErrorMonitorTypeInvalid  = errors.New("alarm rule monitor type invalid")

	ErrorExprLabelInvalid = errors.New("alarm expr label invalid")

	ErrorCallbackTypeInvalid    = errors.New("alarm callback type invalid")
	ErrorCallbackInfoInvalid    = errors.New("alarm callback info invalid")
	ErrorCallbackCLSInvalid     = errors.New("alarm callback cls TopicId invalid")
	ErrorCallbackWebHookInvalid = errors.New("alarm callback webhook url invalid")
)
