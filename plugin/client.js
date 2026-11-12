window.__ModuleLoader__.load({
  id: 'dsh-tripo-support',
  factory(require) {
    const React = require('react');
    const ReactDOM = (() => { try { return require('react-dom'); } catch { return null; } })();
    const h = React.createElement;
    const API = '/plugins/dsh-tripo-support';

    const CSS = `
.dsh-3d-settings{display:grid;gap:18px;color:var(--dsw-alias-label-primary,#1f2328);font-size:13px}
.dsh-3d-head{display:grid;gap:4px}
.dsh-3d-head h2{margin:0;font-size:16px;line-height:24px;font-weight:600}
.dsh-3d-muted{color:var(--dsw-alias-label-secondary,#6b7280);font-size:12.5px;line-height:18px}
.dsh-3d-tabs{display:flex;gap:4px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));padding-bottom:0}
.dsh-3d-tab{appearance:none;border:0;border-bottom:2px solid transparent;background:none;color:var(--dsw-alias-label-secondary,#6b7280);font:inherit;font-size:13px;padding:7px 10px 8px;cursor:pointer;margin-bottom:-1px}
.dsh-3d-tab:hover{color:var(--dsw-alias-label-primary,#1f2328)}
.dsh-3d-tab-active{color:var(--dsw-alias-brand-primary,#4d6bfe);border-bottom-color:var(--dsw-alias-brand-primary,#4d6bfe);font-weight:500}
.dsh-3d-list{display:grid;gap:8px}
.dsh-3d-card{border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.22));border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff);padding:12px 14px;display:grid;gap:10px}
.dsh-3d-row{display:flex;align-items:center;gap:8px;min-width:0}
.dsh-3d-name{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-3d-badge{display:inline-flex;align-items:center;height:19px;padding:0 6px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));border-radius:4px;color:var(--dsw-alias-label-secondary,#6b7280);font-size:11px;line-height:17px;white-space:nowrap}
.dsh-3d-dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--dsw-alias-state-idle-primary,#9ca3af)}
.dsh-3d-dot-ok{background:var(--dsw-alias-state-success-primary,#16a34a)}
.dsh-3d-spacer{flex:1}
.dsh-3d-status{font-size:11.5px;color:var(--dsw-alias-label-secondary,#6b7280)}
.dsh-3d-status-ok{color:var(--dsw-alias-state-success-primary,#16a34a)}
.dsh-3d-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary,#1f2328);font:inherit;font-size:12px;line-height:18px;padding:4px 9px;cursor:pointer;white-space:nowrap}
.dsh-3d-btn:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.07))}
.dsh-3d-btn-primary{border-color:var(--dsw-alias-label-primary,#1f2328);background:var(--dsw-alias-label-primary,#1f2328);color:var(--dsw-alias-bg-base,#fff)}
.dsh-3d-btn-primary:hover{opacity:.9}
.dsh-3d-btn:disabled{opacity:.5;cursor:default}
.dsh-3d-form{display:grid;gap:9px;padding-top:2px}
.dsh-3d-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px}
.dsh-3d-field{display:grid;gap:4px;min-width:0}
.dsh-3d-label{font-size:11.5px;color:var(--dsw-alias-label-secondary,#6b7280)}
.dsh-3d-input{box-sizing:border-box;width:100%;min-width:0;height:30px;padding:0 8px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.3));border-radius:6px;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#1f2328);font:inherit;font-size:12.5px;outline:none}
.dsh-3d-input:focus{border-color:var(--dsw-alias-brand-primary,#4d6bfe);box-shadow:0 0 0 2px var(--dsw-alias-brand-primary-soft,rgba(77,107,254,.12))}
textarea.dsh-3d-input{height:auto;min-height:52px;padding:7px 8px;resize:vertical}
.dsh-3d-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.dsh-3d-link{border:0;background:none;color:var(--dsw-alias-label-secondary,#6b7280);font:inherit;font-size:11.5px;padding:2px 0;cursor:pointer}
.dsh-3d-link:hover{color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-3d-error{color:var(--dsw-alias-state-error-primary,#cf222e);font-size:11.5px}
.dsh-3d-success{color:var(--dsw-alias-state-success-primary,#16a34a);font-size:11.5px}
.dsh-3d-empty{padding:18px 14px;border:1px dashed var(--dsw-alias-border-l1,rgba(127,127,127,.3));border-radius:10px;color:var(--dsw-alias-label-secondary,#6b7280);font-size:12.5px;text-align:center}

.dsh-3d-pill-root{position:relative;display:inline-flex;align-items:center;height:28px}
.dsh-3d-pill{display:inline-flex;align-items:center;gap:5px;height:28px;max-width:220px;padding:0 9px 0 8px;border:1px solid var(--dsw-alias-border-l2,#e5e7eb);border-radius:14px;background:var(--dsw-alias-bg-layer-3,#fff);color:var(--dsw-alias-label-secondary,#4b5563);font:inherit;font-size:13px;line-height:20px;cursor:pointer;transition:border-color .15s,background .15s,color .15s;user-select:none}
.dsh-3d-pill:hover:not(:disabled){border-color:var(--dsw-alias-label-dimmed,#9ca3af);color:var(--dsw-alias-label-primary,#111827)}
.dsh-3d-pill:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4c78ff);outline-offset:1px}
.dsh-3d-pill-open{border-color:var(--dsw-alias-brand-primary,#4c78ff);color:var(--dsw-alias-label-primary,#111827)}
.dsh-3d-pill-icon{flex:none;color:var(--dsw-alias-brand-primary,#4c78ff)}
.dsh-3d-pill-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-3d-pill-model{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary,#6b7280);font-size:12px}
.dsh-3d-pill-caret{display:inline-flex;flex:none;transition:transform .15s}
.dsh-3d-pill-caret-open{transform:rotate(180deg)}
.dsh-3d-menu{position:fixed;z-index:1000;width:280px;max-width:calc(100vw - 24px);padding:6px;border:1px solid var(--dsw-alias-border-l2,#e5e7eb);border-radius:12px;background:var(--dsw-alias-bg-layer-3,#fff);box-shadow:0 12px 32px rgba(0,0,0,.16),0 2px 8px rgba(0,0,0,.08);max-height:min(420px,calc(100vh - 48px));overflow-y:auto}
.dsh-3d-menu-title{padding:6px 8px 4px;font-size:11px;font-weight:600;color:var(--dsw-alias-label-tertiary,#6b7280)}
.dsh-3d-menu-empty{padding:8px;color:var(--dsw-alias-label-secondary,#6b7280);font-size:12px}
.dsh-3d-menu-option{display:flex;width:100%;align-items:center;gap:8px;padding:7px 8px;border:0;border-radius:8px;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.dsh-3d-menu-option:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2,#f3f4f6)}
.dsh-3d-menu-option-active{background:var(--dsw-alias-brand-primary-soft,rgba(76,120,255,.10))}
.dsh-3d-menu-option:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4c78ff);outline-offset:-2px}
.dsh-3d-menu-text{display:grid;gap:1px;min-width:0;flex:1}
.dsh-3d-menu-name{font-size:12.5px;font-weight:500;color:var(--dsw-alias-label-primary,#111827);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-3d-menu-sub{font-size:11px;color:var(--dsw-alias-label-tertiary,#6b7280);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-3d-menu-check{flex:none;color:var(--dsw-alias-brand-primary,#4c78ff)}
.dsh-3d-menu-models{padding:2px 0 4px 24px;display:grid;gap:1px}
.dsh-3d-menu-model{display:flex;width:100%;align-items:center;gap:8px;padding:5px 8px;border:0;border-radius:6px;background:none;font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary,#4b5563);text-align:left;cursor:pointer}
.dsh-3d-menu-model:hover{background:var(--dsw-alias-bg-layer-2,#f3f4f6)}
.dsh-3d-menu-model-active{color:var(--dsw-alias-brand-primary,#4c78ff)}
.dsh-3d-menu-error{margin:4px 2px;padding:6px 8px;border-radius:7px;background:rgba(239,68,68,.08);color:#ef4444;font-size:11.5px;line-height:1.4;word-break:break-all}
.dsh-3d-preview-wrap{border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.24));border-radius:10px;overflow:hidden;background:#15171c}
.dsh-3d-preview-src{padding:6px 9px;font-size:11px;color:rgba(255,255,255,.65);background:#15171c;word-break:break-all}
.dsh-3d-tool{display:grid;gap:8px;padding:2px}
.dsh-3d-tool-head{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:12px}
.dsh-3d-tool-chip{display:inline-flex;align-items:center;padding:1px 6px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.24));border-radius:4px;color:var(--dsw-alias-label-secondary,#6b7280);font-size:10.5px}
`;

    const protocolLabel = (protocol) => protocol === 'dashscope' ? 'DashScope 3D' : protocol === 'tencent' ? '混元3D' : 'Tripo v3';
    const defaultBase = (protocol) => protocol === 'tencent' ? 'https://ai3d.tencentcloudapi.com' : protocol === 'dashscope' ? 'https://cn-beijing.maas.qianwenaiapi.com/api/v1/services/aigc/video-generation/3d-generation' : 'https://openapi.tripo3d.ai/v3';

    async function api(path, body) {
      const response = await fetch(API + path, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`);
      return data;
    }

    function Field({ label, children }) {
      return h('label', { className: 'dsh-3d-field' }, h('span', { className: 'dsh-3d-label' }, label), children);
    }

    function Status({ provider }) {
      return h(React.Fragment, null,
        h('span', { className: `dsh-3d-dot${provider.configured ? ' dsh-3d-dot-ok' : ''}` }),
        h('span', { className: `dsh-3d-status${provider.configured ? ' dsh-3d-status-ok' : ''}` }, provider.configured ? '已配置' : '未配置'));
    }

    function ProviderCard({ provider, onRefresh, onNotice }) {
      const [editing, setEditing] = React.useState(false);
      const [advanced, setAdvanced] = React.useState(false);
      const [draft, setDraft] = React.useState({ baseURL: provider.baseURL, region: provider.region || 'ap-guangzhou', models: provider.models.join(', ') });
      const [key, setKey] = React.useState({ apiKey: '', secretId: '', secretKey: '', webhookSecret: '' });
      const [testing, setTesting] = React.useState('');
      React.useEffect(() => {
        setDraft({ baseURL: provider.baseURL, region: provider.region || 'ap-guangzhou', models: provider.models.join(', ') });
      }, [provider.baseURL, provider.region, provider.models]);
      const set = (patch) => setDraft({ ...draft, ...patch });
      const save = async () => {
        try {
          const hasKey = Boolean(key.apiKey || key.secretId || key.secretKey || key.webhookSecret);
          if (!hasKey && !advanced) { setEditing(false); return; }
          if (hasKey) await api('/key', { providerId: provider.id, ...key });
          if (advanced) await api('/provider/update', { providerId: provider.id, baseURL: draft.baseURL, region: draft.region, models: draft.models });
          setKey({ apiKey: '', secretId: '', secretKey: '', webhookSecret: '' });
          setEditing(false);
          setAdvanced(false);
          onNotice(`${provider.label} 已保存`);
          await onRefresh();
        } catch (error) { onNotice(`${provider.label} 保存失败：${error.message}`); }
      };
      const test = async () => {
        setTesting('测试中…');
        try { const data = await api('/test', { providerId: provider.id }); setTesting(data.result.ok ? '连接正常' : data.result.message); } catch (error) { setTesting(error.message); }
      };
      const remove = async () => {
        if (!window.confirm(`删除 ${provider.label}？`)) return;
        try { await api('/provider/delete', { providerId: provider.id }); onNotice(`${provider.label} 已删除`); await onRefresh(); } catch (error) { onNotice(error.message); }
      };
      return h('div', { className: 'dsh-3d-card' },
        h('div', { className: 'dsh-3d-row' },
          h(Status, { provider }),
          h('span', { className: 'dsh-3d-name' }, provider.label),
          h('span', { className: 'dsh-3d-badge' }, provider.custom ? '第三方' : '官方'),
          h('span', { className: 'dsh-3d-spacer' }),
          h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => setEditing(!editing) }, editing ? '取消' : '配置'),
          provider.custom ? h('button', { className: 'dsh-3d-btn', type: 'button', onClick: remove }, '删除') : null),
        editing ? h('div', { className: 'dsh-3d-form' },
          provider.protocol === 'tencent'
            ? h('div', { className: 'dsh-3d-grid' },
              h(Field, { label: 'SecretId' }, h('input', { className: 'dsh-3d-input', type: 'password', autoComplete: 'new-password', value: key.secretId, onChange: (e) => setKey({ ...key, secretId: e.target.value }), placeholder: '输入 SecretId' })),
              h(Field, { label: 'SecretKey' }, h('input', { className: 'dsh-3d-input', type: 'password', autoComplete: 'new-password', value: key.secretKey, onChange: (e) => setKey({ ...key, secretKey: e.target.value }), placeholder: '输入 SecretKey' })))
            : h(Field, { label: `${provider.custom ? 'API Key' : 'API Key'}` }, h('input', { className: 'dsh-3d-input', type: 'password', autoComplete: 'new-password', value: key.apiKey, onChange: (e) => setKey({ ...key, apiKey: e.target.value }), placeholder: '输入 API Key' })),
          h('div', { className: 'dsh-3d-actions' },
            h('button', { className: 'dsh-3d-btn dsh-3d-btn-primary', type: 'button', onClick: save }, '保存'),
            h('button', { className: 'dsh-3d-btn', type: 'button', onClick: test, disabled: !provider.configured && !key.apiKey && !key.secretId }, '测试连接'),
            testing ? h('span', { className: testing === '连接正常' ? 'dsh-3d-success' : 'dsh-3d-error' }, testing) : null),
          h('button', { className: 'dsh-3d-link', type: 'button', onClick: () => setAdvanced(!advanced) }, advanced ? '收起高级设置' : '高级设置（地址 / 模型）'),
          advanced ? h('div', { className: 'dsh-3d-grid' },
            h(Field, { label: 'Base URL' }, h('input', { className: 'dsh-3d-input', value: draft.baseURL, onChange: (e) => set({ baseURL: e.target.value }), spellCheck: false })),
            provider.protocol === 'tencent' ? h(Field, { label: 'Region' }, h('input', { className: 'dsh-3d-input', value: draft.region, onChange: (e) => set({ region: e.target.value }), spellCheck: false })) : null,
            h(Field, { label: '模型 ID（逗号分隔）' }, h('input', { className: 'dsh-3d-input', value: draft.models, onChange: (e) => set({ models: e.target.value }), spellCheck: false })),
            h(Field, { label: 'Webhook Secret（可选）' }, h('input', { className: 'dsh-3d-input', type: 'password', autoComplete: 'new-password', value: key.webhookSecret, onChange: (e) => setKey({ ...key, webhookSecret: e.target.value }), placeholder: 'whsec_…' }))) : null
        ) : null);
    }

    function AddProvider({ onRefresh, onNotice }) {
      const [open, setOpen] = React.useState(false);
      const [draft, setDraft] = React.useState({ label: '', protocol: 'tripo', baseURL: defaultBase('tripo'), models: '', apiKey: '', secretId: '', secretKey: '' });
      const set = (patch) => setDraft({ ...draft, ...patch });
      if (!open) return h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => setOpen(true) }, '添加第三方服务');
      const submit = async () => {
        try { await api('/provider', draft); onNotice(`已添加 ${draft.label || '第三方服务'}`); setOpen(false); await onRefresh(); } catch (error) { onNotice(`添加失败：${error.message}`); }
      };
      return h('div', { className: 'dsh-3d-card' },
        h('div', { className: 'dsh-3d-row' }, h('span', { className: 'dsh-3d-name' }, '添加第三方服务'), h('span', { className: 'dsh-3d-spacer' }), h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => setOpen(false) }, '取消')),
        h('div', { className: 'dsh-3d-form' },
          h('div', { className: 'dsh-3d-grid' },
            h(Field, { label: '名称' }, h('input', { className: 'dsh-3d-input', value: draft.label, onChange: (e) => set({ label: e.target.value }), placeholder: '例如 第三方 Tripo' })),
            h(Field, { label: '协议' }, h('select', { className: 'dsh-3d-input', value: draft.protocol, onChange: (e) => set({ protocol: e.target.value, baseURL: defaultBase(e.target.value) }) }, h('option', { value: 'tripo' }, 'Tripo v3'), h('option', { value: 'dashscope' }, 'DashScope 3D'), h('option', { value: 'tencent' }, '腾讯混元3D'))),
            h(Field, { label: 'Base URL' }, h('input', { className: 'dsh-3d-input', value: draft.baseURL, onChange: (e) => set({ baseURL: e.target.value }), spellCheck: false }))),
          h(Field, { label: '模型 ID（逗号分隔）' }, h('input', { className: 'dsh-3d-input', value: draft.models, onChange: (e) => set({ models: e.target.value }), placeholder: 'v3.1-20260211 或 Tripo/Tripo-H3.1' })),
          draft.protocol === 'tencent'
            ? h('div', { className: 'dsh-3d-grid' },
              h(Field, { label: 'SecretId' }, h('input', { className: 'dsh-3d-input', type: 'password', value: draft.secretId, onChange: (e) => set({ secretId: e.target.value }) })),
              h(Field, { label: 'SecretKey' }, h('input', { className: 'dsh-3d-input', type: 'password', value: draft.secretKey, onChange: (e) => set({ secretKey: e.target.value }) })))
            : h(Field, { label: 'API Key' }, h('input', { className: 'dsh-3d-input', type: 'password', value: draft.apiKey, onChange: (e) => set({ apiKey: e.target.value }) })),
          h('div', { className: 'dsh-3d-actions' }, h('button', { className: 'dsh-3d-btn dsh-3d-btn-primary', type: 'button', onClick: submit }, '添加'))));
    }

    function SettingsPage() {
      const [snapshot, setSnapshot] = React.useState(null);
      const [tab, setTab] = React.useState('official');
      const [notice, setNotice] = React.useState('');
      const refresh = React.useCallback(async () => {
        try { setSnapshot(await api('/status')); } catch (error) { setNotice(error.message); }
      }, []);
      React.useEffect(() => { refresh(); }, [refresh]);
      if (!snapshot) return h('div', { className: 'dsh-3d-settings' }, h('div', { className: 'dsh-3d-head' }, h('h2', null, '3D 生成'), h('span', { className: 'dsh-3d-muted' }, '正在加载…')));
      const providers = snapshot.providers.filter((provider) => tab === 'official' ? !provider.custom : provider.custom);
      return h('div', { className: 'dsh-3d-settings' },
        h('div', { className: 'dsh-3d-head' }, h('h2', null, '3D 生成'), h('span', { className: 'dsh-3d-muted' }, '配置 3D 服务的 API Key 与连接信息。模型选择在对话框下方的 3D 胶囊中完成。')),
        h('div', { className: 'dsh-3d-tabs', role: 'tablist' },
          h('button', { className: `dsh-3d-tab${tab === 'official' ? ' dsh-3d-tab-active' : ''}`, type: 'button', role: 'tab', 'aria-selected': tab === 'official', onClick: () => setTab('official') }, '官方渠道'),
          h('button', { className: `dsh-3d-tab${tab === 'third-party' ? ' dsh-3d-tab-active' : ''}`, type: 'button', role: 'tab', 'aria-selected': tab === 'third-party', onClick: () => setTab('third-party') }, '第三方渠道')),
        notice ? h('div', { className: notice.includes('失败') ? 'dsh-3d-error' : 'dsh-3d-success' }, notice) : null,
        h('div', { className: 'dsh-3d-list' },
          providers.length ? providers.map((provider) => h(ProviderCard, { key: provider.id, provider, onRefresh: refresh, onNotice: setNotice })) : h('div', { className: 'dsh-3d-empty' }, tab === 'official' ? '暂无官方服务' : '还没有第三方服务')),
        tab === 'third-party' ? h(AddProvider, { onRefresh: refresh, onNotice: setNotice }) : null);
    }

    function SectionIcon({ size = 16 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
        h('path', { d: 'M12 2 21 7 12 12 3 7Z' }),
        h('path', { d: 'M3 7v10l9 5 9-5V7' }),
        h('path', { d: 'M12 12v10' }));
    }

    function PillMenu({ snapshot, activeProviderId, expandedProviderId, setExpandedProviderId, onChooseProvider, onChooseModel, onClose, menuStyle, error }) {
      const providers = snapshot.providers;
      return h('div', { className: 'dsh-3d-menu', role: 'menu', style: menuStyle },
        h('div', { className: 'dsh-3d-menu-title' }, '选择 3D 模型'),
        providers.length ? providers.map((provider) => {
          const active = provider.id === activeProviderId;
          const expanded = provider.id === expandedProviderId;
          return h(React.Fragment, { key: provider.id },
            h('button', {
              type: 'button',
              role: 'menuitem',
              className: `dsh-3d-menu-option${active || expanded ? ' dsh-3d-menu-option-active' : ''}`,
              onClick: () => onChooseProvider(provider),
            },
              h('span', { className: `dsh-3d-dot${provider.configured ? ' dsh-3d-dot-ok' : ''}` }),
              h('span', { className: 'dsh-3d-menu-text' },
                h('span', { className: 'dsh-3d-menu-name' }, provider.label),
              h('span', { className: 'dsh-3d-menu-sub' }, `${provider.custom ? '第三方' : '官方'}${provider.configured ? '' : ' · 未配置密钥'}`)),
              active ? h('span', { className: 'dsh-3d-menu-check' }, '✓') : null),
            expanded && provider.models.length ? h('div', { className: 'dsh-3d-menu-models' },
              provider.models.map((model) => h('button', {
                key: model,
                type: 'button',
                role: 'menuitemradio',
                'aria-checked': active && model === (snapshot.selection?.model || provider.defaultModel),
                className: `dsh-3d-menu-model${active && model === (snapshot.selection?.model || provider.defaultModel) ? ' dsh-3d-menu-model-active' : ''}`,
                onClick: () => onChooseModel(provider, model),
              }, model, active && model === (snapshot.selection?.model || provider.defaultModel) ? ' ✓' : ''))) : null);
        }) : h('div', { className: 'dsh-3d-menu-empty' }, '还没有配置 3D 服务'),
        error ? h('div', { className: 'dsh-3d-menu-error', role: 'alert' }, error) : null);
    }

    function ModelPill() {
      const [snapshot, setSnapshot] = React.useState(null);
      const [open, setOpen] = React.useState(false);
      const [expandedProviderId, setExpandedProviderId] = React.useState('');
      const [menuStyle, setMenuStyle] = React.useState(null);
      const [error, setError] = React.useState('');
      const buttonRef = React.useRef(null);
      const reload = React.useCallback(async () => {
        try {
          const data = await api('/status');
          setSnapshot(data);
          const selected = data.selection?.providerId || data.providers.find((provider) => provider.configured)?.id || data.providers[0]?.id || '';
          setExpandedProviderId((current) => current || selected);
        } catch (e) { setError(e.message); }
      }, []);
      React.useEffect(() => { reload(); }, [reload]);
      React.useEffect(() => {
        if (!open) { setMenuStyle(null); return; }
        const place = () => {
          const rect = buttonRef.current?.getBoundingClientRect();
          if (!rect) return;
          setMenuStyle({ position: 'fixed', left: Math.max(8, Math.min(rect.left, window.innerWidth - 292)), bottom: Math.max(8, window.innerHeight - rect.top + 8), zIndex: 1000 });
        };
        place();
        const close = (event) => {
          const target = event.target;
          if (target instanceof Element && (target.closest('.dsh-3d-menu') || target.closest('.dsh-3d-pill-root'))) return;
          setOpen(false);
        };
        const key = (event) => { if (event.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', close, true);
        document.addEventListener('keydown', key, true);
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => {
          document.removeEventListener('mousedown', close, true);
          document.removeEventListener('keydown', key, true);
          window.removeEventListener('resize', place);
          window.removeEventListener('scroll', place, true);
        };
      }, [open]);
      if (!snapshot?.providers?.length) return null;
      const selected = snapshot.selection;
      const provider = snapshot.providers.find((item) => item.id === selected?.providerId) || snapshot.providers.find((item) => item.configured) || snapshot.providers[0];
      const model = selected?.providerId === provider.id ? selected.model : (provider.defaultModel || provider.models[0] || '');
      const chooseProvider = async (next) => {
        setError('');
        setExpandedProviderId(next.id);
        if (next.id === selected?.providerId) return;
        try {
          const data = await api('/selection', { providerId: next.id, model: next.defaultModel || next.models[0] || '' });
          setSnapshot((current) => ({ ...current, selection: data.selection }));
        } catch (e) { setError(e.message); }
      };
      const chooseModel = async (next, nextModel) => {
        setError('');
        try {
          const data = await api('/selection', { providerId: next.id, model: nextModel });
          setSnapshot((current) => ({ ...current, selection: data.selection }));
          setOpen(false);
        } catch (e) { setError(e.message); }
      };
      const menu = open && menuStyle ? h(PillMenu, { snapshot, activeProviderId: provider.id, expandedProviderId, setExpandedProviderId, onChooseProvider: chooseProvider, onChooseModel: chooseModel, onClose: () => setOpen(false), menuStyle, error }) : null;
      return h('div', { className: 'dsh-3d-pill-root' },
        h('button', {
          ref: buttonRef,
          type: 'button',
          className: `dsh-3d-pill${open ? ' dsh-3d-pill-open' : ''}`,
          title: '选择 3D 生成模型',
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          onClick: () => { setError(''); setOpen(!open); },
        },
          h('svg', { className: 'dsh-3d-pill-icon', width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
            h('path', { d: 'M12 2 21 7 12 12 3 7Z' }), h('path', { d: 'M3 7v10l9 5 9-5V7' }), h('path', { d: 'M12 12v10' })),
          h('span', { className: 'dsh-3d-pill-label' }, `3D · ${provider.label}`),
          model ? h('span', { className: 'dsh-3d-pill-model' }, model) : null,
          h('span', { className: `dsh-3d-pill-caret${open ? ' dsh-3d-pill-caret-open' : ''}` }, h('svg', { width: 10, height: 10, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M4 10l4-4 4 4' })))),
        menu ? (ReactDOM?.createPortal ? ReactDOM.createPortal(menu, document.body) : menu) : null);
    }

    function useModelViewer() {
      React.useEffect(() => {
        if (customElements.get('model-viewer')) return;
        if (document.querySelector('script[data-dsh-3d-viewer]')) return;
        const script = document.createElement('script');
        script.type = 'module';
        script.src = `${API}/model-viewer.js`;
        script.dataset.dsh3dViewer = '1';
        document.head.appendChild(script);
      }, []);
    }

    function ModelPreview({ src, height = 320, mediaType }) {
      useModelViewer();
      if (!src) return null;
      if (String(mediaType || '').startsWith('image/')) {
        return h('div', { className: 'dsh-3d-preview-wrap' }, h('img', { src, style: { width: '100%', maxHeight: `${height}px`, objectFit: 'contain', display: 'block' } }));
      }
      return h('div', { className: 'dsh-3d-preview-wrap' },
        h('model-viewer', { src, loading: 'eager', reveal: 'auto', 'camera-controls': true, 'auto-rotate': true, 'interaction-prompt': 'none', 'shadow-intensity': '1.1', exposure: '1.05', style: { width: '100%', height: `${height}px`, display: 'block' } }),
        h('div', { className: 'dsh-3d-preview-src' }, src));
    }

    function readResult(block) {
      const queue = [block];
      const seen = new Set();
      while (queue.length) {
        const value = queue.shift();
        if (!value || typeof value !== 'object' || seen.has(value)) continue;
        seen.add(value);
        if (value.previewUrl || value.taskId || value.localFile) return value;
        for (const key of ['result', 'value', 'content', 'meta', 'data', 'output']) if (value[key]) queue.push(value[key]);
      }
      return null;
    }

    function ToolPreview(props) {
      const [result, setResult] = React.useState(() => readResult(props.block));
      const [status, setStatus] = React.useState(result?.status || '');
      const [preview, setPreview] = React.useState(result?.previewUrl || '');
      React.useEffect(() => {
        const next = readResult(props.block);
        if (next) { setResult(next); setStatus(next.status || ''); setPreview(next.previewUrl || ''); }
      }, [props.block]);
      React.useEffect(() => {
        if (!result?.taskId || !result?.provider || ['success', 'failed', 'cancelled'].includes(status)) return;
        let cancelled = false;
        const timer = setInterval(async () => {
          try {
            const data = await api(`/task?provider=${encodeURIComponent(result.provider)}&taskId=${encodeURIComponent(result.taskId)}&operation=${encodeURIComponent(result.operation || '')}`);
            if (cancelled) return;
            setStatus(data.result.status);
            if (data.result.previewUrl) setPreview(data.result.previewUrl);
            if (['success', 'failed', 'cancelled', 'unknown'].includes(data.result.status)) clearInterval(timer);
          } catch { /* keep polling */ }
        }, 2500);
        return () => { cancelled = true; clearInterval(timer); };
      }, [result?.taskId, result?.provider, result?.operation, status]);
      if (!result) return h('div', { className: 'dsh-3d-muted' }, props.phase === 'result' ? '3D 任务已返回' : '3D 任务准备中…');
      return h('div', { className: 'dsh-3d-tool' },
        h('div', { className: 'dsh-3d-tool-head' },
          h('strong', null, result.providerLabel || result.provider || '3D'),
          h('span', { className: 'dsh-3d-tool-chip' }, result.operation || ''),
          h('span', { className: 'dsh-3d-tool-chip' }, status || result.status || ''),
          result.taskId ? h('span', { className: 'dsh-3d-muted' }, result.taskId) : null),
        preview ? h(ModelPreview, { src: preview, height: 320, mediaType: result.mediaType }) : h('div', { className: 'dsh-3d-muted' }, '任务完成后会在这里显示 3D 预览。'),
        result.localFile ? h('div', { className: 'dsh-3d-muted', style: { wordBreak: 'break-all' } }, result.localFile) : null);
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          const style = document.createElement('style');
          style.dataset.plugin = 'dsh-tripo-support';
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => style.remove();
        }, 'dsh-tripo-support: styles');
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'tripo-support',
          order: 12,
          label: () => '3D 生成',
        }, SettingsPage));
        ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
          name: 'settings.section.icon',
          id: 'tripo-support',
          order: 12,
        }, SectionIcon));
        ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
          name: 'conversation.input.right',
          id: 'dsh-tripo-support-3d-model',
          order: 30,
        }, ModelPill));
        for (const key of ['create_3d_task', 'run_3d_operation', 'generate_3d', 'wait_3d_task']) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({ name: 'tool.call.toolview', key }, ToolPreview));
        }
      },
    };
  },
});





