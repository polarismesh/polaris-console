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
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/golang/protobuf/jsonpb"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/wrapperspb"

	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/log"
	"github.com/polarismesh/specification/source/go/api/v1/security"
	"github.com/polarismesh/specification/source/go/api/v1/service_manage"
)

func NewAdminGetter(conf *bootstrap.Config) {
	_adminGetter.conf = conf
}

var _adminGetter = &AdminUserGetter{}

type AdminUserGetter struct {
	conf *bootstrap.Config
	lock sync.RWMutex
	user *security.User
}

func (a *AdminUserGetter) GetAdminInfo() (*security.User, error) {
	a.lock.Lock()
	defer a.lock.Unlock()

	if a.user != nil {
		return a.user, nil
	}

	resp, err := http.Get(fmt.Sprintf("http://%s/maintain/v1/mainuser/exist", a.conf.PolarisServer.Address))
	if err != nil || resp.StatusCode != http.StatusOK {
		user := &security.User{
			Name: wrapperspb.String(a.conf.WebServer.MainUser),
		}
		// 降级回旧的数据信息
		if resp.StatusCode == http.StatusNotFound {
			a.user = user
		} else {
			log.Error("[Proxy][Login] get admin info fail", zap.Error(err))
		}
		return user, nil
	}

	rsp := &service_manage.Response{}
	marshaler := jsonpb.Unmarshaler{AllowUnknownFields: true}
	if err = marshaler.Unmarshal(resp.Body, rsp); err != nil {
		log.Error("[Proxy][Login] get admin info fail", zap.Error(err))
		return nil, err
	}
	a.user = rsp.User
	return a.user, nil
}

// ServiceOwner 服务(规则)负责人信息
type ServiceOwner struct {
	Namespace string
	Name      string
	Owners    map[string]bool
}

