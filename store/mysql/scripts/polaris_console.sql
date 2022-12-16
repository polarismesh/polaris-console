/*
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

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT = @@CHARACTER_SET_CLIENT */
;

/*!40101 SET @OLD_CHARACTER_SET_RESULTS = @@CHARACTER_SET_RESULTS */
;

/*!40101 SET @OLD_COLLATION_CONNECTION = @@COLLATION_CONNECTION */
;

/*!40101 SET NAMES utf8mb4 */
;

--
-- Database: `polaris_console`
--
CREATE DATABASE IF NOT EXISTS `polaris_console` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

USE `polaris_console`;

CREATE TABLE IF NOT EXISTS `alarm_rule`
(
    `id`           varchar(128)  NOT NULL COMMENT 'Unique ID',
    `name`         varchar(32)   NOT NULL COMMENT 'Alarm Rule Name',
    `enable`       tinyint(4)             DEFAULT NULL COMMENT 'Alarm Rule Is Enable',
    `monitor_type` varchar(128)  NOT NULL COMMENT 'Monitor Type',
    `alter_expr`   varchar(3000) NOT NULL COMMENT 'Alarm Expression',
    `report_interval`     varchar(32)            DEFAULT NULL COMMENT '1m(minute)/1h(hour)/1d(day)',
    `topic`        varchar(128)           DEFAULT NULL COMMENT '',
    `message`      varchar(3000) NOT NULL DEFAULT '1' COMMENT 'Alarm Notify Message',
    `callback`     varchar(3000) NOT NULL DEFAULT '0' COMMENT 'Alarm Rule Callback',
    `revision`           varchar(128)  NOT NULL COMMENT 'Revision Info',
    `ctime`        timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
    `mtime`        timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last updated time',
    `etime`    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `name` (`name`),
    KEY `mtime` (`mtime`)
) ENGINE = InnoDB;