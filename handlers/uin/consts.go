package uin

const (
	// VerifyInterfaceName 验证uin的接口名
	VerifyInterfaceName = "active.ptlogin.verify"

	// AccountInterfaceName 获取uin用户信息的接口名
	AccountInterfaceName = "qcloud.account.getUserInfoByLoginUin"
)

const (
	// PolarisCodeSuccess 成功返回码
	PolarisCodeSuccess = 200000

	// PolarisCodeResourceExist 资源存在
	PolarisCodeResourceExist = 400201

	// PolarisCodeUserExist 用户已存在
	PolarisCodeUserExist = 400215

	// PolarisCodeNotFoundUser 找不到用户
	PolarisCodeNotFoundUser = 400312
)
