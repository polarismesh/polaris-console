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

import (
	"fmt"
	"time"

	"github.com/polarismesh/polaris-console/common/operation"
)

const (
	MaxAlarmNameLength         = 32
	MaxAlarmTopicLength        = 64
	MaxAlarmMessageLength      = 256
	MaxAlarmCallbackInfoLength = 256
)

type ExprLabel string

const (
	LessThan           ExprLabel = "Lt"
	LessThanOrEqual    ExprLabel = "Le"
	GreaterThan        ExprLabel = "Gt"
	GreaterThanOrEqual ExprLabel = "Ge"
	Equal              ExprLabel = "Eq"
	NotEqual           ExprLabel = "Ne"
	Fluctuation        ExprLabel = "Fluctuation"
	Rise               ExprLabel = "Rise"
	Decline            ExprLabel = "Decline"
)

var (
	_promExpr = map[ExprLabel]string{
		LessThan:           "<",
		LessThanOrEqual:    "<=",
		GreaterThan:        ">",
		GreaterThanOrEqual: ">=",
		Equal:              "==",
		NotEqual:           "!=",
		Fluctuation:        "",
		Rise:               "",
		Decline:            "",
	}
)

type CallbackType string

const (
	ClsCallback     CallbackType = "CLS"
	WebhookCallback CallbackType = "WebHook"
)

type MonitorType string

const (
	BusinessMonitorType MonitorType = "Business"
)

// AlarmRule 告警策略
type AlarmRule struct {
	ID          string
	Name        string
	Enable      bool
	MonitorType MonitorType
	AlterExpr   AlterExpr
	Interval    string
	Topic       string
	Message     string
	Callback    Callback
	Revision    string
	CreateTime  time.Time
	ModifyTime  time.Time
	EnableTime  time.Time
	Valid       bool
}

type AlterExpr struct {
	MetricsName string    `json:"metrics_name"`
	Expr        ExprLabel `json:"expr"`
	Value       string    `json:"value"`
	For         string    `json:"for"`
}

func (a AlterExpr) ToPromQL() string {
	switch a.Expr {
	case Fluctuation:
		return fmt.Sprintf("abs(%s - %s offset %s) / (%s offset %s) >= %s", a.MetricsName, a.MetricsName, a.For, a.MetricsName, a.For, a.Value)
	case Rise:
		return fmt.Sprintf("%s - %s offset %s >= %s", a.MetricsName, a.MetricsName, a.For, a.Value)
	case Decline:
		return fmt.Sprintf("-1*(%s - %s offset %s) >= %s", a.MetricsName, a.MetricsName, a.For, a.Value)
	default:
		return fmt.Sprintf("%s %s %s", a.MetricsName, _promExpr[a.Expr], a.Value)
	}
}

type Callback struct {
	Type CallbackType `json:"type"`
	Info string       `json:"info"`
}

type AlarmChangeEvent struct {
	RuleID    string
	Revision  string
	Operation operation.OperationType
}
