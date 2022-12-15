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

package handlers

import (
	"context"
	"net/url"
	"sync/atomic"
	"time"

	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/alertmanager"
	"github.com/polarismesh/polaris-console/common/configfile"
	"github.com/polarismesh/polaris-console/common/eventhub"
	"github.com/polarismesh/polaris-console/common/log"
	"github.com/polarismesh/polaris-console/common/model/alarm"
	"github.com/polarismesh/polaris-console/common/prometheus"
	api "github.com/polarismesh/polaris-console/common/prometheus"
	"github.com/polarismesh/polaris-console/store"
	"github.com/prometheus/common/model"
	"go.uber.org/zap"
	"golang.org/x/sync/singleflight"
	"gopkg.in/yaml.v3"
)

const (
	_publishAlarmRule = "publish_alarm_rule"
)

func NewAlarmChangeEventSubscriber(boot *bootstrap.Config) (*AlarmChangeEventSubscriber, error) {
	s, err := store.GetStore()
	if err != nil {
		return nil, err
	}

	subscriber := &AlarmChangeEventSubscriber{
		boot:  boot,
		store: s,
	}

	if _, err := subscriber.handle(); err != nil {
		log.Info("[AlarmRule] redo publish alarm rule on startup", zap.Error(err))
	}

	go subscriber.doRetry()
	if err := eventhub.Subscribe(eventhub.AlarmRuleChangeEventTopic, _publishAlarmRule, subscriber.onEvent); err != nil {
		return nil, err
	}

	return subscriber, nil
}

type AlarmChangeEventSubscriber struct {
	boot  *bootstrap.Config
	store store.Store

	retryWork int32
	executor  singleflight.Group
}

func (s *AlarmChangeEventSubscriber) onEvent(ctx context.Context, event interface{}) error {
	e, ok := event.(*alarm.AlarmChangeEvent)
	if !ok {
		return nil
	}

	log.Info("[AlarmRule] receive alarm rule change event", zap.Any("event", e))

	s.executor.Do(_publishAlarmRule, s.handle)

	return nil
}

func (s *AlarmChangeEventSubscriber) handle() (interface{}, error) {
	atomic.StoreInt32(&s.retryWork, 0)

	timer := time.NewTimer(time.Second)
	defer timer.Stop()

	for i := 0; i < 3; i++ {
		if !s.doPublishRuleFile() {
			<-timer.C
			timer.Reset(time.Second)
			continue
		} else {
			return nil, nil
		}
	}

	atomic.StoreInt32(&s.retryWork, 1)
	return nil, nil
}

func (s *AlarmChangeEventSubscriber) doPublishRuleFile() bool {
	if err := s.store.Lock(_publishAlarmRule); err != nil {
		log.Error("[AlarmRule] do lock on publish alarm rule", zap.Error(err))
		return false
	}

	defer func() {
		if err := s.store.Unlock(_publishAlarmRule); err != nil {
			log.Error("[AlarmRule] do unlock on publish alarm rule", zap.Error(err))
		}
	}()

	// 从数据库中加载所有的告警策略
	rules, err := s.store.GetAllAlarmRules()
	if err != nil {
		log.Error("[AlarmRule] load all alarm rules from db", zap.Error(err))
		return false
	}

	if err := s.publishPrometheusRule(rules); err != nil {
		log.Error("[AlarmRule] do publish prometheus rule", zap.Error(err))
		return false
	}

	if err := s.publishAlterManagerRule(rules); err != nil {
		log.Error("[AlarmRule] do pubilsh altermanager rule", zap.Error(err))
		return false
	}

	log.Info("[AlarmRule] do pubilsh rule to prometheus and altermanager success")
	return true
}

