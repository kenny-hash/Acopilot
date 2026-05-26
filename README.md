# Acopilot

面向存储设备 RESTful API 的 AI 化接口测试平台。

本平台以 **测试集 Test Collection** 为核心，将 API 接口文档解析、标准化、用例设计、测试策略设计、自动化执行、结果回传、失败分析和测试报告生成串联成完整闭环。平台服务的主要对象包括 API 开发设计者、API 测试设计者、API 测试执行者以及一组负责自动化任务的 AI Agents。

---


## 本地开发（当前仓库可直接运行）

> 下面是**当前代码仓库**可用的本地启动方式（不是上文的目标架构示例）。

### 方式一：一键启动前后端

```bash
bash scripts/dev_up.sh
```

默认端口：
- 后端 FastAPI: `http://127.0.0.1:8000`
- 前端 Vite: `http://127.0.0.1:5173`

可通过环境变量覆盖：

```bash
PYTHON_BIN=python3.11 BACKEND_PORT=18000 FRONTEND_PORT=15173 bash scripts/dev_up.sh
```

### 方式二：手动分别启动

```bash
# backend
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend

# frontend（新开终端）
npm --prefix frontend install
npm --prefix frontend run dev -- --host 0.0.0.0 --port 5173
```

## 1. 项目目标

本项目旨在实现一个用于存储设备 RESTful API 测试的统一平台，重点解决以下问题：

1. 非标准 API 文档难以直接用于自动化测试。
2. 测试用例通常分散在 Excel、脚本、文档中，缺少统一管理。
3. API 文档、测试用例、测试环境、测试任务和测试结果之间缺少可追溯关系。
4. 存储设备 API 存在高危操作，例如删除卷、删除存储池、重启控制器、修改网络配置等，需要执行前保护。
5. 测试执行结果缺少用例级、步骤级、接口级的精细化记录。
6. API 变更后，难以快速判断受影响的测试用例。
7. 自动化脚本开发和维护成本较高。

平台通过 AI Agents 辅助完成以下工作：

- 解析 API 接口文档。
- 转换为标准 OpenAPI / Swagger 格式。
- 审查 API 文档完整性和一致性。
- 生成或补全测试用例。
- 生成自动化测试 DSL 或脚本。
- 执行 RESTful API 测试任务。
- 回传用例级和步骤级测试结果。
- 分析失败原因。
- 生成测试报告。

---

## 2. 核心概念

### 2.1 测试集 Test Collection

测试集是平台最核心的业务对象。

一个测试集表示：

> 某个已经审核通过的标准 API 文档版本，以及围绕该 API 文档版本展开的测试用例、测试策略、执行任务和测试结果。

测试人员和 AI Agents 的任务都应围绕测试集展开。

测试集包含：

- 标准 API 文档版本。
- API 接口清单。
- Schema 定义。
- 测试用例集合。
- 测试策略集合。
- 测试任务历史。
- 测试结果统计。
- API 版本差异记录。

### 2.2 标准 API 文档

平台将原始 API 文档解析为统一的标准 API 文档。推荐使用：

- OpenAPI 3.x JSON / YAML。
- Swagger 2.0 JSON。

标准 API 文档至少应包含：

- 接口路径。
- HTTP 方法。
- 请求 Header。
- Path 参数。
- Query 参数。
- Request Body。
- Response Body。
- HTTP 状态码。
- 业务错误码。
- 认证方式。
- 示例请求和示例响应。
- 参数类型、枚举值、默认值和约束。

### 2.3 测试用例

测试用例是平台的基本管理粒度。

平台应支持两类用例：

1. **单接口用例**：只测试一个 API。
2. **流程型用例**：包含多个 API 调用步骤，例如创建存储池、创建卷、查询卷、删除卷。

测试用例可以来自：

- Excel 导入。
- AI Agent 自动生成。
- 平台页面手工维护。
- 外部系统同步。

### 2.4 测试策略

测试策略用于组织测试用例的执行范围。

常见策略包括：

- 冒烟测试。
- 全量回归测试。
- 版本变更影响测试。
- 高危接口测试。
- 只读接口测试。
- 权限测试。
- 异常参数测试。
- 资源生命周期测试。

### 2.5 测试任务

测试任务是一次具体的测试执行实例。

