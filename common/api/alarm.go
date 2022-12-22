package api

import (
	"fmt"
	"net/url"
	"unicode/utf8"

	"github.com/polarismesh/polaris-console/common/model/alarm"
	commontime "github.com/polarismesh/polaris-console/common/time"
)

// AlarmRule 告警策略
type AlarmRule struct {
	ID           string            `json:"id"`
	Name         string            `json:"name"`
	Enable       bool              `json:"enable"`
	MonitorType  alarm.MonitorType `json:"monitor_type"`
	AlterExpr    AlterExpr         `json:"alter_expr"`
	Interval     int32             `json:"interval"`
	IntervalUnit string            `json:"interval_unit"`
	Topic        string            `json:"topic"`
	Message      string            `json:"message"`
	Callback     Callback          `json:"callback"`
	Revision     string            `json:"revision"`
	CreateTime   string            `json:"create_time"`
	ModifyTime   string            `json:"modify_time"`
	EnableTime   string            `json:"enable_time"`
}

func (a *AlarmRule) Vaild(isUpdate bool) error {
	if !isUpdate {
		if utf8.RuneCountInString(a.Name) < 1 || utf8.RuneCountInString(a.Name) > alarm.MaxAlarmNameLength {
			return alarm.ErrorAlarmNameInvalid
		}
	}
	if a.MonitorType != alarm.BusinessMonitorType {
		return alarm.ErrorMonitorTypeInvalid
	}
	if utf8.RuneCountInString(a.Topic) < 1 || utf8.RuneCountInString(a.Topic) > alarm.MaxAlarmNameLength {
		return alarm.ErrorAlarmTopicInvalid
	}
	if utf8.RuneCountInString(a.Message) < 1 || utf8.RuneCountInString(a.Message) > alarm.MaxAlarmMessageLength {
		return alarm.ErrorAlarmMessageInvalid
	}

	if err := a.AlterExpr.Vaild(); err != nil {
		return err
	}
	if err := a.Callback.Vaild(); err != nil {
		return err
	}
	_, err := commontime.ParseDuration(fmt.Sprintf("%d%s", a.Interval, a.IntervalUnit))
	return err
}

type AlterExpr struct {
	MetricsName string          `json:"metrics_name"`
	Expr        alarm.ExprLabel `json:"expr"`
	Value       string          `json:"value"`
	For         int32           `json:"for"`
	ForUnit     string          `json:"for_unit"`
}

func (a AlterExpr) Vaild() error {
	switch a.Expr {
	case alarm.LessThan, alarm.LessThanOrEqual, alarm.GreaterThan, alarm.GreaterThanOrEqual, alarm.Equal,
		alarm.NotEqual, alarm.Fluctuation, alarm.Rise, alarm.Decline:
	default:
		return alarm.ErrorExprLabelInvalid
	}
	_, err := commontime.ParseDuration(fmt.Sprintf("%d%s", a.For, a.ForUnit))
	return err
}

type Callback struct {
	Type alarm.CallbackType `json:"type"`
	Info map[string]string  `json:"info"`
}

func (a Callback) Vaild() error {
	if a.Type != alarm.ClsCallback && a.Type != alarm.WebhookCallback {
		return alarm.ErrorCallbackTypeInvalid
	}
	if len(a.Info) < 1 {
		return alarm.ErrorCallbackInfoInvalid
	}
	switch a.Type {
	case alarm.ClsCallback:
		_, ok := a.Info["topic_id"]
		if !ok {
			return alarm.ErrorCallbackCLSInvalid
		}
	case alarm.WebhookCallback:
		val, ok := a.Info["url"]
		if !ok {
			return alarm.ErrorCallbackWebHookInvalid
		}
		if _, err := url.Parse(val); err != nil {
			return err
		}
	}
	return nil
}
