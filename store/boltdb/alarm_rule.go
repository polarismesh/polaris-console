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

package boltdb

import "github.com/polarismesh/polaris-console/common/model/alarm"

type alarmRuleStore struct {
	handle BoltHandler
}

// AddAlarmRule add alarm rule
func (a *alarmRuleStore) AddAlarmRule(rule *alarm.AlarmRule) error {

	return nil
}

// UpdateAlarmRule update alarm rule
func (a *alarmRuleStore) UpdateAlarmRule(rule *alarm.AlarmRule) error {
	return nil
}

// DeleteAlarmRule delete alarm rule
func (a *alarmRuleStore) DeleteAlarmRule(rule *alarm.AlarmRule) error {
	return nil
}

// EnableAlarmRule enable alarm rule
func (a *alarmRuleStore) EnableAlarmRule(rule *alarm.AlarmRule) error {
	return nil
}

func (a *alarmRuleStore) GetOneAlarmRule(id string) (*alarm.AlarmRule, error) {
	return nil, nil
}

// GetAlarmRules get alarm rules
func (a *alarmRuleStore) GetAlarmRules(query map[string]string, offset, limit uint32) (uint32, []*alarm.AlarmRule, error) {
	return 0, nil, nil
}

func (a *alarmRuleStore) GetAllAlarmRules() ([]*alarm.AlarmRule, error) {
	return nil, nil
}
