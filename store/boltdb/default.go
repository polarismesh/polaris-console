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
	"github.com/polarismesh/polaris-console/store"
)

const (
	// SystemNamespace system namespace
	SystemNamespace = "Polaris"
	// STORENAME database storage name
	STORENAME = "boltdbStore"
	// DefaultConnMaxLifetime default maximum connection lifetime
	DefaultConnMaxLifetime = 60 * 30 // 默认是30分钟
)

type boltStore struct {
	*alarmRuleStore
	*lockStore

	handler BoltHandler
	start   bool
}

// Name store name
func (m *boltStore) Name() string {
	return STORENAME
}

// Initialize init store
func (m *boltStore) Initialize(c *store.Config) error {
	if m.start {
		return nil
	}
	boltConfig := &BoltConfig{}
	boltConfig.Parse(c.Option)
	handler, err := NewBoltHandler(boltConfig)
	if err != nil {
		return err
	}
	m.handler = handler
	if err = m.newStore(); err != nil {
		_ = handler.Close()
		return err
	}
	m.start = true
	return nil
}

func (m *boltStore) newStore() error {
	m.lockStore = &lockStore{handle: m.handler}
	m.alarmRuleStore = &alarmRuleStore{handle: m.handler}
	return nil
}

// Destroy store
func (m *boltStore) Destroy() error {
	m.start = false
	if m.handler != nil {
		return m.handler.Close()
	}
	return nil
}

func init() {
	s := &boltStore{}
	_ = store.RegisterStore(s)
}
