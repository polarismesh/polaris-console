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

package time

import (
	"strconv"
	"time"
)

// Time2String Convert time.Time to string time
func Time2String(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}

// Int64Time2String Convert time stamp of Int64 to string time
func Int64Time2String(t int64) string {
	return time.Unix(t, 0).Format("2006-01-02 15:04:05")
}

func IsValidDuration(s string) bool {
	unit := s[len(s)-1:]
	switch unit {
	case "s", "m", "h", "d":
		num := s[:len(s)-1]
		_, err := strconv.ParseInt(num, 10, 64)
		return err == nil
	default:
		return false
	}
}