type LoginRequest struct {
	Owner    string `json:"owner"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

// ReverseProxyForLogin 反向代理
func ReverseProxyForLogin(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Header.Add("Polaris-Token", polarisServer.PolarisToken)
		c.Request.Header.Del("Cookie")

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = polarisServer.Address
			req.Host = polarisServer.Address
			body, err := ioutil.ReadAll(req.Body)
			if err != nil {
				log.Error("[Proxy][Login] modify login request fail", zap.Error(err))
				return
			}

			admin, err := _adminGetter.GetAdminInfo()
			if err != nil {
				log.Error("[Proxy][Login] modify login request fail", zap.Error(err))
				return
			}

			loginBody := &LoginRequest{}
			_ = json.Unmarshal(body, loginBody)
			if len(admin.GetName().GetValue()) != 0 {
				loginBody.Owner = admin.GetName().GetValue()
			}
			body, err = json.Marshal(loginBody)
			if err != nil {
				log.Error("[Proxy][Login] modify login request fail", zap.Error(err))
				return
			}
			req.Header["Content-Length"] = []string{fmt.Sprint(len(body))}
			req.ContentLength = int64(len(body))
			req.Body = ioutil.NopCloser(bytes.NewBuffer(body))
		}
		modifyResp := func(resp *http.Response) error {
			body, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				return err
			}
			if err = resp.Body.Close(); err != nil {
				return err
			}
			loginResp := make(map[string]interface{})
			if err = json.Unmarshal(body, &loginResp); err != nil {
				return err
			}
			if val, ok := loginResp["loginResponse"].(map[string]interface{}); ok {
				if token := val["token"]; token != "" {
					val["token"] = "******" // 避免前端出错,保证返回, 但隐藏现有的token
					body, err = json.Marshal(loginResp)
					if err != nil {
						return err
					}
					if err = refreshJWT(c, val["user_id"].(string), token.(string), conf); err != nil {
						return err
					}
					resp.Header["Content-Length"] = []string{fmt.Sprint(len(body))}
					resp.Body = io.NopCloser(bytes.NewBuffer(body))
					return nil
				}
			}
			resp.Body = io.NopCloser(bytes.NewBuffer(body))
			return nil
		}
		proxy := &httputil.ReverseProxy{Director: director, ModifyResponse: modifyResp}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

// ReverseProxyForServer 反向代理
func ReverseProxyForServer(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !verifyAccessPermission(c, conf) {
			return
		}

		c.Request.Header.Add("Polaris-Token", polarisServer.PolarisToken)
		c.Request.Header.Del("Cookie")

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = polarisServer.Address
			req.Host = polarisServer.Address
		}
		proxy := &httputil.ReverseProxy{Director: director}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

func verifyAccessPermission(c *gin.Context, conf *bootstrap.Config) bool {
	userID, token, err := parseJWTThenSetToken(c, conf)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusProxyAuthRequired,
			"info": "Proxy Authentication Required",
		})
		return false
	}

	if ok := checkAuthoration(c, conf); !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusProxyAuthRequired,
			"info": "Proxy Authentication Required",
		})
		return false
	}

	// 只有全部校验通过之后,请求才会自动续期jwtToken
	if err = refreshJWT(c, userID, token, conf); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"info": "generate jwt token occurs error",
		})
		return false
	}
	return true
}

// ReverseProxyNoAuthForServer 反向代理
func ReverseProxyNoAuthForServer(polarisServer *bootstrap.PolarisServer, conf *bootstrap.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Header.Add("Polaris-Token", polarisServer.PolarisToken)
		c.Request.Header.Del("Cookie")

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = polarisServer.Address
			req.Host = polarisServer.Address
		}
		proxy := &httputil.ReverseProxy{Director: director}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

func ReverseProxyForMonitorServer(monitorServer *bootstrap.MonitorServer) gin.HandlerFunc {
	return func(c *gin.Context) {

		director := func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = monitorServer.Address
			req.Host = monitorServer.Address
		}
		proxy := &httputil.ReverseProxy{Director: director}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

// jwtClaims jwt 额外信息
type jwtClaims struct {
	UserID string
	Token  string
	jwt.RegisteredClaims
}

// parseJWTThenSetToken 从jwt中抽取userID 和 token
func parseJWTThenSetToken(c *gin.Context, conf *bootstrap.Config) (string, string, error) {
	receiveUserId := c.Request.Header.Get("x-polaris-user")

	jwtCookie, _ := c.Request.Cookie("jwt")
	if jwtCookie == nil {
		return "", "", nil
	}
	token, err := jwt.ParseWithClaims(jwtCookie.Value, &jwtClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(conf.WebServer.JWT.SecretKey), nil
	})
	if _, ok := err.(*jwt.ValidationError); ok {
		log.Error("parse jwt with claims fail", zap.Error(err))
		return "", "", err
	}
	claims, ok := token.Claims.(*jwtClaims)
	if !ok || !token.Valid || claims.UserID == "" {
		return "", "", errors.New("jwt token is invalid")
	}
	if receiveUserId != claims.UserID {
		return "", "", errors.New("Login information comparison failed. Maybe the login information came from illegal injection.")
	}

	c.Request.Header.Set("x-polaris-user", claims.UserID)
	c.Request.Header.Set("x-polaris-token", claims.Token)
	return claims.UserID, claims.Token, nil
}

// refreshJWT 刷新jwtToken
func refreshJWT(c *gin.Context, userID, token string, conf *bootstrap.Config) error {
	if userID == "" || token == "" {
		return nil
	}
	nowTime := time.Now()
	claims := jwtClaims{
		UserID: userID,
		Token:  token,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(nowTime.Add(time.Duration(conf.WebServer.JWT.Expired) * time.Second)),
			NotBefore: jwt.NewNumericDate(nowTime),
			IssuedAt:  jwt.NewNumericDate(nowTime),
		},
	}
	jwtToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(conf.WebServer.JWT.SecretKey))
	if err != nil {
		return err
	}
	c.SetCookie("jwt", jwtToken, conf.WebServer.JWT.Expired, "/", "", false, false)
	return nil
}
