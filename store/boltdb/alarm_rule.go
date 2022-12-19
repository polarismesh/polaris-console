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

import (
	"encoding/json"
	"errors"
	"sort"
	"strings"
	"time"

	commonhttp "github.com/polarismesh/polaris-console/common/http"
	"github.com/polarismesh/polaris-console/common/model/alarm"
)

var (
	ErrorMultiAlarmFound = errors.New("found multi alarm rule")
)

const (
	tblAlarm = "alarm_rule"

	alarmFieldID          = "ID"
	alarmFieldName        = "Name"
	alarmFieldEnable      = "Enable"
	alarmFieldMonitorType = "MonitorType"
	alarmFieldAlterExpr   = "AlterExpr"
	alarmFieldInterval    = "Interval"
	alarmFieldTopic       = "Topic"
	alarmFieldMessage     = "Message"
	alarmFieldCallback    = "Callback"
	alarmFieldRevision    = "Revision"
	alarmFieldCreateTime  = "CreateTime"
	alarmFieldModifyTime  = "ModifyTime"
	alarmFieldEnableTime  = "EnableTime"
)

type alarmRuleForStore struct {
	ID          string
	Name        string
	Enable      bool
	MonitorType string
	AlterExpr   string
	Interval    string
	Topic       string
	Message     string
	Callback    string
	Revision    string
	CreateTime  time.Time
	ModifyTime  time.Time
	EnableTime  time.Time
}

type alarmRuleStore struct {
	handle BoltHandler
}

// AddAlarmRule add alarm rule
func (a *alarmRuleStore) AddAlarmRule(rule *alarm.AlarmRule) error {
	if len(rule.ID) == 0 {
		return errors.New("invalid alarm rule id")
	}

	tn := time.Now()
	rule.CreateTime = tn
	rule.ModifyTime = tn

	if rule.Enable {
		rule.EnableTime = tn
	} else {
		rule.EnableTime = time.Time{}
	}

	return a.handle.SaveValue(tblAlarm, rule.ID, a.parseToStore(rule))
}

// UpdateAlarmRule update alarm rule
func (a *alarmRuleStore) UpdateAlarmRule(rule *alarm.AlarmRule) error {
	if len(rule.ID) == 0 {
		return errors.New("invalid alarm rule id")
	}

	alterExpr, _ := json.Marshal(rule.AlterExpr)
	callback, _ := json.Marshal(rule.Callback)

	properties := map[string]interface{}{
		alarmFieldName:        rule.Name,
		alarmFieldAlterExpr:   alterExpr,
		alarmFieldCallback:    callback,
		alarmFieldInterval:    rule.Interval,
		alarmFieldTopic:       rule.Topic,
		alarmFieldMessage:     rule.Message,
		alarmFieldRevision:    rule.Revision,
		alarmFieldMonitorType: rule.MonitorType,
		alarmFieldModifyTime:  time.Now(),
	}

	return a.handle.UpdateValue(tblAlarm, rule.ID, properties)
}

// DeleteAlarmRule delete alarm rule
func (a *alarmRuleStore) DeleteAlarmRule(rule *alarm.AlarmRule) error {
	if len(rule.ID) == 0 {
		return errors.New("invalid alarm rule id")
	}
	return a.handle.DeleteValues(tblAlarm, []string{rule.ID})
}

// EnableAlarmRule enable alarm rule
func (a *alarmRuleStore) EnableAlarmRule(rule *alarm.AlarmRule) error {
	if len(rule.ID) == 0 {
		return errors.New("invalid alarm rule id")
	}

	if rule.Enable {
		rule.EnableTime = time.Now()
	} else {
		rule.EnableTime = time.Time{}
	}

	properties := map[string]interface{}{
		alarmFieldEnable:     rule.Enable,
		alarmFieldRevision:   rule.Revision,
		alarmFieldEnableTime: rule.EnableTime,
		alarmFieldModifyTime: time.Now(),
	}

	return a.handle.UpdateValue(tblAlarm, rule.ID, properties)
}

func (a *alarmRuleStore) GetOneAlarmRule(id string) (*alarm.AlarmRule, error) {
	if len(id) == 0 {
		return nil, errors.New("invalid alarm rule id")
	}

	val, err := a.handle.LoadValues(tblAlarm, []string{id}, &alarmRuleForStore{})
	if err != nil {
		return nil, err
	}

	if len(val) == 0 {
		return nil, nil
	}

	if len(val) > 1 {
		return nil, ErrorMultiAlarmFound
	}

	return a.parseToModel(val[id].(*alarmRuleForStore)), nil
}

