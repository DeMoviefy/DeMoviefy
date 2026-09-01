# Guia de Organização de Código e Documentação - DeMoviefy

## Visão Geral

Este guia fornece a estrutura completa para organizar e documentar o código do DeMoviefy, seguindo uma arquitetura em camadas baseada no padrão MVC e nas melhores práticas de clean code.

---

## Arquitetura do Backend (Python/Flask)

O backend segue um fluxo unidirecional rigoroso para garantir a separação de responsabilidades:
**Routes** (Rotas) $\rightarrow$ **Controllers** (Controladores) $\rightarrow$ **Services** (Serviços) $\rightarrow$ **Repositories** (Repositórios) $\rightarrow$ **Models** (Modelos)

### 1. Camada de Rotas (`app/routes/`)
**Propósito**: Definir os endpoints da API e mapeá-los para as funções dos controladores.
- **Responsabilidades**: Definições de URL, atribuição de métodos HTTP, organização de Blueprints.
- **Restrição**: Sem lógica de negócio ou processamento de requisições. Apenas mapeamento.

### 2. Camada de Controladores (`app/controllers/`)
**Propósito**: Manipulação de requisições HTTP e formatação de respostas.
- **Responsabilidades**: 
    - Extração de dados do `request`.
    - Validação básica de entrada (utilizando `app/validators`).
    - Chamada do **Service** apropriado.
    - Formatação da resposta JSON final (utilizando `app/dtos`).
- **Restrição**: Sem acesso direto ao banco de dados. Sem lógica de negócio complexa.

**Modelo de Arquivo**:
```python
"""
[NAME] CONTROLLER
-----------------
Controller layer for HTTP [resource] endpoints.
Handles request validation, service calls, and responses.
Part of the MVC pattern (Model-View-Controller).

This module manages the following operations:
- POST /[resource]: Create
- GET /[resource]: List/Retrieve
- PUT /[resource]/<id>: Update
- DELETE /[resource]/<id>: Delete
"""

from flask import request, jsonify
from app.services import [service_name]
from app.core.decorators import require_auth

@require_auth
def create_resource():
    """
    Create a new resource.

    Request Body:
        field1 (str): Required field description
        field2 (int): Optional field description

    Returns:
        200: {success: true, data: {...}}
        400: {error: "Validation error message"}
        401: {error: "Unauthorized"}
    """
    try:
        # Validate request format
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        # Validate inputs
        field1 = data.get("field1", "").strip()
        if not field1:
            return jsonify({"error": "field1 is required"}), 400

        # Call service
        result = [service_name].create(field1=field1)

        # Return response
        return jsonify({
            "success": True,
            "data": result
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500
```

### 3. Camada de Serviços (`app/services/`)
**Propósito**: Lógica de negócio, validação e orquestração.
- **Responsabilidades**: 
    - Implementação de regras de negócio.
    - Validação de entrada (nível de domínio).
    - Chamada de múltiplos repositórios.
    - Cálculos/agregações complexas.
    - Integração com APIs externas ou modelos de IA.
- **Restrição**: Sem dependências de HTTP (`request`, `jsonify` NÃO devem ser usados aqui).

**Modelo de Arquivo**:
```python
"""
[SERVICE_NAME] SERVICE
----------------------
Service layer for [feature] business logic.
Handles validation, orchestration, and complex operations.
Part of the MVC pattern (Model-View-Controller).

Key Responsibilities:
- Business logic implementation
- Input validation
- Calling multiple repositories
- Complex calculations/aggregations
- Error handling
"""

from app.repositories import video_repository
from app.models.video import Video

def [operation_name](*, param1: str, param2: int) -> dict:
    """
    Brief description of operation.

    Detailed explanation of what this does, including:
    - Pre-conditions
    - Side effects
    - Error scenarios

    Args:
        param1 (str): Description
        param2 (int): Description

    Returns:
        dict: Description of return structure

    Raises:
        ValueError: When validation fails
        RuntimeError: When operation fails
    """
    # Validation
    if not param1:
        raise ValueError("param1 cannot be empty")

    # Business logic
    video = video_repository.get_video(param2)
    if not video:
        raise ValueError(f"Video {param2} not found")

    # Process
    result = {
        "success": True,
        "data": video.to_dict()
    }

    return result
```