func (s *AlarmChangeEventSubscriber) publishPrometheusRule(rules []*alarm.AlarmRule) error {
	apiRuleGroup := &prometheus.RuleGroup{
		Name:  "POLARIS_ALARM",
		Rules: []api.Rule{},
	}

	for i := range rules {
		rule := rules[i]

		if !rule.Enable {
			continue
		}

		enrichedRule := prometheus.AlertingRule{
			Alert: rule.Name,
			Expr:  rule.AlterExpr.ToPromQL(),
			For:   rule.AlterExpr.For,
			Labels: map[string]string{
				"rule_id":       rule.ID,
				"monitor_type":  string(rule.MonitorType),
				"callback_type": string(rule.Callback.Type),
			},
			Annotations: map[string]string{
				"topic":   rule.Topic,
				"message": rule.Message,
			},
		}
		apiRuleGroup.Rules = append(apiRuleGroup.Rules, enrichedRule)
	}

	res := &api.RuleDiscovery{RuleGroups: []*api.RuleGroup{apiRuleGroup}}

	content, err := yaml.Marshal(res)
	if err != nil {
		return err
	}

	_, err = configfile.PublishConfig(configfile.ConfigFile{
		Namespace: "Polaris",
		Group:     "Polaris-System",
		FileName:  "prom-alarm-rules.yml",
		Content:   string(content),
		Comment:   "Polaris 告警规则",
	})
	return err
}

func (s *AlarmChangeEventSubscriber) publishAlterManagerRule(rules []*alarm.AlarmRule) error {

	cfg := alertmanager.Config{
		Receivers: make([]*alertmanager.Receiver, 0, 4),
		Route: &alertmanager.Route{
			Receiver: "local_alert_history",
			Routes:   make([]*alertmanager.Route, 0, 4),
		},
	}
	cfg.Receivers = append(cfg.Receivers, &alertmanager.Receiver{
		Name:           "local_alert_history",
		CLSConfigs:     []*alertmanager.CLSConfig{},
		WebhookConfigs: []*alertmanager.WebhookConfig{},
		LocalLoggerConfigs: []*alertmanager.LocalLoggerConfig{
			{
				Path: "/data/alert_history",
			},
		},
	})

	for i := range rules {
		rule := rules[i]
		if !rule.Enable {
			continue
		}

		interval, _ := model.ParseDuration(rule.Interval)
		route := &alertmanager.Route{
			Receiver: rule.ID,
			Match: map[string]string{
				"rule_id":       rule.ID,
				"monitor_type":  string(rule.MonitorType),
				"callback_type": string(rule.Callback.Type),
			},
			Continue: true,
			Routes: []*alertmanager.Route{
				{
					Receiver: "local_alert_history",
					Match: map[string]string{
						"rule_id":       rule.ID,
						"monitor_type":  string(rule.MonitorType),
						"callback_type": string(rule.Callback.Type),
					},
				},
			},
			RepeatInterval: &interval,
		}

		receiver := &alertmanager.Receiver{
			Name:           rule.ID,
			WebhookConfigs: []*alertmanager.WebhookConfig{},
			CLSConfigs:     []*alertmanager.CLSConfig{},
		}

		// 设置 receivers 列表
		if rule.Callback.Type == alarm.ClsCallback {
			receiver.CLSConfigs = append(receiver.CLSConfigs, &alertmanager.CLSConfig{
				TopicID: rule.Callback.Info["topic_id"],
			})
		}
		if rule.Callback.Type == alarm.WebhookCallback {
			url, _ := url.Parse(rule.Callback.Info["url"])
			receiver.WebhookConfigs = append(receiver.WebhookConfigs, &alertmanager.WebhookConfig{
				URL: &alertmanager.URL{
					URL: url,
				},
			})
		}

		cfg.Route.Routes = append(cfg.Route.Routes, route)
		cfg.Receivers = append(cfg.Receivers, receiver)
	}

	_, err := configfile.PublishConfig(configfile.ConfigFile{
		Namespace: "Polaris",
		Group:     "Polaris-System",
		FileName:  "alert-notify-rules.yml",
		Content:   cfg.String(),
		Comment:   "Polaris 告警通知规则",
	})
	return err
}

func (s *AlarmChangeEventSubscriber) doRetry() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		v := atomic.LoadInt32(&s.retryWork)
		if v == 0 {
			continue
		}
		log.Info("[AlarmRule] do retry publish rule file job")

		_, _, _ = s.executor.Do(_publishAlarmRule, s.handle)
	}
}
