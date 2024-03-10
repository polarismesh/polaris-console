package uin

import (
	"github.com/polarismesh/polaris-console/common/log"
	"go.uber.org/zap"
	"time"
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
	Source      string `json:"source"`
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

// PolarisGetUserTokenRsp 获取用户Token的返回结构体
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
