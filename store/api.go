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

package store

import "github.com/polarismesh/polaris-console/common/model/alarm"

// Store 通用存储接口
type Store interface {
	// Name 存储层的名字
	Name() string
	// Initialize 存储的初始化函数
	Initialize(c *Config) error
	// Destroy 存储的析构函数
	Destroy() error
	// LockStore distribution lock
	LockStore
	// AlarmRuleStore alarm rule store operation interface
	AlarmRuleStore
}

// LockStore distribution lock
type LockStore interface {
	// Lock do lock by key
	Lock(key string) error
	// Unlock do unlock by key
	Unlock(key string) error
}

// AlarmRuleStore alarm rule store operation interface
type AlarmRuleStore interface {
	// AddAlarmRule add alarm rule
	AddAlarmRule(rule *alarm.AlarmRule) error
	// UpdateAlarmRule update alarm rule
	UpdateAlarmRule(rule *alarm.AlarmRule) error
	// DeleteAlarmRule delete alarm rule
	DeleteAlarmRule(rule *alarm.AlarmRule) error
	// EnableAlarmRule enable alarm rule
	EnableAlarmRule(rule *alarm.AlarmRule) error
	// GetOneAlarmRule get one alarm rule by id
	GetOneAlarmRule(id string) (*alarm.AlarmRule, error)
	// GetAlarmRules get alarm rules
	GetAlarmRules(query map[string]string, offset, limit uint32) (uint32, []*alarm.AlarmRule, error)
	// GetAllAlarmRules get all alarm rules
	GetAllAlarmRules() ([]*alarm.AlarmRule, error)
}
