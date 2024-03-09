package uin

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/common/log"
	"go.uber.org/zap"
	"io"
	"net/http"
	"time"
)

const (
	VerifyInterfaceName  = "active.ptlogin.verify"
	AccountInterfaceName = "qcloud.account.getUserInfoByLoginUin"
)

// LoginServiceReq 登录服务请求体
type LoginServiceReq struct {
	Version       int    `json:"version"`
	ComponentName string `json:"componentName"`
	EventId       int    `json:"eventId"`
	Timestamp     int64  `json:"timestamp"`
	User          string `json:"user"`
	Interface     struct {
		InterfaceName string      `json:"interfaceName"`
		Para          interface{} `json:"para"`
	} `json:"interface"`
}

// LoginServiceRsp 登录服务返回的Body
type LoginServiceRsp struct {
	ReturnCode    int32
	ReturnMessage string
	ReturnMsg     string
	Data          interface{}
}

// VerifyReqParam verify请求的参数
type VerifyReqParam struct {
	Uin      string `json:"uin"`
	SKey     string `json:"skey"`
	NeedNick int    `json:"need_nick"`
	Cip      int    `json:"cip"`
}

// AccountReqParam account获取账号信息的请求参数
type AccountReqParam struct {
	LoginUin string `json:"LoginUin"`
}

// VerifyRsp verify请求返回
type VerifyRsp struct {
	ReturnCode    int32  `json:"returnCode"`
	ReturnMessage string `json:"returnMessage"`
	ReturnMsg     string `json:"returnMsg"`
}

// AccountRsp account请求返回
type AccountRsp struct {
	ReturnCode    int32  `json:"returnCode"`
	ReturnMessage string `json:"returnMessage"`
	ReturnMsg     string `json:"ReturnMsg"`
	Data          struct {
		Name string `json:"name"`
	} `json:"data"`
}

// PolarisUser 北极星用户
type PolarisUser struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Password    string `json:"password"`
	AuthToken   string `json:"auth_token"`
	TokenEnable bool   `json:"token_enable"`
}

// PolarisRsp polaris-server公共返回
type PolarisRsp struct {
	Code int32  `json:"code"`
	Info string `json:"info"`
}

// PolarisAuthStrategyReq 创建策略请求
type PolarisAuthStrategyReq struct {
	Name       string `json:"name"`
	Comment    string `json:"comment"`
	Action     int    `json:"action"`
	Principals struct {
		Users []PolarisAuthStrategyEntry `json:"users"`
	} `json:"principals"`
	Resources struct {
		Namespaces   []PolarisAuthStrategyEntry `json:"namespaces"`
		Services     []PolarisAuthStrategyEntry `json:"services"`
		ConfigGroups []PolarisAuthStrategyEntry `json:"config_groups"`
	} `json:"resources"`
}

// PolarisAuthStrategyEntry ID传递
type PolarisAuthStrategyEntry struct {
	ID string `json:"id"`
}

type PolarisGetUserTokenRsp struct {
	PolarisRsp
	User *PolarisUser `json:"user"`
}

func newLoginServiceReq(uin string, sKey string, interfaceName string) *LoginServiceReq {
	req := &LoginServiceReq{
		Version:       1,
		ComponentName: "polaris-console-server",
		EventId:       int(time.Now().UnixNano()%999999999 + 100000000),
		Timestamp:     time.Now().Unix(),
		User:          "auto",
	}
	req.Interface.InterfaceName = interfaceName

	switch interfaceName {
	case VerifyInterfaceName:
		req.Interface.Para = &VerifyReqParam{
			Uin:      uin,
			SKey:     sKey,
			NeedNick: 1,
			Cip:      1112370289,
		}
	case AccountInterfaceName:
		req.Interface.Para = &AccountReqParam{
			LoginUin: uin,
		}
	default:
		log.Error("[uin] not found interfaceName", zap.String("uin", uin), zap.String("skey", sKey),
			zap.String("interfaceName", interfaceName))
		return nil
	}

	return req
}

