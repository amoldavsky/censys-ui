import { createRouter, createWebHistory } from 'vue-router'
import HostsView from '@/views/HostsView.vue'
import HostDetailsView from '@/views/HostDetailsView.vue'
import WebView from '@/views/WebView.vue'
import WebDetailsView from '@/views/WebDetailsView.vue'
import DataView from '@/views/DataView.vue'

const routes = [
  { path: '/', redirect: '/hosts' },
  { path: '/hosts', component: HostsView, meta: { title: 'Hosts' } },
  { path: '/hosts/:ip', component: HostDetailsView, meta: { title: 'Host Details' } },
  { path: '/web', component: WebView, meta: { title: 'Web Assets' } },
  { path: '/web/:domain', component: WebDetailsView, meta: { title: 'Web Asset Details' } },
  { path: '/data', component: DataView, meta: { title: 'Data' } }
]

const router = createRouter({ history: createWebHistory(), routes })
export default router