测试执行者在创建任务时需要选择：

- 测试环境。
- 测试集版本。
- 测试用例或测试策略。
- 是否允许高危操作。
- 是否自动清理测试数据。
- 是否启用失败重试。

---

## 3. 用户角色

### 3.1 API 开发设计者

负责：

- 上传 API 接口文档。
- 维护 API 文档版本。
- 审核 AI Agent 解析后的标准 API 文档。
- 发布测试集。

### 3.2 API 测试设计者

负责：

- 基于测试集设计测试用例。
- 导入 Excel 测试用例。
- 维护测试策略。
- 审核 AI Agent 生成的测试用例。
- 设计断言、变量提取、前置条件和后置清理动作。

### 3.3 API 测试执行者

负责：

- 选择测试环境。
- 选择测试集。
- 选择测试策略或测试用例。
- 创建测试任务。
- 查看测试进度和测试报告。
- 确认失败原因。

### 3.4 AI Agents

AI Agents 负责自动化处理平台中的智能任务，包括：

- API 文档解析。
- OpenAPI 转换。
- 文档质量审查。
- 测试用例生成。
- 测试用例导入解析。
- 自动化测试 DSL 或脚本生成。
- 测试执行。
- 失败原因分析。
- 测试报告生成。
- API 版本差异和影响分析。

---

## 4. 整体流程

```mermaid
flowchart TD
    A[API开发设计者上传原始API文档] --> B[平台保存原始文档]
    B --> C[文档解析Agent解析接口信息]
    C --> D[OpenAPI转换Agent生成标准API文档]
    D --> E[文档审查Agent检查完整性和一致性]
    E --> F[人工审核标准API文档]
    F -->|审核通过| G[发布为测试集 Test Collection]
    F -->|审核驳回| C

    G --> H[测试设计者导入或设计测试用例]
    H --> I[平台按用例粒度保存结构化用例]
    G --> J[用例生成Agent生成推荐用例]
    J --> I

    I --> K[测试设计者创建测试策略]
    K --> L[测试执行者选择测试环境]
    L --> M[创建测试任务]
    M --> N[任务调度服务生成执行计划]
    N --> O[测试执行Agent调用API Runner]
    O --> P[调用存储设备RESTful API]
    P --> Q[执行断言、变量提取和资源清理]
    Q --> R[保存步骤级和用例级结果]
    R --> S[失败分析Agent分析失败原因]
    R --> T[报告生成Agent生成测试报告]
```

---

## 5. 整体架构

```mermaid
flowchart TB
    subgraph UserLayer[用户与参与方]
        Dev[API开发设计者]
        Designer[API测试设计者]
        Executor[API测试执行者]
        Agents[AI Agents]
    end

    subgraph EntryLayer[平台入口层]
        Web[Web UI]
        API[平台REST API]
        Auth[认证 / 权限 / 审计]
    end

    subgraph CoreLayer[核心业务服务层]
        ProjectSvc[API项目管理服务]
        DocSvc[API文档管理服务]
        SpecSvc[标准API文档服务]
        CollectionSvc[测试集管理服务]
        CaseSvc[测试用例管理服务]
        StrategySvc[测试策略管理服务]
        EnvSvc[测试环境管理服务]
        TaskSvc[测试任务调度服务]
        ResultSvc[测试结果管理服务]
        ReportSvc[测试报告服务]
    end

    subgraph AgentLayer[AI Agent服务层]
        DocAgent[文档解析Agent]
        OpenAPIAgent[OpenAPI转换Agent]
        ReviewAgent[文档审查Agent]
        CaseGenAgent[测试用例生成Agent]
        CodeAgent[自动化DSL / 脚本生成Agent]
        ExecAgent[测试执行Agent]
        AnalysisAgent[失败分析Agent]
        ReportAgent[报告生成Agent]
        DiffAgent[版本差异 / 影响分析Agent]
    end

    subgraph ExecutionLayer[执行层]
        Queue[任务队列 / 调度器]
        Runner[通用API Runner]
        Sandbox[脚本执行沙箱]
        SecretMgr[Secret管理]
        LogCollector[日志采集器]
    end

    subgraph DataLayer[数据与资产层]
        DB[(业务数据库)]
        ObjectStorage[(对象存储)]
        Cache[(缓存 / 分布式锁)]
        Search[(日志检索)]
    end

    subgraph TargetLayer[被测存储设备环境]
        StorageAPI[存储设备RESTful API]
        StorageDevice[存储设备资源]
    end

    Dev --> Web
    Designer --> Web
    Executor --> Web
    Agents --> API

    Web --> API
    API --> Auth
    Auth --> CoreLayer

    DocSvc --> DocAgent
    DocAgent --> OpenAPIAgent
    OpenAPIAgent --> SpecSvc
    SpecSvc --> ReviewAgent
    ReviewAgent --> DocSvc
    SpecSvc --> CollectionSvc

    CollectionSvc --> CaseSvc
    CollectionSvc --> StrategySvc
    CollectionSvc --> TaskSvc

    CaseSvc --> CaseGenAgent
    CaseSvc --> CodeAgent
    StrategySvc --> TaskSvc
    EnvSvc --> TaskSvc

    TaskSvc --> Queue
    Queue --> ExecAgent
    ExecAgent --> Runner
    Runner --> SecretMgr
    Runner --> StorageAPI
    StorageAPI --> StorageDevice
    StorageDevice --> StorageAPI
    StorageAPI --> Runner

    Runner --> ResultSvc
    Runner --> LogCollector
    ResultSvc --> AnalysisAgent
    ResultSvc --> ReportSvc
    ReportSvc --> ReportAgent

    CoreLayer --> DB
    CoreLayer --> ObjectStorage
    ExecutionLayer --> Cache
    LogCollector --> Search
```

