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
	"github.com/polarismesh/polaris-console/common/api"
	"github.com/polarismesh/polaris-console/common/model/alarm"
	commontime "github.com/polarismesh/polaris-console/common/time"
)

func ParseToAPI(rule alarm.AlarmRule) api.AlarmRule {
	return api.AlarmRule{
		ID:          rule.ID,
		Name:        rule.Name,
		Enable:      rule.Enable,
		MonitorType: rule.MonitorType,
		AlterExpr: api.AlterExpr{
			MetricsName: rule.AlterExpr.MetricsName,
			Expr:        rule.AlterExpr.Expr,
			Value:       rule.AlterExpr.Value,
			For:         rule.AlterExpr.For,
		},
		Interval: rule.Interval,
		Topic:    rule.Topic,
		Message:  rule.Message,
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
			For:         rule.AlterExpr.For,
		},
		Interval: rule.Interval,
		Topic:    rule.Topic,
		Message:  rule.Message,
		Callback: alarm.Callback{
			Type: rule.Callback.Type,
			Info: rule.Callback.Info,
		},
	}
}

func UpdateAlarmRuleAttribute(req *api.AlarmRule, data *alarm.AlarmRule) (bool, *alarm.AlarmRule) {
	return true, data
}
