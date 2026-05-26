import { useEffect, useState } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { platformService, TestCollection, TestStrategy, TestTask } from '../services/platformService'
import { environmentService, TestEnvironment } from '../services/environmentService'
import { Select } from '../components/ui/select'

export default function PlatformPage() {
  const [collections, setCollections] = useState<TestCollection[]>([])
  const [strategies, setStrategies] = useState<TestStrategy[]>([])
  const [tasks, setTasks] = useState<TestTask[]>([])
  const [name, setName] = useState('默认测试集')
  const [environments, setEnvironments] = useState<TestEnvironment[]>([])
  const [environment, setEnvironment] = useState('dev-lab')

  const refresh = async () => {
    setCollections(await platformService.listCollections().catch(() => []))
    setStrategies(await platformService.listStrategies().catch(() => []))
    setTasks(await platformService.listTasks().catch(() => []))
    const envs = await environmentService.list().catch(() => [])
    setEnvironments(envs)
    if (!environment && envs[0]?.name) setEnvironment(envs[0].name)
  }
  useEffect(() => { void refresh() }, [])

  const quickSetup = async () => {
    const c = await platformService.createCollection({ name, version: 'v1', source: 'openapi', status: 'published', description: 'README目标能力测试集' })
    await platformService.createStrategy({ name: '冒烟测试', strategy_type: 'smoke', collection_id: c.id!, case_ids: [], risk_only: false })
    await refresh()
  }

  const runTask = async () => {
    if (!collections[0]) return
    await platformService.runTask({ name: '删除卷高危验证任务', environment, collection_id: collections[0].id!, strategy_id: null, case_ids: [1, 2], allow_high_risk: false, auto_cleanup: true, retry_on_fail: false })
    await platformService.runTask({ name: '删除卷高危验证任务', environment: 'dev-lab', collection_id: collections[0].id!, strategy_id: null, case_ids: [1, 2], allow_high_risk: false, auto_cleanup: true, retry_on_fail: false })
    await refresh()
  }

  return <div className='page-stack'>
    <div className='page-header'><h2>测试集 / 策略 / 任务</h2></div>
    <Card>
      <h3>一键初始化</h3>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <div className='form-grid'><Select value={environment} onValueChange={setEnvironment} options={(environments.length ? environments : [{ name: 'dev-lab' } as TestEnvironment]).map((e) => ({label: e.name, value: e.name}))} /></div>
      <div className='action-row'><Button onClick={() => void quickSetup()}>创建测试集+策略</Button><Button onClick={() => void runTask()}>执行模拟任务</Button></div>
      <p>测试集: {collections.length}，策略: {strategies.length}，任务: {tasks.length}</p>
      {tasks.map((t) => <pre key={t.id}>{JSON.stringify({ id: t.id, summary: t.summary }, null, 2)}</pre>)}
    </Card>
  </div>
}
