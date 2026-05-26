import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Table } from '../components/ui/table'
import { Textarea } from '../components/ui/textarea'
import { CaseItem, caseService } from '../services/caseService'

const emptyForm: CaseItem = { name: '', code: '', precondition: '', steps: '', expected: '' }

export default function CasesPage() {
  const [items, setItems] = useState<CaseItem[]>([])
  const [form, setForm] = useState<CaseItem>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)

  const refresh = async () => setItems(await caseService.list().catch(() => []))
  useEffect(() => {
    void refresh()
  }, [])

  const save = async () => {
    if (editingId) await caseService.update(editingId, form)
    else await caseService.create(form)
    setForm(emptyForm)
    setEditingId(null)
    await refresh()
  }

  const onImportClick = () => importInputRef.current?.click()

  const onImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await caseService.importExcel(file)
    event.target.value = ''
    await refresh()
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2>用例管理</h2>
          <p>维护测试用例库，支持创建、编辑、删除和 Excel 导入。</p>
        </div>
        <div className="status-chip">共 {items.length} 条用例</div>
      </div>

      <Card>
        <h3>用例表单</h3>
        <p className="notice">当前版本不支持执行测试任务，仅支持配置与管理。</p>
        <div className="form-grid two-col">
          <Input placeholder="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="编号" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Textarea placeholder="预置条件" value={form.precondition} onChange={(e) => setForm({ ...form, precondition: e.target.value })} />
          <Textarea placeholder="测试步骤" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
          <Textarea placeholder="预期结果" value={form.expected} onChange={(e) => setForm({ ...form, expected: e.target.value })} />
        </div>
        <div className="action-row">
          <Button onClick={() => void save()}>{editingId ? '更新用例' : '新增用例'}</Button>
          <Button onClick={onImportClick}>导入用例</Button>
          {editingId && <Button onClick={() => { setEditingId(null); setForm(emptyForm) }}>取消编辑</Button>}
        </div>
        <input
          ref={importInputRef}
          type="file"
          accept=".xlsx,.xlsm"
          style={{ display: 'none' }}
          onChange={(e) => void onImportFileChange(e)}
        />
      </Card>

      <Card>
        <h3>用例清单</h3>
        <Table>
          <thead><tr><th>名称</th><th>编号</th><th>预置条件</th><th>测试步骤</th><th>预期结果</th><th>操作</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td><td>{item.code}</td><td>{item.precondition}</td><td>{item.steps}</td><td>{item.expected}</td>
                <td>
                  <div className="action-row compact">
                    <Button onClick={() => { setEditingId(item.id ?? null); setForm(item) }}>编辑</Button>
                    <Button onClick={() => item.id && caseService.remove(item.id).then(refresh)}>删除</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
