import DefaultTheme from 'vitepress/theme'
import './style.css'

export default {
  ...DefaultTheme,
  enhanceApp({ router }) {
    router.onAfterRouteChanged = () => {
      fetch('/__version.json?_t=' + Date.now())
        .then(res => res.json())
        .then(({ version }) => {
          const localVersion = localStorage.getItem('__vp_version')
          if (localVersion && localVersion !== version) {
            if (confirm('🔄 文档已更新，是否刷新？')) {
              localStorage.setItem('__vp_version', version)
              location.reload()
            }
          } else {
            localStorage.setItem('__vp_version', version)
          }
        })
        .catch(() => {})
    }
  }
}