---

## 6. 主要功能模块

### 6.1 API 文档管理

- 原始 API 文档上传。
- 文档版本管理。
- AI 解析任务管理。
- OpenAPI / Swagger 预览。
- 接口列表展示。
- 接口详情展示。
- 文档差异对比。
- 审核与发布。

### 6.2 测试集管理

- 从审核通过的标准 API 文档创建测试集。
- 测试集版本管理。
- API 接口资产管理。
- 用例覆盖率统计。
- 测试执行历史查看。
- 测试集质量看板。

### 6.3 测试用例管理

- Excel 测试用例导入。
- 用例新增、编辑、删除。
- 用例和 API 接口关联。
- 用例步骤管理。
- 断言规则管理。
- 变量提取管理。
- 后置清理动作管理。
- 用例版本管理。
- AI 生成和补全用例。

### 6.4 测试策略管理

- 创建冒烟测试、回归测试、变更测试等策略。
- 按模块、优先级、标签、高危等级筛选用例。
- 按最近失败、最近变更筛选用例。
- AI 推荐测试范围。
- 策略版本管理。

### 6.5 测试环境管理

- 管理多个存储设备测试环境。
- 配置设备地址、协议、端口和认证方式。
- 加密保存 Token、密码和证书。
- 配置环境类型。
- 配置是否允许写操作和高危操作。
- 配置并发限制。
- 环境连通性检查。

### 6.6 测试任务执行

- 创建测试任务。
- 锁定测试集版本和用例版本。
- 执行前检查。
- 任务排队和调度。
- 实时状态展示。
- 失败重试。
- 任务中止。
- 执行日志采集。

### 6.7 测试结果与报告

- 保存任务级结果。
- 保存用例级结果。
- 保存步骤级结果。
- 保存请求和响应日志。
- AI 初步分析失败原因。
- 生成测试报告。
- 导出测试报告。
- 支持历史结果对比。

### 6.8 权限与审计

- 用户权限管理。
- 角色权限控制。
- 高危操作审批。
- Secret 访问控制。
- 用户操作审计。
- Agent 操作审计。

---

## 7. 存储设备 API 测试特性

存储设备 API 测试与普通 Web API 测试不同，平台需要重点支持以下能力。

### 7.1 高危接口识别与保护

高危接口示例：

- 删除卷。
- 删除存储池。
- 格式化磁盘。
- 清空快照。
- 删除复制关系。
- 重启控制器。
- 修改网络配置。
- 修改用户权限。
- 固件升级。

建议将 API 或测试用例划分为以下危险等级：

| 等级 | 说明                             |
| ---- | -------------------------------- |
| L0   | 只读接口                         |
| L1   | 普通写接口                       |
| L2   | 资源删除接口                     |
| L3   | 影响系统状态的接口               |
| L4   | 可能造成数据丢失或服务中断的接口 |

