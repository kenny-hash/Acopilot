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
  const [message, setMessage] = useState('')

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
    try {
      const imported = await caseService.importExcel(file)
      event.target.value = ''
      await refresh()
      setMessage(`导入成功，共导入 ${imported.length} 条用例`) 
    } catch (error) {
      setMessage(`导入失败，请确认 Excel 列顺序为：名称、编号、预置条件、测试步骤、预期结果`) 
    }
  }

  return (
    <Card>
      <h2>用例管理</h2>
      <p className="notice">当前版本不支持执行测试任务，仅支持配置与管理。</p>
      {message ? <p className="notice">{message}</p> : null}
      <div className="form-grid">
        <Input placeholder="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="编号" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <Textarea placeholder="预置条件" value={form.precondition} onChange={(e) => setForm({ ...form, precondition: e.target.value })} />
        <Textarea placeholder="测试步骤" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
        <Textarea placeholder="预期结果" value={form.expected} onChange={(e) => setForm({ ...form, expected: e.target.value })} />
        <Button onClick={() => void save()}>{editingId ? '更新' : '新增'}</Button>
        <Button onClick={onImportClick}>导入用例</Button>
        <input
          ref={importInputRef}
          type="file"
          accept=".xlsx,.xlsm"
          style={{ display: 'none' }}
          onChange={(e) => void onImportFileChange(e)}
        />
      </div>
      <Table>
        <thead><tr><th>名称</th><th>编号</th><th>预置条件</th><th>测试步骤</th><th>预期结果</th><th>操作</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td><td>{item.code}</td><td>{item.precondition}</td><td>{item.steps}</td><td>{item.expected}</td>
              <td>
                <Button onClick={() => { setEditingId(item.id ?? null); setForm(item) }}>编辑</Button>
                <Button onClick={() => item.id && caseService.remove(item.id).then(refresh)}>删除</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}
