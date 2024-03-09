package uin

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/log"
	"go.uber.org/zap"
	"net/http"
	"time"
)

// GetPolarisUserFromUinLoginService 获取北极星当前uin下对应的用户token信息
func GetPolarisUserFromUinLoginService(c *gin.Context, conf *bootstrap.Config) (*PolarisUser, error) {
	uinCookie, _ := c.Request.Cookie("uin")
	skeyCookie, _ := c.Request.Cookie("skey")
	if uinCookie == nil || skeyCookie == nil {
		log.Error("[uinCookie] not found uin or skey in the cookies")
		return nil, fmt.Errorf("not found uin or skey from the cookie")
	}

	// 先校验登录状态，只有登录状态下uin才有效
	if err := VerifyRequest(uinCookie.Value, skeyCookie.Value, conf); err != nil {
		return nil, err
	}

	user, err := GetOrCreatePolarisUserToken(uinCookie.Value, skeyCookie.Value, conf)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("not found user id: %s", uinCookie.Value)
	}

	if !user.TokenEnable {
		log.Error("[uin] user token is not enable", zap.String("id", user.ID), zap.String("name", user.Name))
		return nil, fmt.Errorf("user(%s, %s) token is not enable", user.ID, user.Name)
	}

	// 获取用户ID和token成功后，设置在请求Header里，转发到polaris-server
	c.Request.Header.Set("x-polaris-user", user.ID)
	c.Request.Header.Set("x-polaris-token", user.AuthToken)
	return user, nil
}

// GetOrCreatePolarisUserToken 获取或创建北极星用户Token
func GetOrCreatePolarisUserToken(uin string, sKey string, conf *bootstrap.Config) (*PolarisUser, error) {
	user, err := GetPolarisUserTokenRequest(uin, conf)
	if err != nil {
		log.Info("[uin] firstly get user token err", zap.String("id", uin), zap.Error(err))
		return nil, err
	}

	if user != nil {
		return user, nil
	}

	// 没有报错，获取不到user，则代表用户不存在，先去创建用户
	account, err := AccountRequest(uin, sKey, conf)
	if err != nil {
		return nil, err
	}
	// 先创建用户
	if err := CreatePolarisUsersRequest(uin, account.Data.Name, conf); err != nil {
		return nil, err
	}

	// 等待1s，等Server获取到最新的用户信息加载到Cache
	time.Sleep(time.Second + time.Millisecond*100)

	// 再创建用户的策略
	if err := CreatePolarisAuthStrategyRequest(uin, account.Data.Name, conf); err != nil {
		return nil, err
	}

	// 创建完后，再获取一次用户token
	return GetPolarisUserTokenRequest(uin, conf)
}

// VerifyRequest 发起verify请求
func VerifyRequest(uin string, sKey string, conf *bootstrap.Config) error {
	req := newLoginServiceReq(uin, sKey, VerifyInterfaceName)
	ret, err := newHttpRequest(http.MethodPost, conf.LoginService.Verify, req, nil)
	if err != nil {
		return err
	}

	var rsp VerifyRsp
	if err := json.Unmarshal(ret, &rsp); err != nil {
		log.Error("[uin] verify json unmarshal err", zap.String("uin", uin), zap.String("skey", sKey),
			zap.Any("resp", ret), zap.Error(err))
		return err
	}
	if rsp.ReturnCode != 0 {
		log.Error("[uin] verify rsp return code is not 0", zap.String("uin", uin), zap.String("skey", sKey),
			zap.Int32("returnCode", rsp.ReturnCode), zap.String("returnMessage", rsp.ReturnMessage))
		return fmt.Errorf("%s", rsp.ReturnMessage)
	}

	log.Info("[uin] verify success", zap.String("uin", uin), zap.String("skey", sKey))
	return nil
}

// AccountRequest 发起Account请求
func AccountRequest(uin string, sKey string, conf *bootstrap.Config) (*AccountRsp, error) {
	req := newLoginServiceReq(uin, sKey, AccountInterfaceName)
	ret, err := newHttpRequest(http.MethodPost, conf.LoginService.Account, req, nil)
	if err != nil {
		return nil, err
	}

	var rsp AccountRsp
	if err := json.Unmarshal(ret, &rsp); err != nil {
		log.Error("[uin] account json unmarshal err", zap.String("uin", uin), zap.String("skey", sKey),
			zap.Any("resp", ret), zap.Error(err))
		return nil, err
	}
	if rsp.ReturnCode != 0 {
		log.Error("[uin] account rsp return code is not 0", zap.String("uin", uin), zap.String("skey", sKey),
			zap.Int32("returnCode", rsp.ReturnCode), zap.String("returnMessage", rsp.ReturnMessage))
		return nil, fmt.Errorf("%s", rsp.ReturnMessage)
	}

	log.Info("[uin] account success", zap.String("uin", uin), zap.String("skey", sKey), zap.Any("data", rsp.Data))
	return &rsp, nil
}

