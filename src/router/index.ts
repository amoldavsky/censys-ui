import { createRouter, createWebHistory } from 'vue-router'
import AssetsView from '@/views/AssetsView.vue'
import HostsView from '@/views/HostsView.vue'
import WebView from '@/views/WebView.vue'
import DataView from '@/views/DataView.vue'

const routes = [
  { path: '/', redirect: '/assets' },
  { path: '/assets', component: AssetsView, meta: { title: 'Assets' } },
  { path: '/hosts', component: HostsView, meta: { title: 'Hosts' } },
  { path: '/web', component: WebView, meta: { title: 'Web Properties' } },
  { path: '/data', component: DataView, meta: { title: 'Data' } }
]

const router = createRouter({ history: createWebHistory(), routes })
export default router
