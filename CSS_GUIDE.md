# 📋 Guia de Estilos CSS - Sistema de Táxis

## 📁 Estrutura de Arquivos CSS

```
src/styles/
├── variables.css          # Variáveis de cores, espaçamento, tipografia
├── globals.css            # Reset e estilos globais
├── components.css         # Componentes: botões, inputs, cards, alerts
├── layout.css             # Layout: header, sidebar, grid, sections
├── responsive.css         # Media queries e responsividade
└── pages/
    ├── login.css          # Página de login
    └── dashboard.css      # Dashboard manager e driver
```

## 🎨 Sistema de Cores (Tema Dark)

```css
--bg-dark: #070707              /* Fundo principal */
--bg-gradient: gradient dark    /* Gradiente de fundo */
--panel: #101010                /* Painéis e headers */
--card: #151515                 /* Cards e containers */
--text-primary: #e9e9e9         /* Texto principal */
--text-secondary: #bfbfbf       /* Texto secundário */
--text-muted: #808080           /* Texto desabilitado */

/* Status */
--status-concluida: #10b981     /* Verde */
--status-atribuido: #3b82f6     /* Azul */
--status-pendente: #f59e0b      /* Amarelo */
--status-cancelada: #ef4444     /* Vermelho */
```

## 📏 Espaçamento

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
```

## 🔵 Classes Principais

### Botões
```jsx
<button className="btn">Botão Default</button>
<button className="btn btn-primary">Primário</button>
<button className="btn btn-success">Sucesso</button>
<button className="btn btn-danger">Perigo</button>
<button className="btn btn-warning">Aviso</button>
<button className="btn btn-info">Info</button>
<button className="btn btn-sm">Pequeno</button>
<button className="btn btn-lg">Grande</button>
<button className="btn btn-block">Bloco (100%)</button>
```

### Inputs
```jsx
<div className="form-group">
  <label className="form-label">LABEL</label>
  <input className="form-control" type="text" />
</div>

<div className="form-group">
  <label className="form-label">SELECT</label>
  <select className="form-select">
    <option>Opção</option>
  </select>
</div>
```

### Cards
```jsx
<div className="card">
  <div className="card-header">Título</div>
  <div className="card-body">Conteúdo</div>
  <div className="card-footer">Rodapé</div>
</div>
```

### Alerts
```jsx
<div className="alert alert-success">Sucesso!</div>
<div className="alert alert-error">Erro!</div>
<div className="alert alert-warning">Aviso!</div>
<div className="alert alert-info">Informação!</div>
```

### Badges
```jsx
<span className="badge badge-success">Concluída</span>
<span className="badge badge-info">Atribuída</span>
<span className="badge badge-warning">Pendente</span>
<span className="badge badge-danger">Cancelada</span>
```

### Tabelas
```jsx
<div className="table-responsive">
  <table className="table">
    <thead>
      <tr><th>Coluna</th></tr>
    </thead>
    <tbody>
      <tr><td>Dado</td></tr>
    </tbody>
  </table>
</div>
```

## 🎯 Grid e Flexbox

```jsx
<div className="row">
  <div className="col">Coluna 1</div>
  <div className="col">Coluna 2</div>
</div>

<div className="d-flex gap-3">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div className="grid grid-3">
  <div>Grid Item 1</div>
  <div>Grid Item 2</div>
</div>
```

## 📱 Responsividade

Classes responsive incluídas automaticamente:
- **Desktop**: layout completo (> 1024px)
- **Tablet**: 2 colunas (768px - 1024px)
- **Mobile**: 1 coluna (< 768px)
- **Mobile Pequeno**: ajustes (< 480px)

Media queries já estão em `responsive.css`.

## 🔧 Como Usar no Componente

### Importar CSS
```jsx
// No topo do componente
import '../styles/pages/dashboard.css'
```

### Estrutura Básica do Dashboard
```jsx
export const MyDashboard = () => {
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <h1 className="dashboard-sidebar-brand">LOGO</h1>
        </div>
        <ul className="dashboard-sidebar-menu">
          <li className="dashboard-sidebar-menu-item active">Item 1</li>
        </ul>
      </div>

      {/* Main */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h2 className="dashboard-header-title">Painel</h2>
          <div className="dashboard-header-actions">
            <button className="btn btn-primary">Ação</button>
          </div>
        </div>

        <div className="dashboard-body">
          {/* Stats */}
          <div className="stats-container">
            <div className="stat">
              <div className="stat-label">Total</div>
              <div className="stat-value">42</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="dashboard-tabs">
            <button className="dashboard-tab active">Aba 1</button>
            <button className="dashboard-tab">Aba 2</button>
          </div>

          {/* Conteúdo */}
          <div className="dashboard-tab-content active">
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                {/* ... */}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## ⚡ Utilitários Rápidos

```jsx
// Margin e Padding
<div className="mb-3 mt-4 py-4">Espaçamento</div>

// Flex
<div className="d-flex justify-content-center align-items-center gap-2">Flex</div>

// Tamanho
<div className="w-100 h-100">100% x 100%</div>

// Texto
<div className="text-center text-muted fw-bold">Texto</div>

// Opacity
<div className="opacity-50">50% opaco</div>
```

## 📝 Notas Importantes

1. **Remover Bootstrap**: As classes do Bootstrap foram removidas dos componentes
2. **Sem Inline Styles**: Usar classes CSS em vez de `style={{ }}`
3. **Variáveis CSS**: Use `var(--color-info)` em vez de hardcode
4. **Ordem de Imports**: CSS importado em `main.jsx` na ordem correta
5. **Mobile First**: Sempre design pensando em mobile primeiro

## 🚀 Próximos Passos

- [ ] Refatorar `ManagerDashboard.jsx` com novas classes
- [ ] Refatorar `DriverDashboard.jsx` com novas classes
- [ ] Remover dependência do React Bootstrap
- [ ] Testar responsividade em diferentes telas
- [ ] Corrigir bugs de funcionalidade (email, atribuição, clientes)

---

**Data da Documentação**: 2025-11-12
**Versão**: 1.0
**Tema**: Dark Mode
**Status**: Pronto para usar
