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
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	commonalarm "github.com/polarismesh/polaris-console/common/alarm"
	"github.com/polarismesh/polaris-console/common/api"
	"github.com/polarismesh/polaris-console/common/eventhub"
	commonhttp "github.com/polarismesh/polaris-console/common/http"
	"github.com/polarismesh/polaris-console/common/id"
	"github.com/polarismesh/polaris-console/common/log"
	"github.com/polarismesh/polaris-console/common/model"
	"github.com/polarismesh/polaris-console/common/model/alarm"
	"github.com/polarismesh/polaris-console/common/operation"
	"github.com/polarismesh/polaris-console/store"
	"go.uber.org/zap"
)

var (
	_alarmRuleSearchFilter = map[string]struct{}{
		"name": {},
	}
)

func CreateAlarmRules(conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var reqs []api.AlarmRule
		if err := ctx.BindJSON(&reqs); err != nil {
			ctx.JSON(http.StatusBadRequest, model.Response{
				Code: int32(api.InvalidParameter),
				Info: api.Code2Info(api.InvalidParameter),
			})
			return
		}

		batchResp := model.NewBatchWriteResponse(int32(api.ExecuteSuccess))
		for i := range reqs {
			resp := createAlarmRule(ctx, &reqs[i])
			batchResp.Collect(&resp)
		}

		ctx.JSON(model.CalcCode(batchResp.Code), batchResp)
		return
	}
}