### 4. Camada de Repositórios (`app/repositories/`)
**Propósito**: Manipular todas as operações de CRUD do banco de dados.
- **Responsabilidades**: 
    - Consultas puras de SQLAlchemy.
    - Gerenciamento de sessões do banco de dados.
    - Retorno de instâncias de modelos.
- **Restrição**: Sem lógica de negócio aqui.

**Modelo de Arquivo**:
```python
"""
[NAME] REPOSITORY
-----------------
Repository layer for [Model] CRUD operations.
Handles all database interactions.
Part of the MVC pattern (Model-View-Controller).
"""

from app import db
from app.models.model_name import ModelName

def create_[name](*, **kwargs) -> ModelName:
    """
    Create a new [name] record.

    Args:
        **kwargs: Field values for the new record

    Returns:
        ModelName: The newly created object with assigned ID

    Raises:
        SQLAlchemy exceptions if database operation fails
    """
    obj = ModelName(**kwargs)
    db.session.add(obj)
    db.session.commit()
    return obj

def get_[name](id: int) -> ModelName | None:
    """Retrieve a single record by ID."""
    return db.session.get(ModelName, id)

def list_[names]() -> list[ModelName]:
    """Retrieve all records."""
    return ModelName.query.all()

def update_[name](obj: ModelName, **kwargs) -> ModelName:
    """Update specific fields of a record."""
    for key, value in kwargs.items():
        if hasattr(obj, key):
            setattr(obj, key, value)
    db.session.commit()
    return obj

def delete_[name](obj: ModelName) -> None:
    """Delete a record from the database."""
    db.session.delete(obj)
    db.session.commit()
```

### 5. Camada de Modelos (`app/models/`)
**Propósito**: Definir entidades e estruturas de dados do banco de dados.

**Modelo de Arquivo**:
```python
"""
[MODEL_NAME] MODEL
------------------
Brief description of the model's purpose.
Part of the MVC pattern (Model-View-Controller).
"""

from datetime import datetime
from app import db

class VideoModel(db.Model):
    """
    [Model Name] - SQLAlchemy ORM Model

    Detailed description of the model's responsibilities
    and how it relates to other entities.

    Attributes:
        field_name (type): Description
    """
    __tablename__ = "table_name"

    # Relationship to other models
    id = db.Column(db.Integer, primary_key=True)

    def to_dict(self) -> dict:
        """Convert model to dictionary for API responses."""
        return {}
```

---

## Camadas de Suporte

### DTOs (`app/dtos/`)
**Propósito**: Objetos de Transferência de Dados (Data Transfer Objects) usados para desacoplar Modelos do Banco de Dados de Respostas da API.
- **Responsabilidades**: Moldar os dados brutos do modelo nos formatos específicos exigidos pelo frontend.
- **Benefício**: Evita a exposição da estrutura interna do banco de dados ao cliente e permite o versionamento de respostas da API independentemente do esquema do banco.

### Validadores (`app/validators/`)
**Propósito**: Lógica para garantir que os dados de requisição recebidos estejam sintática e semanticamente corretos.
- **Responsabilidades**: Verificação de tipos, validação por regex, verificação de campos obrigatórios.
- **Uso**: Tipicamente chamados no Controlador antes de passar os dados para o Serviço.

### Utils (`app/utils/`)
**Propósito**: Funções auxiliares genéricas e preocupações transversais (cross-cutting concerns).
- **Responsabilidades**: Operações de sistema de arquivos, manipulações de strings, cálculos comuns e decoradores.
- **Restrição**: Devem ser sem estado (stateless) e não ter dependências de camadas de alto nível (Controllers/Services).

---

## Matriz de Decisão: Service vs. Repository

| Pergunta | Repository | Service |
| :--- | :---: | :---: |
| Envolve uma consulta SQL ou chamada ao banco? | ✅ | ❌ |
| Implementa uma regra de negócio ou KPI? | ❌ | ✅ |
| Chama um modelo de IA ou API externa? | ❌ | ✅ |
| Filtra/ordena registros brutos do banco? | ✅ | ❌ |
| Coordena múltiplos repositórios? | ❌ | ✅ |
| A lógica deve ser agnóstica ao banco de dados? | ❌ | ✅ |

