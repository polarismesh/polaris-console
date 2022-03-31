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
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/log"
)

var departments string

/**
 * @brief 获取部门数据
 */
func GetDepartment(conf *bootstrap.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok := authority(c, conf); !ok {
			return
		}
		getDepartment(&conf.HRData, c)
	}
}

/**
 * @brief 获取部门数据
 */
func getDepartment(hrData *bootstrap.HRData, c *gin.Context) {
	if departments != "" {
		c.JSON(http.StatusOK, departments)
	} else if hrData == nil || !hrData.EnableHRData {
		c.JSON(http.StatusOK, "hr data is not enabled")
	} else {
		c.JSON(http.StatusInternalServerError, "department is null")
	}
}

/**
 * @brief 获取部门数据
 */
func SetDepartment() {
	file, err := os.Open("department.txt")
	if err != nil {
		log.Errorf("read department.txt err: %v", err)
		return
	}
	defer file.Close()

	content, err := ioutil.ReadAll(file)
	if err != nil {
		log.Errorf("read content err: %v", err)
		return
	}
	departments = strings.TrimSpace(string(content))
	if len([]rune(departments)) == 0 || strings.Contains(departments, "signature invalid") {
		departments = ""
		log.Fatalf("departments is %v", departments)
		return
	}
	log.Infof("get departments data successfully")
}

/**
 * 获取员工的组织架构信息
 */
func getStaffDepartment(hrData *bootstrap.HRData, c *gin.Context) {
	// 不获取员工组织架构信息
	if hrData == nil || !hrData.EnableHRData {
		c.JSON(http.StatusOK, &bootstrap.StaffDepartment{})
		return
	}
	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	sn := timestamp + hrData.HRToken + timestamp
	signature := fmt.Sprintf("%x", sha256.Sum256([]byte(sn)))

	staffName := c.Query("engName")
	url := "http://" + hrData.UnitAddress + hrData.StaffURL + "?engName=" + staffName
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Errorf("new request err: %v", err)
		c.JSON(http.StatusInternalServerError, "请求员工组织架构出错")
		return
	}
	req.Header.Add("timestamp", timestamp)
	req.Header.Add("signature", signature)
	resp, err := client.Do(req)
	if err != nil {
		log.Errorf("get response err is %v", err)
		c.JSON(http.StatusInternalServerError, "发送员工组织架构请求出错")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		log.Errorf("get staff department error, status code is %v", resp.StatusCode)
		c.JSON(http.StatusInternalServerError, "获取员工组织架构出错")
		return
	}

	responseBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Errorf("read staff department err: %v", err)
		c.JSON(http.StatusInternalServerError, "读取员工组织架构应答出错")
		return
	}
	staffDepartment := &bootstrap.StaffDepartment{}
	err = json.Unmarshal([]byte(responseBody), &staffDepartment)
	if err != nil {
		log.Errorf("parse staff department response[%s] err:%v", responseBody, err)
		c.JSON(http.StatusInternalServerError, "解析员工组织架构应答出错")
		return
	}
	c.JSON(http.StatusOK, staffDepartment)
}
