package uin

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/polarismesh/polaris-console/common/log"
	"go.uber.org/zap"
	"io"
	"net/http"
)

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
		// 如果是参数错误，那有可能是资源已经存在，交给上层逻辑来判断
		if response.StatusCode == http.StatusBadRequest {
			log.Info("[uin] response status is bad request, maybe resource is existed, return nil",
				zap.String("url", url), zap.Any("req", req), zap.Any("rsp", ret.String()),
				zap.Int("code", response.StatusCode))
			return ret.Bytes(), nil
		}
		log.Error("[uin] response status err", zap.String("url", url), zap.Any("req", req),
			zap.Any("rsp", ret.String()), zap.Int("code", response.StatusCode))
		return nil, fmt.Errorf("http request return code: %d", response.StatusCode)
	}

	return ret.Bytes(), nil
}