---

## Formato Padrão de Erro

Para garantir que o frontend possa tratar erros de forma consistente, todos os controladores devem retornar erros no seguinte formato:

**Erro Simples**:
```json
{ "error": "Mensagem de erro amigável para o usuário" }
```

**Erro Detalhado**:
```json
{ 
  "error": "Falha na validação", 
  "details": { "field_name": "Este campo é obrigatório" } 
}
```

---

## Arquitetura do Frontend (React/TypeScript)

### 1. Serviços (`src/services/`)
**Propósito**: Comunicação com API e integrações de serviços externos.

**Modelo de Arquivo**:
```typescript
/**
 * API Service for [Feature]
 *
 * Handles HTTP communication with backend endpoints.
 * Defines TypeScript interfaces for type safety.
 *
 * API Base: http://127.0.0.1:5000
 */

import axios, { AxiosError } from "axios";

export interface [EntityName] {
  id: string;
  name: string;
  // ... other fields
}

export interface [OperationRequest] {
  field1: string;
  field2?: number;
}

export interface [OperationResponse] {
  success: boolean;
  data?: [EntityName];
  error?: string;
}

/**
 * Service class for [Entity] operations
 */
export class [EntityService] {
  private static readonly API_BASE = "http://127.0.0.1:5000";

  /**
   * Fetch all [entities]
   *
   * @returns Promise with array of entities
   * @throws Error if request fails
   */
  static async fetchAll(): Promise<[EntityName][]> {
    try {
      const response = await axios.get<[EntityName][]>(
        `${this.API_BASE}/[entities]`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching entities:", error);
      throw error;
    }
  }

  /**
   * Create new [entity]
   *
   * @param payload - Request data
   * @returns Promise with created entity
   */
  static async create(payload: [OperationRequest]): Promise<[EntityName]> {
    const response = await axios.post<[OperationResponse]>(
      `${this.API_BASE}/[entities]`,
      payload,
      { withCredentials: true }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Operation failed");
    }

    return response.data.data!;
  }
}
```

### 2. Componentes (`src/components/`)
**Propósito**: Blocos de construção de interface (UI) reutilizáveis.

**Modelo de Arquivo**:
````typescript
/**
 * [ComponentName] Component
 *
 * Description of component's purpose and usage.
 *
 * @example
 * ```tsx
 * <ComponentName prop1="value" onEvent={handler} />
 * ```
 */

import React from "react";

interface ComponentProps {
  /** Description of prop1 */
  prop1: string;

  /** Optional description */
  prop2?: number;

  /** Callback when event occurs */
  onEvent?: (data: any) => void;
}

export const ComponentName: React.FC<ComponentProps> = ({
  prop1,
  prop2,
  onEvent,
}) => {
  // Component logic

  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
};
````

### 3. Páginas (`src/pages/`)
**Propósito**: Componentes de nível de rota.

**Padrão Chave**:
```typescript
/**
 * [PageName] Page
 *
 * Main page component for [feature].
 * Manages page-level state and orchestrates sub-components.
 */

export const [PageName]: React.FC = () => {
  const [state, setState] = useState<State>("initial");

  useEffect(() => {
    // Initialization
  }, []);

  return (
    <MainLayout>
      {/* Page content */}
    </MainLayout>
  );
};
```

### 4. Tipos (`src/features/[feature]/types.ts`)
**Propósito**: Interfaces TypeScript específicas de cada funcionalidade (feature).

```typescript
/**
 * Type definitions for [Feature]
 *
 * Centralized location for all interfaces and types
 * used in the [feature] feature.
 */

export interface EntityRecord {
  id: string;
  name: string;
  // ... fields
}

export interface OperationState {
  loading: boolean;
  error?: string;
  // ... state fields
}
```

### 5. Estilização (`src/styles/global.css`)
**Propósito**: Estilos globais com variáveis CSS.

