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

package configfile

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/api"
	"github.com/polarismesh/polaris-console/common/model"
)

type ConfigFile struct {
	Namespace string
	Group     string
	FileName  string
	Comment   string
	Content   string
	Tags      map[string]string
}

func PublishConfig(file ConfigFile) (bool, error) {
	tempFile := map[string]interface{}{
		"namespace": file.Namespace,
		"group":     file.Group,
		"name":      file.FileName,
		"content":   file.Content,
		"comment":   file.Comment,
		"tags":      formatLablesToTags(file.Tags),
		"format":    "yaml",
	}

	resp, err := createTempFile(tempFile)
	if err != nil {
		return false, fmt.Errorf("create file: %+w", err)
	}
	if resp.Code == int32(api.ExistedResource) {
		resp, err = updateTempFile(tempFile)
	}
	if err != nil {
		return false, fmt.Errorf("update file: %+w", err)
	}
	if model.CalcCode(resp.Code) > 200 {
		return false, errors.New(resp.Info)
	}

	resp, err = releaseConfigFile(file.Namespace, file.Group, file.FileName)
	if err != nil {
		return false, fmt.Errorf("release file: %+w", err)
	}
	if model.CalcCode(resp.Code) > 200 {
		return false, errors.New(resp.Info)
	}
	return true, nil
}

func createTempFile(configFile map[string]interface{}) (ConfigResponse, error) {
	body, err := json.Marshal(configFile)
	if err != nil {
		return ConfigResponse{}, err
	}

	return doWrite(http.MethodPost, toCreateConfigFileUrl(), string(body))
}

func updateTempFile(configFile map[string]interface{}) (ConfigResponse, error) {
	body, err := json.Marshal(configFile)
	if err != nil {
		return ConfigResponse{}, err
	}

	return doWrite(http.MethodPut, toCreateConfigFileUrl(), string(body))
}

func releaseConfigFile(namespace, group, file string) (ConfigResponse, error) {
	releaseFile := map[string]interface{}{
		"namespace": namespace,
		"group":     group,
		"fileName":  file,
		"name":      fmt.Sprintf("release-%d", time.Now().Unix()),
	}

	body, err := json.Marshal(releaseFile)
	if err != nil {
		return ConfigResponse{}, err
	}

	return doWrite(http.MethodPost, toReleaseConfigFileUrl(), string(body))
}

func GetConfig(namespace, group, file string) (string, error) {

	url := fmt.Sprintf("%s?namespace=%s&group=%s&name=%s", toGetConfigFileUrl(), namespace, group, file)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Add("X-Polaris-Token", bootstrap.GetConfig().PolarisServer.PolarisToken)
	req.Header.Add("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	data, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return "", err
	}

	var fileResp ConfigResponse

	if err := json.Unmarshal([]byte(data), &fileResp); err != nil {
		return "", err
	}
	if fileResp.Code != int32(api.ExecuteSuccess) {
		return "", errors.New(fileResp.Info)
	}

	return fileResp.ConfigFileRelease.Content, nil
}

func doWrite(method string, url string, body string) (ConfigResponse, error) {
	req, err := http.NewRequest(method, url, bytes.NewBufferString(body))
	if err != nil {
		return ConfigResponse{}, err
	}

	req.Header.Add("X-Polaris-Token", bootstrap.GetConfig().PolarisServer.PolarisToken)
	req.Header.Add("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return ConfigResponse{}, err
	}

	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return ConfigResponse{}, err
	}

	var fileResp ConfigResponse

	if err := json.Unmarshal([]byte(data), &fileResp); err != nil {
		return ConfigResponse{}, err
	}

	return fileResp, nil
}

func toCreateConfigFileUrl() string {
	return fmt.Sprintf("http://%s/config/v1/configfiles", bootstrap.GetConfig().PolarisServer.Address)
}

func toReleaseConfigFileUrl() string {
	return fmt.Sprintf("http://%s/config/v1/configfiles/release", bootstrap.GetConfig().PolarisServer.Address)
}

func toGetConfigFileUrl() string {
	return fmt.Sprintf("http://%s/config/v1/configfiles/release", bootstrap.GetConfig().PolarisServer.Address)
}

func formatLablesToTags(labels map[string]string) []Tag {
	ret := make([]Tag, 0, len(labels))
	for k, v := range labels {
		ret = append(ret, Tag{
			Key:   k,
			Value: v,
		})
	}
	return ret
}

type Tag struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type ConfigResponse struct {
	Code              int32             `json:"code"`
	Info              string            `json:"info"`
	ConfigFileRelease ConfigFileRelease `json:"configFileRelease,omitempty"`
}

type ConfigFileRelease struct {
	Name       string `json:"name,omitempty"`
	Namespace  string `json:"namespace,omitempty"`
	Group      string `json:"group,omitempty"`
	FileName   string `json:"file_name,omitempty"`
	Content    string `json:"content,omitempty"`
	Md5        string `json:"md5,omitempty"`
	CreateTime string `json:"create_time,omitempty"`
	CreateBy   string `json:"create_by,omitempty"`
	ModifyTime string `json:"modify_time,omitempty"`
}
