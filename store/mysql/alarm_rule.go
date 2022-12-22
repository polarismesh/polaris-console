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

package mysql

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	commonhttp "github.com/polarismesh/polaris-console/common/http"
	"github.com/polarismesh/polaris-console/common/log"
	"github.com/polarismesh/polaris-console/common/model/alarm"
	"github.com/polarismesh/polaris-console/store"
	"go.uber.org/zap"
)

type alarmRuleStore struct {
	master *BaseDB
	slave  *BaseDB
}

// AddAlarmRule add alarm rule
func (a *alarmRuleStore) AddAlarmRule(rule *alarm.AlarmRule) error {
	err := RetryTransaction("addAlarmRule", func() error {
		return a.addAlarmRule(rule)
	})
	return store.Error(err)
}

func (a *alarmRuleStore) addAlarmRule(rule *alarm.AlarmRule) error {
	insSql := `
	INSERT INTO alarm_rule (id, name, enable, monitor_type, alter_expr
		, report_interval, topic, message, callback, revision, ctime
		, mtime, etime)
	VALUES (?, ?, ?, ?, ?
		, ?, ?, ?, ?, ?, sysdate()
		, sysdate(), %s)
	`

	enable := 0
	enableTime := emptyEnableTime
	if rule.Enable {
		enable = 1
		enableTime = "sysdate()"
	}

	alterExpr, err := json.Marshal(rule.AlterExpr)
	if err != nil {
		return err
	}
	callback, err := json.Marshal(rule.Callback)
	if err != nil {
		return err
	}

	args := []interface{}{
		rule.ID,
		rule.Name,
		enable,
		rule.MonitorType,
		string(alterExpr),
		rule.Interval,
		rule.Topic,
		rule.Message,
		string(callback),
		rule.Revision,
	}

	insSql = fmt.Sprintf(insSql, enableTime)

	if _, err := a.master.Exec(insSql, args...); err != nil {
		return store.Error(err)
	}

	return nil
}

// UpdateAlarmRule update alarm rule
func (a *alarmRuleStore) UpdateAlarmRule(rule *alarm.AlarmRule) error {
	updateSql := `
	UPDATE 
		alarm_rule 
	SET
		alter_expr = ?,
		report_interval = ?,
		topic = ?,
		message = ?,
		callback = ?,
		revision = ?,
		mtime = sysdate()
	WHERE
		id = ?
	`

	alterExpr, err := json.Marshal(rule.AlterExpr)
	if err != nil {
		return err
	}
	callback, err := json.Marshal(rule.Callback)
	if err != nil {
		return err
	}

	args := []interface{}{
		string(alterExpr),
		rule.Interval,
		rule.Topic,
		rule.Message,
		string(callback),
		rule.Revision,
		rule.ID,
	}

	if _, err := a.master.Exec(updateSql, args...); err != nil {
		return store.Error(err)
	}

	return nil
}

// DeleteAlarmRule delete alarm rule
func (a *alarmRuleStore) DeleteAlarmRule(rule *alarm.AlarmRule) error {
	delSql := `
DELETE FROM alarm_rule WHERE id = ?
	`

	if _, err := a.master.Exec(delSql, rule.ID); err != nil {
		return store.Error(err)
	}

	return nil
}

// EnableAlarmRule enable alarm rule
func (a *alarmRuleStore) EnableAlarmRule(rule *alarm.AlarmRule) error {
	enableSql := `
	UPDATE 
		alarm_rule 
	SET
		revision = ?,
		enable = ?,
		etime = %s
	WHERE
		id = ?
	`

	enable := 0
	enableTime := emptyEnableTime
	if rule.Enable {
		enable = 1
		enableTime = "sysdate()"
	}

	args := []interface{}{
		rule.Revision,
		enable,
		rule.ID,
	}

	enableSql = fmt.Sprintf(enableSql, enableTime)

	if _, err := a.master.Exec(enableSql, args...); err != nil {
		return store.Error(err)
	}

	return nil
}

// GetAlarmRuleById get one alarm rule
func (a *alarmRuleStore) GetAlarmRuleById(id string) (*alarm.AlarmRule, error) {

	querySql := genAlarmRuleAllFieldsSQL() +
		`
	 WHERE id = ?
	`

	row, err := a.master.Query(querySql, id)
	if err != nil {
		return nil, store.Error(err)
	}

	ret, err := fetchAlarmRuleRows(row)
	if err != nil {
		return nil, err
	}

	if len(ret) == 0 {
		return nil, nil
	}

	return ret[0], nil
}

