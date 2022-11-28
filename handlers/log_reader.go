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
	"bytes"
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"sync"

	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/model"
)

var (
	_eventlogReader     *RemoteLogReader
	_eventlogReaderOnce sync.Once
)

func GetEventLogReader(conf *bootstrap.Config) (*RemoteLogReader, error) {
	_eventlogReaderOnce.Do(func() {
		if _eventlogReader != nil {
			return
		}
	})

	_eventlogReader = &RemoteLogReader{
		requestUrl: conf.OperationServer.RequestURL,
		httpClient: &http.Client{
			Timeout: conf.OperationServer.Timeout,
		},
	}

	return _eventlogReader, nil
}

var (
	_historylogReader     *RemoteLogReader
	_historylogReaderOnce sync.Once
)

func GetHistoryLogReader(conf *bootstrap.Config) (*RemoteLogReader, error) {
	_historylogReaderOnce.Do(func() {
		if _historylogReader != nil {
			return
		}
	})

	_historylogReader = &RemoteLogReader{
		requestUrl: conf.OperationServer.RequestURL,
		httpClient: &http.Client{
			Timeout: conf.OperationServer.Timeout,
		},
	}

	return _historylogReader, nil
}

type RemoteLogReader struct {
	httpClient *http.Client
	requestUrl string
}

func (r *RemoteLogReader) Query(ctx context.Context, queryParam model.LogQueryParam, logResp interface{}) error {
	body, err := json.Marshal(queryParam)
	if err != nil {
		return err
	}
	req, err := http.NewRequest(http.MethodPost, r.requestUrl, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	resp, err := r.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if err := json.Unmarshal(data, logResp); err != nil {
		return err
	}
	return nil
}
