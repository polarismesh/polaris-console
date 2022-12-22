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
	"reflect"
	"strconv"

	"github.com/polarismesh/polaris-console/common/api"
	"github.com/polarismesh/polaris-console/common/model/alarm"
	commontime "github.com/polarismesh/polaris-console/common/time"
)

func ParseToAPI(rule alarm.AlarmRule) api.AlarmRule {
	forInt, _ := strconv.ParseInt(rule.AlterExpr.For[:len(rule.AlterExpr.For)-1], 10, 32)
	intervalInt, _ := strconv.ParseInt(rule.Interval[:len(rule.Interval)-1], 10, 32)

	return api.AlarmRule{
		ID:          rule.ID,
		Name:        rule.Name,
		Enable:      rule.Enable,
		MonitorType: rule.MonitorType,
		AlterExpr: api.AlterExpr{
			MetricsName: rule.AlterExpr.MetricsName,
			Expr:        rule.AlterExpr.Expr,
			Value:       rule.AlterExpr.Value,
			For:         int32(forInt),
			ForUnit:     rule.AlterExpr.For[len(rule.AlterExpr.For)-1:],
		},
		Interval:     int32(intervalInt),
		IntervalUnit: rule.Interval[len(rule.Interval)-1:],
		Topic:        rule.Topic,
		Message:      rule.Message,
		Callback: api.Callback{
			Type: rule.Callback.Type,
			Info: rule.Callback.Info,
		},
		Revision:   rule.Revision,
		CreateTime: commontime.Time2String(rule.CreateTime),
		ModifyTime: commontime.Time2String(rule.ModifyTime),
		EnableTime: commontime.Time2String(rule.EnableTime),
	}
}

func ParseToStore(rule api.AlarmRule) alarm.AlarmRule {
	return alarm.AlarmRule{
		ID:          rule.ID,
		Name:        rule.Name,
		Enable:      rule.Enable,
		MonitorType: rule.MonitorType,
		AlterExpr: alarm.AlterExpr{
			MetricsName: rule.AlterExpr.MetricsName,
			Expr:        rule.AlterExpr.Expr,
			Value:       rule.AlterExpr.Value,
			For:         fmt.Sprintf("%d%s", rule.AlterExpr.For, rule.AlterExpr.ForUnit),
		},
		Interval: fmt.Sprintf("%d%s", rule.Interval, rule.IntervalUnit),
		Topic:    rule.Topic,
		Message:  rule.Message,
		Callback: alarm.Callback{
			Type: rule.Callback.Type,
			Info: rule.Callback.Info,
		},
	}
}

// UpdateAlarmRuleAttribute update alarm rule attribute
func UpdateAlarmRuleAttribute(req *api.AlarmRule, data *alarm.AlarmRule) (bool, *alarm.AlarmRule) {
	needUpdate := false
	if data.Topic != req.Topic {
		needUpdate = true
		data.Topic = req.Topic
	}
	if data.Message != req.Message {
		needUpdate = true
		data.Message = req.Message
	}
	if data.Interval != fmt.Sprintf("%d%s", req.Interval, req.IntervalUnit) {
		needUpdate = true
		data.Interval = fmt.Sprintf("%d%s", req.Interval, req.IntervalUnit)
	}
	if !reflect.DeepEqual(data.AlterExpr, alarm.AlterExpr{
		MetricsName: req.AlterExpr.MetricsName,
		Expr:        req.AlterExpr.Expr,
		Value:       req.AlterExpr.Value,
		For:         fmt.Sprintf("%d%s", req.AlterExpr.For, req.AlterExpr.ForUnit),
	}) {
		needUpdate = true
		data.AlterExpr = alarm.AlterExpr{
			MetricsName: req.AlterExpr.MetricsName,
			Expr:        req.AlterExpr.Expr,
			Value:       req.AlterExpr.Value,
			For:         fmt.Sprintf("%d%s", req.AlterExpr.For, req.AlterExpr.ForUnit),
		}
	}
	if !reflect.DeepEqual(data.Callback, req.Callback) {
		needUpdate = true
		data.Callback = alarm.Callback{
			Type: req.Callback.Type,
			Info: req.Callback.Info,
		}
	}

	return needUpdate, data
}
