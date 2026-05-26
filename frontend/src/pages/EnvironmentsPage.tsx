import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Switch } from '../components/ui/switch'
import { Table } from '../components/ui/table'
import { Textarea } from '../components/ui/textarea'
import { environmentService, TestEnvironment } from '../services/environmentService'

const emptyForm: TestEnvironment = { name: '', base_url: '', auth_type: 'none', token: '', verify_tls: true, timeout_seconds: 30, enabled: true, description: '' }

export default function EnvironmentsPage() {
  const [items, setItems] = useState<TestEnvironment[]>([])
  const [form, setForm] = useState<TestEnvironment>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const refresh = async () => setItems(await environmentService.list().catch(() => []))
  useEffect(() => { void refresh() }, [])

  const save = async () => {
    if (editingId) await environmentService.update(editingId, form)
    else await environmentService.create(form)
    setForm(emptyForm)
    setEditingId(null)
    await refresh()
  }

  return <div className='page-stack'>
    <div className='page-header'><div><h2>测试环境管理</h2><p>管理设备 API 的连接地址、认证与超时参数。</p></div><div className='status-chip'>共 {items.length} 个环境</div></div>
    <Card>
      <h3>环境配置</h3>
      <div className='form-grid two-col'>
        <Input placeholder='环境名称，如 dev-lab' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder='Base URL，如 https://10.0.0.8/api/v1' value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} />
        <Select value={form.auth_type} onValueChange={(v) => setForm({ ...form, auth_type: v as 'none' | 'bearer' })} options={[{ label: '无认证', value: 'none' }, { label: 'Bearer Token', value: 'bearer' }]} />
        <Input placeholder='Token（auth_type=bearer 时必填）' value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} />
        <Input type='number' placeholder='超时秒数' value={form.timeout_seconds} onChange={(e) => setForm({ ...form, timeout_seconds: Number(e.target.value) })} />
        <div className='field-item'><label className='field-label'>校验证书 verify_tls</label><Switch checked={form.verify_tls} onCheckedChange={(checked) => setForm({ ...form, verify_tls: checked })} /></div>
        <div className='field-item'><label className='field-label'>是否启用 enabled</label><Switch checked={form.enabled} onCheckedChange={(checked) => setForm({ ...form, enabled: checked })} /></div>
        <Textarea placeholder='描述（可选）' value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className='action-row'>
        <Button onClick={() => void save()}>{editingId ? '更新环境' : '新增环境'}</Button>
        {editingId && <Button onClick={() => { setEditingId(null); setForm(emptyForm) }}>取消编辑</Button>}
      </div>
    </Card>

    <Card>
      <h3>环境列表</h3>
      <Table>
        <thead><tr><th>名称</th><th>base_url</th><th>认证</th><th>timeout</th><th>TLS</th><th>启用</th><th>操作</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.base_url}</td><td>{item.auth_type}</td><td>{item.timeout_seconds}s</td><td>{item.verify_tls ? '是' : '否'}</td><td>{item.enabled ? '是' : '否'}</td><td><div className='action-row compact'><Button onClick={() => { setEditingId(item.id ?? null); setForm(item) }}>编辑</Button><Button onClick={() => item.id && environmentService.remove(item.id).then(refresh)}>删除</Button></div></td></tr>)}</tbody>
      </Table>
    </Card>
  </div>
}