// GetPolarisCurrentUinToken 获取北极星当前uin下对应的用户token信息
func GetPolarisCurrentUinToken(c *gin.Context, conf *bootstrap.Config) (string, string, error) {
	uinCookie, _ := c.Request.Cookie("uin")
	skeyCookie, _ := c.Request.Cookie("skey")
	if uinCookie == nil || skeyCookie == nil {
		log.Error("[uinCookie] not found uin or skey in the cookies")
		return "", "", fmt.Errorf("not found uin or skey from the cookie")
	}

	// 先校验登录状态，只有登录状态下uin才有效
	if err := VerifyRequest(uinCookie.Value, skeyCookie.Value, conf); err != nil {
		// 没有校验成功uin信息，清理jwt
		c.SetCookie("jwt", "", 5, "/", "", false, false)
		return "", "", err
	}

	user, err := GetOrCreatePolarisUserToken(uinCookie.Value, skeyCookie.Value, conf)
	if err != nil {
		return "", "", err
	}
	if user == nil {
		return "", "", fmt.Errorf("not found user id: %s", uinCookie.Value)
	}

	if !user.TokenEnable {
		return "", "", fmt.Errorf("xxxxxx TODO")
	}

	c.Request.Header.Set("x-polaris-user", user.ID)
	c.Request.Header.Set("x-polaris-token", user.AuthToken)
	return user.ID, user.AuthToken, nil
}

// GetOrCreatePolarisUserToken 获取或创建北极星用户Token
func GetOrCreatePolarisUserToken(uin string, sKey string, conf *bootstrap.Config) (*PolarisUser, error) {
	user, err := GetPolarisUserTokenRequest(uin, conf)
	if err != nil {
		// TODO
		return nil, err
	}

	if user != nil {
		return user, nil
	}

	// 没有报错，获取不到user，则代表用户不存在，先去创建用户
	account, err := AccountRequest(uin, sKey, conf)
	if err != nil {
		// TODO
		return nil, err
	}
	// 先创建用户
	if err := CreatePolarisUsersRequest(uin, account.Data.Name, conf); err != nil {
		return nil, err
	}
	// 再创建用户的策略
	if err := CreatePolarisAuthStrategyRequest(uin, account.Data.Name, conf); err != nil {
		return nil, err
	}

	// 等待1s，待Server获取到最新的用户信息到Cache，再获取一次User
	time.Sleep(time.Second + time.Millisecond*100)
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
			log.Info("[uin] create users existed", zap.String("id", id), zap.String("name", name),
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
			log.Info("[uin] create auth strategy existed", zap.Any("req", req),
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

func newHttpRequest(method string, url string, req interface{}, headers map[string]string) ([]byte, error) {
	data, err := json.Marshal(req)
	if err != nil {
		log.Error("[uin] loginServiceReq do json marshal err", zap.Any("req", req), zap.Error(err))
		return nil, err
	}

	// 构建请求
	request, err := http.NewRequest(method, url, bytes.NewBuffer(data))
	if err != nil {
		log.Error("[uin] http new request err", zap.ByteString("body", data), zap.Error(err))
		return nil, err
	}

	// 设置请求头
	request.Header.Set("Content-type", "application/json")
	for k, v := range headers {
		request.Header.Set(k, v)
	}

	log.Info("[uin] new request", zap.String("url", url), zap.Any("req", req), zap.Any("headers", headers))
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		log.Error("[uin] http client do request err", zap.Any("req", req), zap.Error(err))
		if response != nil && response.Body != nil {
			_ = response.Body.Close()
		}
		return nil, err
	}
	defer func() {
		if response != nil && response.Body != nil {
			_ = response.Body.Close()
		}
	}()

	var ret bytes.Buffer
	if _, err := io.Copy(&ret, response.Body); err != nil {
		log.Error("[uin] io copy err", zap.Any("req", req), zap.Error(err))
		return nil, err
	}
	if response.StatusCode != http.StatusOK {
		log.Error("[uin] response status err", zap.String("url", url), zap.Any("req", req), zap.Error(err),
			zap.Any("rsp", ret.String()), zap.Int("code", response.StatusCode))
		return ret.Bytes(), fmt.Errorf("http request return code: %d", response.StatusCode)
	}

	return ret.Bytes(), nil
}