// GetAlarmRules get alarm rules
func (a *alarmRuleStore) GetAlarmRules(query map[string]string, offset, limit uint32) (uint32, []*alarm.AlarmRule, error) {
	fields := []string{alarmFieldID, alarmFieldName}
	searchId, hasId := query["id"]
	searchName, hashName := query["name"]

	ret, err := a.handle.LoadValuesByFilter(tblAlarm, fields, &alarmRuleForStore{}, func(m map[string]interface{}) bool {
		saveId, _ := m[alarmFieldID].(string)
		saveName, _ := m[alarmFieldName].(string)

		if hasId && strings.Compare(saveId, searchId) != 0 {
			return false
		}

		if hashName {
			searchName, wild := commonhttp.ParseWildName(searchName)
			if wild && !strings.Contains(saveName, searchName) {
				return false
			}
			return strings.Compare(searchName, saveName) == 0
		}

		return true
	})
	if err != nil {
		return 0, nil, err
	}

	return uint32(len(ret)), a.doAlarmRulePage(ret, offset, limit), nil
}

// doAlarmRulePage 进行分页
func (a *alarmRuleStore) doAlarmRulePage(ret map[string]interface{}, offset, limit uint32) []*alarm.AlarmRule {
	rules := make([]*alarm.AlarmRule, 0, len(ret))
	beginIndex := offset
	endIndex := beginIndex + limit
	totalCount := uint32(len(ret))

	if totalCount == 0 {
		return rules
	}
	if beginIndex >= endIndex {
		return rules
	}
	if beginIndex >= totalCount {
		return rules
	}
	if endIndex > totalCount {
		endIndex = totalCount
	}
	for k := range ret {
		rules = append(rules, a.parseToModel(ret[k].(*alarmRuleForStore)))
	}

	sort.Slice(rules, func(i, j int) bool {
		return rules[i].ModifyTime.After(rules[j].ModifyTime)
	})

	return rules[beginIndex:endIndex]
}

func (a *alarmRuleStore) GetAllAlarmRules() ([]*alarm.AlarmRule, error) {
	ret, err := a.handle.LoadValuesAll(tblAlarm, &alarmRuleForStore{})
	if err != nil {
		return nil, err
	}

	values := make([]*alarm.AlarmRule, 0, len(ret))
	for k := range ret {
		values = append(values, a.parseToModel(ret[k].(*alarmRuleForStore)))
	}

	return values, nil
}

func (a *alarmRuleStore) parseToStore(r *alarm.AlarmRule) *alarmRuleForStore {
	alterExpr, _ := json.Marshal(r.AlterExpr)
	callback, _ := json.Marshal(r.Callback)

	return &alarmRuleForStore{
		ID:          r.ID,
		Name:        r.Name,
		Enable:      r.Enable,
		MonitorType: string(r.MonitorType),
		AlterExpr:   string(alterExpr),
		Interval:    r.Interval,
		Topic:       r.Topic,
		Message:     r.Message,
		Callback:    string(callback),
		Revision:    r.Revision,
		CreateTime:  r.CreateTime,
		ModifyTime:  r.ModifyTime,
		EnableTime:  r.EnableTime,
	}
}

func (a *alarmRuleStore) parseToModel(r *alarmRuleForStore) *alarm.AlarmRule {
	var alterExpr alarm.AlterExpr
	_ = json.Unmarshal([]byte(r.AlterExpr), &alterExpr)
	var callback alarm.Callback
	_ = json.Unmarshal([]byte(r.Callback), &callback)

	return &alarm.AlarmRule{
		ID:          r.ID,
		Name:        r.Name,
		Enable:      r.Enable,
		MonitorType: alarm.MonitorType(r.MonitorType),
		AlterExpr:   alterExpr,
		Interval:    r.Interval,
		Topic:       r.Topic,
		Message:     r.Message,
		Callback:    callback,
		Revision:    r.Revision,
		CreateTime:  r.CreateTime,
		ModifyTime:  r.ModifyTime,
		EnableTime:  r.EnableTime,
	}
}