**Estrutura**:
```css
/* ============================================================================
   SECTION NAME
   ============================================================================ */

/* Subsection - Specific Components */

.component-class {
  /* Base styles */
}

.component-class:hover {
  /* Interactive states */
}

/* Responsive */
@media (max-width: 768px) {
  .component-class {
    /* Mobile styles */
  }
}
```

---

## Melhores Práticas de Documentação

### 1. Padrões de Docstrings

**Python (Backend)**:
```python
def function_name(param1: str, param2: int) -> dict:
    """
    Short one-line description.

    Longer explanation of what the function does,
    including any important details about behavior
    or side effects.

    Args:
        param1 (str): Description of first parameter
        param2 (int): Description of second parameter

    Returns:
        dict: Description of returned value structure

    Raises:
        ValueError: When param1 is invalid
        RuntimeError: When operation fails

    Example:
        >>> result = function_name("test", 42)
        >>> result["success"]
        True
    """
```

**TypeScript (Frontend)**:
````typescript
/**
 * Function description
 *
 * @param param1 - Description
 * @param param2 - Description
 * @returns Description of return value
 * @throws Error if something fails
 *
 * @example
 * ```ts
 * const result = await function(param1, param2);
 * ```
 */
export async function functionName(
  param1: string,
  param2: number,
): Promise<Result> {
  // Implementation
}
````

### 2. Comentários de Código
- Use `#` (Python) ou `//` (TypeScript) para comentários em linha.
- Comente o "porquê", não o "o quê".
- Use separadores de seção para organização.
- Mantenha os comentários atualizados com as mudanças no código.

### 3. Arquivos README
Cada componente principal deve ter um README contendo:
- Visão Geral e Responsabilidades.
- Estrutura de Arquivos.
- Exemplos de Uso.
- Instruções de Teste.
- Dependências.

---

## Checklist de Qualidade

### Backend
- [ ] **Arquitetura**: O fluxo Routes $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Repository $\rightarrow$ Model é estritamente respeitado.
- [ ] **Desacoplamento**: Controladores utilizam **DTOs** para respostas, nunca instâncias brutas de Model.
- [ ] **Isolamento**: Sem chamadas de `flask.request` ou `jsonify` dentro de Services ou Repositories.
- [ ] **Validação**: A validação de entrada é tratada em `app/validators` e chamada pelo Controlador.
- [ ] **Banco de Dados**: Toda a lógica de SQL/ORM está confinada aos **Repositories**.
- [ ] **Padronização**: Todas as respostas de erro seguem o **Formato Padrão de Erro**.
- [ ] **Documentação**: Todas as funções possuem type hints e docstrings abrangentes.
- [ ] **Config**: Sem valores fixos no código (hardcoded), utilize `app/config`.

### Frontend
- [ ] Todos os componentes possuem comentários JSDoc.
- [ ] Todas as props estão documentadas.
- [ ] Interfaces TypeScript estão definidas para todas as respostas de API.
- [ ] O tratamento de erros está implementado e fornece feedback ao usuário.
- [ ] Estados de carregamento (loading) são exibidos durante operações assíncronas.
- [ ] Design responsivo foi testado.

### Geral
- [ ] Organização de arquivos clara.
- [ ] Nomes de variáveis significativos.
- [ ] Sem código morto ou comentado.
- [ ] Estilo de código consistente.
- [ ] Mensagens de commit claras.
- [ ] Documentação README presente para módulos principais.

---

## Próximos Passos

1. ✅ Adicionar docstrings a todas as funções do backend.
2. ✅ Adicionar comentários JSDoc a todos os componentes do frontend.
3. ✅ Criar arquivos README para módulos principais.
4. ✅ Organizar CSS com comentários de seção claros.
5. ⏳ Adicionar testes unitários com documentação clara.
6. ⏳ Criar documentação de API (Swagger/OpenAPI).
7. ⏳ Adicionar documentação de migração de banco de dados.

---

## Referências

- [Python Docstring Convention (PEP 257)](https://www.python.org/dev/peps/pep-0257/)
- [JSDoc Reference](https://jsdoc.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [MVC Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