// CreatePolarisUsersRequest 创建用户请求
func CreatePolarisUsersRequest(id string, name string, conf *bootstrap.Config) error {
	req := []*PolarisUser{
		{
			ID:       id,
			Name:     name,
			Password: "polarismesh@2024",
		},
	}

	url := fmt.Sprintf("http://%s%s", conf.PolarisServer.Address, conf.WebServer.AuthURL+"/users")
	headers := make(map[string]string)
	headers["X-Polaris-Token"] = conf.PolarisServer.PolarisToken
	ret, err := newHttpRequest(http.MethodPost, url, req, headers)
	if err != nil {
		return err
	}

	var rsp PolarisRsp
	if err := json.Unmarshal(ret, &rsp); err != nil {
		log.Error("[uin] create users unmarshal err", zap.Any("req", req), zap.Error(err))
		return err
	}

	if rsp.Code != 200000 {
		if rsp.Code == 400215 || rsp.Code == 400201 {
			// 创建的时候，用户已存在，则跳过
			log.Info("[uin] create users existed, no need to create", zap.String("id", id), zap.String("name", name),
				zap.Int32("code", rsp.Code), zap.String("info", rsp.Info))
			return nil
		}
		log.Error("[uin] create users return code is not 0", zap.Any("req", req),
			zap.Int32("code", rsp.Code), zap.String("info", rsp.Info))
		return fmt.Errorf("%s", rsp.Info)
	}

	log.Info("[uin] create users success", zap.Any("req", req))
	return nil
}

// CreatePolarisAuthStrategyRequest 创建策略请求
func CreatePolarisAuthStrategyRequest(id string, name string, conf *bootstrap.Config) error {
	req := &PolarisAuthStrategyReq{
		Name:    fmt.Sprintf("all-strategy-%s", name),
		Comment: fmt.Sprintf("all-strategy-%s", name),
		Action:  1,
	}
	req.Principals.Users = []PolarisAuthStrategyEntry{{ID: id}}
	req.Resources.Namespaces = []PolarisAuthStrategyEntry{{ID: "*"}}
	req.Resources.Services = []PolarisAuthStrategyEntry{{ID: "*"}}
	req.Resources.ConfigGroups = []PolarisAuthStrategyEntry{{ID: "*"}}

	url := fmt.Sprintf("http://%s%s", conf.PolarisServer.Address, conf.WebServer.AuthURL+"/auth/strategy")
	headers := make(map[string]string)
	headers["X-Polaris-Token"] = conf.PolarisServer.PolarisToken
	ret, err := newHttpRequest(http.MethodPost, url, req, headers)
	if err != nil {
		return err
	}

	var rsp PolarisRsp
	if err := json.Unmarshal(ret, &rsp); err != nil {
		log.Error("[uin] create auth strategy unmarshal err", zap.Any("req", req), zap.Error(err))
		return err
	}

	if rsp.Code != 200000 {
		if rsp.Code == 400201 {
			log.Info("[uin] create auth strategy existed, no need to create", zap.Any("req", req),
				zap.Int32("code", rsp.Code), zap.String("info", rsp.Info))
			return nil
		}
		log.Error("[uin] create auth strategy return code is not 0", zap.Any("req", req),
			zap.Int32("code", rsp.Code), zap.String("info", rsp.Info))
		return fmt.Errorf("%s", rsp.Info)
	}

	log.Info("[uin] create auth strategy success", zap.Any("req", req))
	return nil
}

// GetPolarisUserTokenRequest 发起获取北极星用户Token的请求
func GetPolarisUserTokenRequest(id string, conf *bootstrap.Config) (*PolarisUser, error) {
	url := fmt.Sprintf("http://%s%s?id=%s", conf.PolarisServer.Address, conf.WebServer.AuthURL+"/user/token", id)
	headers := make(map[string]string)
	headers["X-Polaris-Token"] = conf.PolarisServer.PolarisToken

	ret, err := newHttpRequest(http.MethodGet, url, nil, headers)
	if err != nil {
		return nil, err
	}

	var rsp PolarisGetUserTokenRsp
	if err := json.Unmarshal(ret, &rsp); err != nil {
		log.Error("[uin] get user token unmarshal err", zap.String("id", id), zap.Error(err))
		return nil, err
	}

	if rsp.Code != 200000 {
		if rsp.Code == 400312 {
			log.Info("[uin] not found user, maybe need to create", zap.String("id", id))
			return nil, nil
		}

		log.Error("[uin] get user token return code is not 0", zap.String("id", id),
			zap.Int32("code", rsp.Code), zap.String("info", rsp.Info))
		return nil, fmt.Errorf("%s", rsp.Info)
	}

	log.Info("[uin] get user token success", zap.Any("rsp", rsp))
	return rsp.User, nil

}