// GetAlarmRuleByName get one alarm rule by name
func (a *alarmRuleStore) GetAlarmRuleByName(name string) (*alarm.AlarmRule, error) {

	querySql := genAlarmRuleAllFieldsSQL() +
		`
	 WHERE name = ?
	`

	row, err := a.master.Query(querySql, name)
	if err != nil {
		return nil, store.Error(err)
	}

	ret, err := fetchAlarmRuleRows(row)
	if err != nil {
		return nil, err
	}

	if len(ret) == 0 {
		return nil, nil
	}

	return ret[0], nil
}

// GetAlarmRules get alarm rules
func (a *alarmRuleStore) GetAlarmRules(query map[string]string, offset, limit uint32) (uint32, []*alarm.AlarmRule, error) {

	countSql := `
	SELECT COUNT(*) FROM alarm_rule WHERE 1=1 
	`
	querySql := genAlarmRuleAllFieldsSQL() +
		`
	WHERE 1=1
	`

	args := []interface{}{}
	tmps := []string{}
	for k, v := range query {
		v, isWild := commonhttp.ParseWildName(v)
		if isWild {
			tmps = append(tmps, fmt.Sprintf("%s LIKE ?", k))
			args = append(args, "%s"+v+"%")
		} else {
			tmps = append(tmps, fmt.Sprintf("%s = ?", k))
			args = append(args, v)
		}
	}

	countSql += " " + strings.Join(tmps, " AND ")
	querySql += " " + strings.Join(tmps, " AND ")
	querySql += " ORDER BY mtime  LIMIT ? , ? "

	var total uint32
	err := a.master.QueryRow(countSql, args...).Scan(&total)
	switch {
	case err == sql.ErrNoRows:
		return 0, nil, nil
	case err != nil:
		log.Error("[Store][database] get alarm rule count", zap.String("sql", countSql), zap.Error(err))
		return 0, nil, err
	}

	args = append(args, offset, limit)
	rows, err := a.master.Query(querySql, args...)
	if err != nil {
		log.Error("[Store][database] get alarm rules", zap.String("sql", countSql), zap.Error(err))
		return 0, nil, err
	}

	ret, err := fetchAlarmRuleRows(rows)
	return total, ret, err
}

func (a *alarmRuleStore) GetAllAlarmRules() ([]*alarm.AlarmRule, error) {

	querySql := genAlarmRuleAllFieldsSQL()
	rows, err := a.master.Query(querySql)
	if err != nil {
		return nil, err
	}

	ret, err := fetchAlarmRuleRows(rows)
	return ret, err
}

func fetchAlarmRuleRows(rows *sql.Rows) ([]*alarm.AlarmRule, error) {
	if rows == nil {
		return nil, nil
	}
	defer rows.Close()
	var (
		ret []*alarm.AlarmRule
	)
	progress := 0
	for rows.Next() {

		var (
			item = alarm.AlarmRule{
				AlterExpr: alarm.AlterExpr{},
				Callback:  alarm.Callback{},
			}
			enable              int32
			alterExpr, callback string
			ctime, mtime, etime int64
		)

		progress++
		if progress%100000 == 0 {
			log.Infof("[Store][database] alarm rule fetch rows progress: %d", progress)
		}
		err := rows.Scan(&item.ID, &item.Name, &enable, &item.MonitorType, &alterExpr, &item.Interval, &item.Topic, &item.Message, &callback, &item.Revision, &ctime, &mtime, &etime)
		if err != nil {
			log.Errorf("[Store][database] fetch alarm rule rows err: %s", err.Error())
			return nil, err
		}

		if enable == 0 {
			item.Enable = false
		} else {
			item.Enable = true
		}

		item.CreateTime = time.Unix(ctime, 0)
		item.ModifyTime = time.Unix(mtime, 0)
		item.EnableTime = time.Unix(etime, 0)

		if err := json.Unmarshal([]byte(alterExpr), &item.AlterExpr); err != nil {
			return nil, err
		}
		if err := json.Unmarshal([]byte(callback), &item.Callback); err != nil {
			return nil, err
		}

		ret = append(ret, &item)

	}
	if err := rows.Err(); err != nil {
		log.Errorf("[Store][database] alarm rule rows catch err: %s", err.Error())
		return nil, err
	}

	return ret, nil
}

func genAlarmRuleAllFieldsSQL() string {
	return `
	SELECT id, name, enable, monitor_type, alter_expr, report_interval, topic, message, callback, revision, UNIX_TIMESTAMP(ctime), UNIX_TIMESTAMP(mtime), UNIX_TIMESTAMP(etime) FROM alarm_rule
	`
}
