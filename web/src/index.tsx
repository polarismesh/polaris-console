// 导入样式
import 'tea-component/dist/tea.css'
// 全局自定义样式
import './assets/css/global.css'
import { createHashHistory } from 'history'

export const history = createHashHistory()
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import { Router, Switch, Route } from 'react-router-dom'
import LoginPage from '@src/polaris/auth/login/Page'
import LoginPageDuck from '@src/polaris/auth/login/PageDuck'
import { connectWithDuck } from './polaris/common/helpers'

import { initI18n } from './polaris/common/util/i18n'

initI18n()

const Login = connectWithDuck(LoginPage, LoginPageDuck as any)
export default function render() {
  ReactDOM.unmountComponentAtNode(document.querySelector('#polaris-console'))
  ReactDOM.render(
    <Router history={history}>
      <Switch>
        <Route exact path='/login' component={Login} />
        <Route exact path='*'>
          <App />
        </Route>
      </Switch>
    </Router>,
    document.querySelector('#polaris-console'),
  )
}
render()