执行 L3 / L4 用例时，应进行环境校验、权限校验和二次确认。

### 7.2 测试资源生命周期管理

平台应支持测试资源的创建、引用、验证和清理。

典型资源包括：

- Pool。
- Volume。
- LUN。
- Snapshot。
- Clone。
- Host。
- Host Group。
- Replication。
- User。
- Role。

建议为每次测试任务生成唯一运行上下文：

```text
run_id = 20260526-0001
resource_prefix = auto_test_20260526_0001
```

所有自动创建的测试资源应带统一前缀，便于后续清理。

### 7.3 接口依赖与变量传递

平台应支持从前一步响应中提取变量，并在后续请求中引用。

示例：

```json
{
  "extract": [
    {
      "name": "volume_id",
      "path": "$.id"
    }
  ]
}
```

后续接口可引用：

```text
/api/v1/volumes/${volume_id}
```

---

## 8. 测试用例数据模型示例

平台内部建议使用结构化 JSON / DSL 保存测试用例，而不是直接依赖 Excel 行数据。

```json
{
  "case_id": "TC_VOLUME_001",
  "name": "创建卷成功",
  "collection_id": "COL_STORAGE_API_V1",
  "priority": "P0",
  "type": "positive",
  "tags": ["volume", "smoke", "create"],
  "preconditions": [
    "测试环境存在可用存储池"
  ],
  "steps": [
    {
      "step_no": 1,
      "api_ref": "POST /api/v1/volumes",
      "request": {
        "headers": {
          "Authorization": "Bearer ${token}"
        },
        "body": {
          "name": "auto_vol_${run_id}",
          "size": 10,
          "pool_id": "${pool_id}"
        }
      },
      "assertions": [
        {
          "type": "status_code",
          "expected": 201
        },
        {
          "type": "json_path",
          "path": "$.name",
          "expected": "auto_vol_${run_id}"
        },
        {
          "type": "exists",
          "path": "$.id"
        }
      ],
      "extract": [
        {
          "name": "volume_id",
          "path": "$.id"
        }
      ]
    }
  ],
  "cleanup": [
    {
      "api_ref": "DELETE /api/v1/volumes/${volume_id}"
    }
  ]
}
```

---

## 9. Excel 用例导入建议字段

后续可根据实际 Excel 模板调整。当前建议字段如下：

| 字段名   | 是否必填 | 说明                         | 标记 |
| -------- | -------- | ---------------------------- | ---- |
| 名称     | 是       | 用例标题                     | ✅ 已实现 |
| 编号     | 是       | 唯一标识，例如 TC_VOLUME_001 | ✅ 已实现 |
| 预置条件 | 否       | 执行前要求                   | ✅ 已实现 |
| 测试步骤 | 是       | 支持多行步骤描述             | ✅ 已实现 |
| 预期结果 | 是       | 支持结构化文本或分点描述     | ✅ 已实现 |

### 字段约束

- 编号唯一且必填；
- 名称必填；
- 测试步骤支持多行；
- 预期结果支持结构化文本。

### 已实现 / TODO 标记规范

- `✅ 已实现`：文档或功能已落地，可直接使用；
- `📝 TODO`：待补充或待实现项。

---

## 10. 推荐目录结构

以下目录结构可作为初始工程参考。

```text
storage-api-ai-test-platform/
├── README.md
├── docs/
│   ├── architecture.md
│   ├── api-document-workflow.md
│   ├── test-case-model.md
│   ├── test-runner-design.md
│   └── agent-design.md
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   └── workers/
│   ├── tests/
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── stores/
│   └── README.md
├── agents/
│   ├── document_parser_agent/
│   ├── openapi_convert_agent/
│   ├── testcase_generator_agent/
│   ├── execution_agent/
│   ├── analysis_agent/
│   └── report_agent/
├── runner/
│   ├── core/
│   ├── assertions/
│   ├── extractors/
│   ├── cleanup/
│   └── README.md
├── examples/
│   ├── openapi/
│   ├── excel-testcases/
│   ├── testcase-dsl/
│   └── reports/
├── deploy/
│   ├── docker-compose.yml
│   ├── k8s/
│   └── env.example
└── scripts/
    ├── init_db.sh
    ├── run_backend.sh
    ├── run_frontend.sh
    └── run_worker.sh
```