func createAlarmRule(ctx *gin.Context, req *api.AlarmRule) model.Response {
	if err := req.Vaild(); err != nil {
		return model.Response{
			Code: int32(api.BadRequest),
			Info: err.Error(),
		}
	}

	saveData := commonalarm.ParseToStore(*req)
	saveData.ID = id.NewUUID()
	saveData.Revision = id.NewUUID()

	s, err := store.GetStore()
	if err != nil {
		log.Error("[AlarmRule] get store when create alarm rule", zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}

	if err := s.AddAlarmRule(&saveData); err != nil {
		log.Error("[AlarmRule] create alarm rule", zap.String("id", req.ID), zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}

	eventhub.Publish(eventhub.AlarmRuleChangeEventTopic, &alarm.AlarmChangeEvent{
		RuleID:    saveData.ID,
		Revision:  saveData.Revision,
		Operation: operation.OCreate,
	})

	return model.NewResponse(int32(api.ExecuteSuccess))
}

func UpdateAlarmRules(conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var reqs []api.AlarmRule
		if err := ctx.BindJSON(&reqs); err != nil {
			ctx.JSON(http.StatusBadRequest, model.Response{
				Code: int32(api.InvalidParameter),
				Info: api.Code2Info(api.InvalidParameter),
			})
			return
		}

		batchResp := model.NewBatchWriteResponse(int32(api.ExecuteSuccess))
		for i := range reqs {
			resp := updateAlarmRule(ctx, &reqs[i])
			batchResp.Collect(&resp)
		}

		ctx.JSON(model.CalcCode(batchResp.Code), batchResp)
		return
	}
}

func updateAlarmRule(ctx *gin.Context, req *api.AlarmRule) model.Response {
	if err := req.Vaild(); err != nil {
		return model.Response{
			Code: int32(api.BadRequest),
			Info: err.Error(),
		}
	}
	if len(req.ID) == 0 {
		return model.NewResponse(int32(api.InvalidParameter))
	}
	s, err := store.GetStore()
	if err != nil {
		log.Error("[AlarmRule] get store when update alarm rule", zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}

	saveData, err := s.GetOneAlarmRule(req.ID)
	if err != nil {
		log.Error("[AlarmRule] get one alarm rule by id", zap.String("id", req.ID), zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}
	if saveData == nil {
		return model.NewResponse(int32(api.NotFoundResource))
	}

	needUpdate, data := commonalarm.UpdateAlarmRuleAttribute(req, saveData)
	if !needUpdate {
		log.Info("[AlarmRule] not need update", zap.String("id", req.ID))
		return model.NewResponse(int32(api.NoNeedUpdate))
	}
	data.Revision = id.NewUUID()

	if err := s.UpdateAlarmRule(data); err != nil {
		log.Error("[AlarmRule] update alarm rule", zap.String("id", req.ID), zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}

	eventhub.Publish(eventhub.AlarmRuleChangeEventTopic, &alarm.AlarmChangeEvent{
		RuleID:    saveData.ID,
		Revision:  data.Revision,
		Operation: operation.OUpdate,
	})
	return model.NewResponse(int32(api.ExecuteSuccess))
}

func DeleteAlarmRules(conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var reqs []api.AlarmRule
		if err := ctx.BindJSON(&reqs); err != nil {
			ctx.JSON(http.StatusBadRequest, model.Response{
				Code: int32(api.InvalidParameter),
				Info: api.Code2Info(api.InvalidParameter),
			})
			return
		}

		batchResp := model.NewBatchWriteResponse(int32(api.ExecuteSuccess))
		for i := range reqs {
			resp := deleteAlarmRule(ctx, &reqs[i])
			batchResp.Collect(&resp)
		}

		ctx.JSON(model.CalcCode(batchResp.Code), batchResp)
		return
	}
}

func deleteAlarmRule(ctx *gin.Context, req *api.AlarmRule) model.Response {
	if len(req.ID) == 0 {
		return model.NewResponse(int32(api.InvalidParameter))
	}
	s, err := store.GetStore()
	if err != nil {
		log.Error("[AlarmRule] get store when delete alarm rule", zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}

	saveData, err := s.GetOneAlarmRule(req.ID)
	if err != nil {
		log.Error("[AlarmRule] get one alarm rule by id", zap.String("id", req.ID), zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}
	if saveData == nil {
		return model.NewResponse(int32(api.ExecuteSuccess))
	}

	if err := s.DeleteAlarmRule(&alarm.AlarmRule{ID: req.ID}); err != nil {
		log.Error("[AlarmRule] delete alarm rule", zap.String("id", req.ID), zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}

	eventhub.Publish(eventhub.AlarmRuleChangeEventTopic, &alarm.AlarmChangeEvent{
		RuleID:    saveData.ID,
		Revision:  saveData.Revision,
		Operation: operation.ODelete,
	})
	return model.NewResponse(int32(api.ExecuteSuccess))
}

func EnableAlarmRules(conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var reqs []api.AlarmRule
		if err := ctx.BindJSON(&reqs); err != nil {
			ctx.JSON(http.StatusBadRequest, model.Response{
				Code: int32(api.InvalidParameter),
				Info: api.Code2Info(api.InvalidParameter),
			})
			return
		}

		batchResp := model.NewBatchWriteResponse(int32(api.ExecuteSuccess))
		for i := range reqs {
			resp := enableAlarmRule(ctx, &reqs[i])
			batchResp.Collect(&resp)
		}

		ctx.JSON(model.CalcCode(batchResp.Code), batchResp)
		return
	}
}

func enableAlarmRule(ctx *gin.Context, req *api.AlarmRule) model.Response {
	if err := req.Vaild(); err != nil {
		return model.Response{
			Code: int32(api.BadRequest),
			Info: err.Error(),
		}
	}
	if len(req.ID) == 0 {
		return model.NewResponse(int32(api.InvalidParameter))
	}
	s, err := store.GetStore()
	if err != nil {
		log.Error("[AlarmRule] get store when enable alarm rule", zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}

	saveData, err := s.GetOneAlarmRule(req.ID)
	if err != nil {
		log.Error("[AlarmRule] get one alarm rule by id", zap.String("id", req.ID), zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}
	if saveData == nil {
		return model.NewResponse(int32(api.NotFoundResource))
	}

	saveData.Enable = !saveData.Enable
	saveData.Revision = id.NewUUID()

	if err := s.UpdateAlarmRule(saveData); err != nil {
		log.Error("[AlarmRule] enable alarm rule", zap.String("id", req.ID), zap.Error(err))
		return model.Response{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}

	eventhub.Publish(eventhub.AlarmRuleChangeEventTopic, &alarm.AlarmChangeEvent{
		RuleID:    saveData.ID,
		Revision:  saveData.Revision,
		Operation: operation.OUpdateEnable,
	})
	return model.NewResponse(int32(api.ExecuteSuccess))
}

func DescribeAlarmRules(conf *bootstrap.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		filters := commonhttp.ParseQueryParams(ctx.Request)

		offset, limit, err := commonhttp.ParseOffsetAndLimit(filters)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, model.Response{
				Code: int32(api.BadRequest),
				Info: err.Error(),
			})
			return
		}

		resp := describeAlarmRules(ctx, filters, offset, limit)
		ctx.JSON(model.CalcCode(resp.Code), resp)
		return
	}
}

func describeAlarmRules(ctx *gin.Context, filters map[string]string, offset, limit uint32) *model.QueryResponse {
	for k := range filters {
		if _, ok := _alarmRuleSearchFilter[k]; !ok {
			return &model.QueryResponse{
				Code: int32(api.InvalidParameter),
				Info: fmt.Sprintf("query key=[%s] not support", k),
			}
		}
	}

	s, err := store.GetStore()
	if err != nil {
		log.Error("[AlarmRule] get store when query alarm rule", zap.Error(err))
		return &model.QueryResponse{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}

	total, ret, err := s.GetAlarmRules(filters, offset, limit)
	if err != nil {
		log.Error("[AlarmRule] get alarm rules from store", zap.Error(err))
		return &model.QueryResponse{
			Code: int32(api.StoreLayerException),
			Info: err.Error(),
		}
	}

	resp := model.NewQueryResponse(int32(api.ExecuteSuccess))
	resp.Amount = uint64(total)
	resp.Size = uint32(len(ret))
	rules := make([]api.AlarmRule, 0, len(ret))
	for i := range ret {
		rules = append(rules, commonalarm.ParseToAPI(*ret[i]))
	}

	resp.Data = rules

	return resp
}
