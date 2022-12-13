package api

import (
	"unicode/utf8"

	"github.com/polarismesh/polaris-console/common/model/alarm"
	commontime "github.com/polarismesh/polaris-console/common/time"
)

// AlarmRule 告警策略
type AlarmRule struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Enable      bool              `json:"enable"`
	MonitorType alarm.MonitorType `json:"monitor_type"`
	AlterExpr   AlterExpr         `json:"alter_expr"`
	Interval    string            `json:"interval"`
	Topic       string            `json:"topic"`
	Message     string            `json:"message"`
	Callback    Callback          `json:"callback"`
	Revision    string            `json:"revision"`
	CreateTime  string            `json:"create_time"`
	ModifyTime  string            `json:"modify_time"`
	EnableTime  string            `json:"enable_time"`
}

func (a *AlarmRule) Vaild() error {
	if utf8.RuneCountInString(a.Name) < 1 || utf8.RuneCountInString(a.Name) > alarm.MaxAlarmNameLength {
		return alarm.ErrorAlarmNameInvalid
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
	_, err := commontime.ParseDuration(a.Interval)
	return err
}

type AlterExpr struct {
	MetricsName string          `json:"metrics_name"`
	Expr        alarm.ExprLabel `json:"expr"`
	Value       string          `json:"value"`
	For         string          `json:"for"`
}

func (a AlterExpr) Vaild() error {
	switch a.Expr {
	case alarm.LessThan, alarm.LessThanOrEqual, alarm.GreaterThan, alarm.GreaterThanOrEqual, alarm.Equal,
		alarm.NotEqual, alarm.Fluctuation, alarm.Rise, alarm.Decline:
	default:
		return alarm.ErrorExprLabelInvalid
	}
	_, err := commontime.ParseDuration(a.For)
	return err
}

type Callback struct {
	Type alarm.CallbackType `json:"type"`
	Info string             `json:"info"`
}

func (a Callback) Vaild() error {
	if a.Type != alarm.ClsCallback && a.Type != alarm.WebhookCallback {
		return alarm.ErrorCallbackTypeInvalid
	}
	if utf8.RuneCountInString(a.Info) < 1 || utf8.RuneCountInString(a.Info) > alarm.MaxAlarmCallbackInfoLength {
		return alarm.ErrorCallbackInfoInvalid
	}
	return nil
}