---

## 11. 推荐技术栈

实际技术栈可根据团队情况调整。

### 后端

可选：

- Python FastAPI。
- Java Spring Boot。
- Go。

如果 AI Agent 和测试执行能力占比较高，推荐核心 AI / Runner 部分优先使用 Python 实现。

### 前端

可选：

- React。
- Vue。
- Ant Design。
- Element Plus。

### 数据与基础设施

建议：

- PostgreSQL：保存结构化业务数据。
- Redis：任务状态、缓存、分布式锁。
- MinIO / S3：保存原始文档、OpenAPI 文件、执行日志、报告附件。
- OpenSearch / Elasticsearch：日志检索和全文搜索。
- Docker / Kubernetes：部署和弹性执行。

### 测试执行

可选：

- 自研 API Runner。
- pytest + requests。
- Robot Framework。
- Newman / Postman Collection。

建议优先抽象平台内部测试 DSL，再由通用 Runner 执行。

---

## 12. 环境变量示例

```bash
# 服务配置
APP_NAME=storage-api-ai-test-platform
APP_ENV=dev
APP_HOST=0.0.0.0
APP_PORT=8080

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/storage_api_test

# Redis
REDIS_URL=redis://localhost:6379/0

# 对象存储
OBJECT_STORAGE_ENDPOINT=http://localhost:9000
OBJECT_STORAGE_BUCKET=storage-api-test-platform
OBJECT_STORAGE_ACCESS_KEY=minio
OBJECT_STORAGE_SECRET_KEY=minio_password

# Secret 加密
SECRET_ENCRYPTION_KEY=please_change_me

# Agent 配置
AGENT_WORKER_CONCURRENCY=4
AGENT_TASK_TIMEOUT_SECONDS=1800

# Runner 配置
RUNNER_MAX_CONCURRENCY=8
RUNNER_DEFAULT_TIMEOUT_SECONDS=60
RUNNER_ENABLE_DANGEROUS_CASES=false
```

---

## 13. 快速启动

当前 README 描述的是平台目标架构和建议工程结构。实际启动方式应以项目实现为准。

推荐本地开发启动方式如下：

```bash
# 1. 克隆项目
git clone <repository-url>
cd storage-api-ai-test-platform

# 2. 准备环境变量
cp deploy/env.example .env

# 3. 启动依赖服务
cd deploy
docker compose up -d

# 4. 初始化数据库
cd ..
bash scripts/init_db.sh

# 5. 启动后端服务
bash scripts/run_backend.sh

# 6. 启动前端服务
bash scripts/run_frontend.sh

# 7. 启动Agent Worker
bash scripts/run_worker.sh
```

---

## 14. 核心数据表建议

| 表名                  | 说明                 |
| --------------------- | -------------------- |
| api_project           | API 项目             |
| api_raw_document      | 原始 API 文档        |
| api_spec_version      | 标准 API 文档版本    |
| api_endpoint          | API 接口             |
| api_schema            | API Schema           |
| test_collection       | 测试集               |
| test_case             | 测试用例             |
| test_case_step        | 测试用例步骤         |
| test_strategy         | 测试策略             |
| test_strategy_case    | 策略与用例关系       |
| test_environment      | 测试环境             |
| test_task             | 测试任务             |
| test_task_case_result | 用例执行结果         |
| test_task_step_result | 步骤执行结果         |
| test_artifact         | 测试附件、日志、报告 |
| agent_job             | Agent 任务           |
| agent_job_result      | Agent 执行结果       |
| review_record         | 审核记录             |
| audit_log             | 审计日志             |
| secret_config         | 加密配置             |
| variable_config       | 变量配置             |

---

## 15. 状态流转

### 15.1 API 文档状态

```text
DRAFT
UPLOADED
PARSING
PARSED
REVIEWING
APPROVED
PUBLISHED
REJECTED
DEPRECATED
```

### 15.2 测试用例状态

```text
DRAFT
IMPORTED
AI_GENERATED
REVIEWING
APPROVED
AUTOMATED
DISABLED
DEPRECATED
```

### 15.3 测试任务状态

```text
CREATED
QUEUED
PRE_CHECKING
RUNNING
PAUSED
COMPLETED
FAILED
CANCELLED
TIMEOUT
```

