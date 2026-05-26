from fastapi import APIRouter
from app.schemas.task import TestTaskCreate, TestTaskOut, TaskStepResult

router = APIRouter(prefix='/api/tasks', tags=['tasks'])
_store: dict[int, TestTaskOut] = {}
_counter = 0
HIGH_RISK_CASE_KEYWORDS = ['删除', '重启', '格式化', '清空']

@router.get('', response_model=list[TestTaskOut])
def list_tasks() -> list[TestTaskOut]:
    return list(_store.values())

@router.post('', response_model=TestTaskOut, status_code=201)
def create_and_run_task(payload: TestTaskCreate) -> TestTaskOut:
    global _counter
    step_results: list[TaskStepResult] = []
    blocked = 0
    passed = 0
    for idx, case_id in enumerate(payload.case_ids or [0], start=1):
        if (not payload.allow_high_risk) and any(k in payload.name for k in HIGH_RISK_CASE_KEYWORDS):
            step_results.append(TaskStepResult(case_id=case_id, step_index=idx, status='blocked', message='命中高危保护策略'))
            blocked += 1
        else:
            step_results.append(TaskStepResult(case_id=case_id, step_index=idx, status='passed', message='模拟执行通过'))
            passed += 1

    _counter += 1
    task = TestTaskOut(
        id=_counter,
        status='finished',
        summary={'total': len(step_results), 'passed': passed, 'blocked': blocked},
        step_results=step_results,
        **payload.model_dump(),
    )
    _store[task.id] = task
    return task
