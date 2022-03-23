import router from './router'

// 为node节点或master节点生成id
export function genIdForNode() {
  let d = new Date().getTime()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

//polyfill closest方法
export function getClosest(element: any, selector: string) {
  const matchesSelector =
    element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector
  if (matchesSelector) {
    while (element) {
      if (matchesSelector.call(element, selector)) {
        break
      }
      element = element.parentElement
    }
    return element
  }
  return null
}

export function isOwner() {
  return window.localStorage.getItem(LoginRoleKey) === 'main'
}

export function getUin() {
  return window.localStorage.getItem(LoginUserIdKey)
}
export function getOwnerUin() {
  const ownerId = window.localStorage.getItem(LoginUserOwnerIdKey)
  return ownerId === '' ? getUin() : ownerId
}
export function getLoginName() {
  return window.localStorage.getItem(LoginUserNameKey)
}
export const diffAddRemoveArray = (originArray: string[] = [], currentArray: string[] = []) => {
  const addArray = [...currentArray],
    removeArray = []
  originArray.forEach(item => {
    const index = currentArray.indexOf(item)
    if (index < 0) {
      removeArray.push(item)
    } else {
      const spliceIndex = addArray.indexOf(item)
      addArray.splice(spliceIndex, 1)
    }
  })
  return { addArray, removeArray }
}
export const PolarisTokenKey = 'polaris_token'
export const LoginRoleKey = 'login-role'
export const LoginUserIdKey = 'login-user-id'
export const LoginUserOwnerIdKey = 'login-owner-id'
export const LoginUserNameKey = 'login-name'

export function checkIsUserLogin() {
  return !!window.localStorage.getItem(PolarisTokenKey)
}
export function userLogout() {
  window.localStorage.setItem(PolarisTokenKey, '')
  window.localStorage.setItem(LoginUserNameKey, '')
  window.localStorage.setItem(LoginRoleKey, '')
  window.localStorage.setItem(LoginUserIdKey, '')
  window.localStorage.setItem(LoginUserOwnerIdKey, '')
  router.navigate('/login')
}