### 15.4 用例执行结果

```text
PASSED
FAILED
SKIPPED
BLOCKED
ERROR
```

---

## 16. 测试报告内容

测试报告建议包含：

- 测试任务基本信息。
- 测试环境信息。
- 测试集版本。
- 测试策略。
- 执行用例范围。
- 总用例数。
- 通过数。
- 失败数。
- 跳过数。
- 阻塞数。
- 通过率。
- 失败用例列表。
- 失败原因分类。
- 接口覆盖率。
- 高危接口执行情况。
- 慢接口排行。
- 请求和响应摘要。
- AI 初判结论。
- 原始日志附件。

---

## 已实现（当前仓库）

- 五字段用例管理（前后端）。【已实现】
- Agent 配置页面与后端配置接口。【已实现】
- 暂不支持执行用例。【已实现（当前限制）】

---

## TODO（后续演进）

- 测试任务调度与执行。【TODO】
- Runner 集成。【TODO】
- 执行日志、报告、失败分析闭环。【TODO】

---

## 17. MVP 范围

第一阶段建议先完成最小可用闭环。

MVP 功能包括：

1. API 项目管理。【TODO】
2. 原始 API 文档上传。【TODO】
3. OpenAPI / Swagger JSON 导入。【TODO】
4. AI 解析 API 文档并生成标准 OpenAPI JSON。【TODO】
5. 人工审核标准 API 文档。【TODO】
6. 发布测试集。【TODO】
7. Excel 测试用例导入。【TODO】
8. 用例与 API 关联（五字段用例管理，前后端）。【已实现】
9. 测试环境管理。【TODO】
10. 手动选择用例执行。【TODO（当前暂不支持执行用例）】
11. API Runner 执行测试。【TODO】
12. 保存任务级、用例级、步骤级结果。【TODO】
13. 查看测试报告。【TODO】
14. 基础 AI 失败分析。【TODO】
15. Agent 配置页面与后端配置接口。【已实现】

---

## 18. 后续路线图

### 阶段一：测试闭环

- 文档导入。【TODO】
- OpenAPI 标准化。【TODO】
- 测试集发布。【TODO】
- Excel 用例导入。【TODO】
- API Runner 执行（含 Runner 集成）。【TODO】
- 测试任务调度与执行。【TODO】
- 测试结果回传（含执行日志沉淀）。【TODO】
- 基础报告与失败分析闭环。【TODO】

### 阶段二：AI 增强

- AI 生成测试用例。【TODO】
- AI 补全断言。【TODO】
- AI 分析失败原因（闭环能力增强）。【TODO】
- API 文档版本差异分析。【TODO】
- 变更影响用例推荐。【TODO】
- 测试策略推荐。【TODO】

### 阶段三：平台化治理

- 高危接口审批。
- 测试资源生命周期管理。
- 多环境并发执行。
- 权限与审计完善。
- 质量看板。
- 历史趋势分析。

### 阶段四：高级智能化

- 基于历史缺陷生成回归用例。
- 基于接口日志反推测试场景。
- 用例自动修复建议。
- 多设备、多版本兼容性矩阵测试。
- 自然语言创建测试任务。

---

## 19. 设计原则

1. **以测试集为核心**  
   API 文档、测试用例、测试策略、执行任务和测试结果都围绕测试集组织。

2. **AI 输出必须可审核**  
   AI Agent 生成的 API 文档、测试用例、自动化代码和失败分析结论，应经过人工审核或规则校验后生效。

3. **Excel 只是导入来源，不是内部执行模型**  
   平台内部应使用结构化 JSON / DSL 保存用例。

4. **测试结果必须可追溯**  
   每次执行需要锁定测试集版本、用例版本、环境版本和执行参数。

5. **高危接口必须受控**  
   涉及删除、格式化、重启、清空等操作的 API 必须经过权限控制和环境保护。

6. **测试数据必须可清理**  
   自动化执行过程中创建的资源必须可追踪、可清理、可审计。

7. **通用 Runner 优先，脚本扩展补充**  
   常规 API 测试通过 DSL + 通用 Runner 执行，复杂场景再使用脚本沙箱。

---

## 20. License

待定。

---

## 21. 维护者

待补充。
