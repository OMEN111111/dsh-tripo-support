window.__ModuleLoader__.load({
  id: 'dsh-tripo-support',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const API = '/plugins/dsh-tripo-support';
    const tone = {
      text: 'var(--dsw-alias-label-primary, #1f2328)',
      muted: 'var(--dsw-alias-label-secondary, #6b7280)',
      border: 'var(--dsw-alias-border-l1, rgba(127,127,127,.24))',
      borderStrong: 'var(--dsw-alias-border-l2, rgba(127,127,127,.4))',
      surface: 'var(--dsw-alias-bg-layer-1, #fff)',
      nested: 'var(--dsw-alias-bg-layer-2, rgba(127,127,127,.06))',
      brand: 'var(--dsw-alias-brand-primary, #4d6bfe)',
      ok: 'var(--dsw-alias-state-success-primary, #1a7f37)',
      bad: 'var(--dsw-alias-state-error-primary, #cf222e)',
      warn: 'var(--dsw-alias-state-warn-primary, #9a6700)',
      idle: 'var(--dsw-alias-state-idle-primary, #9ca3af)',
    };
    const inputStyle = {
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      padding: '6px 9px',
      borderRadius: 7,
      border: `1px solid ${tone.border}`,
      background: tone.surface,
      color: tone.text,
      font: 'inherit',
      fontSize: 12.5,
      outline: 'none',
    };
    const buttonStyle = (primary) => ({
      appearance: 'none',
      border: `1px solid ${primary ? '#4d6bfe' : tone.border}`,
      background: primary ? '#4d6bfe' : 'transparent',
      color: primary ? '#ffffff' : tone.text,
      borderRadius: 7,
      padding: '5px 10px',
      font: 'inherit',
      fontSize: 12.5,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    });
    const pillStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '2px 7px',
      borderRadius: 999,
      border: `1px solid ${tone.border}`,
      color: tone.muted,
      fontSize: 11,
      lineHeight: 1.5,
    };
    const dotStyle = (ok) => ({
      width: 7,
      height: 7,
      borderRadius: 999,
      background: ok ? tone.ok : tone.idle,
      display: 'inline-block',
      flex: '0 0 auto',
    });

    async function api(path, body) {
      const response = await fetch(API + path, {
        method: body === undefined ? 'GET' : 'POST',
        credentials: 'same-origin',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`);
      return data;
    }

    function Field(props) {
      return h('label', { style: { display: 'grid', gap: 4, minWidth: 0, flex: '1 1 180px' } },
        h('span', { style: { fontSize: 11.5, color: tone.muted } }, props.label),
        props.children);
    }

    function ProviderCard(props) {
      const { provider, busy, onRefresh, onNotice, keyDraft, setKeyDraft } = props;
      const [testing, setTesting] = React.useState('');
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState({
        baseURL: provider.baseURL,
        models: provider.models.join(', '),
        region: provider.region || 'ap-guangzhou',
      });
      const [selected, setSelected] = React.useState(provider.defaultModel || provider.models[0] || '');
      React.useEffect(() => {
        setDraft({ baseURL: provider.baseURL, models: provider.models.join(', '), region: provider.region || 'ap-guangzhou' });
        setSelected(provider.defaultModel || provider.models[0] || '');
      }, [provider.baseURL, provider.defaultModel, provider.models, provider.region]);

      const key = keyDraft || {};
      const updateKey = (patch) => setKeyDraft({ ...key, ...patch });

      const saveKey = async () => {
        try {
          await api('/key', { providerId: provider.id, ...key });
          setKeyDraft({});
          onNotice(`${provider.label} 密钥已保存`);
          await onRefresh();
        } catch (error) {
          onNotice(`${provider.label} 保存失败：${error.message}`);
        }
      };
      const clearKey = async () => {
        try {
          await api('/key/clear', { providerId: provider.id });
          onNotice(`${provider.label} 密钥已清空`);
          await onRefresh();
        } catch (error) {
          onNotice(`${provider.label} 清空失败：${error.message}`);
        }
      };
      const test = async () => {
        setTesting('测试中…');
        try {
          const data = await api('/test', { providerId: provider.id });
          setTesting(data.result.ok ? `✓ ${data.result.message}` : `✗ ${data.result.message}`);
        } catch (error) {
          setTesting(`✗ ${error.message}`);
        }
      };
      const saveConfig = async () => {
        try {
          await api('/provider/update', {
            providerId: provider.id,
            baseURL: draft.baseURL,
            models: draft.models,
            defaultModel: selected,
            region: draft.region,
          });
          setEditing(false);
          onNotice(`${provider.label} 配置已保存`);
          await onRefresh();
        } catch (error) {
          onNotice(`${provider.label} 配置保存失败：${error.message}`);
        }
      };
      const changeModel = async (value) => {
        setSelected(value);
        try {
          await api('/provider/update', { providerId: provider.id, defaultModel: value });
          await onRefresh();
        } catch (error) {
          onNotice(`${provider.label} 默认模型保存失败：${error.message}`);
        }
      };
      const remove = async () => {
        if (!window.confirm(`删除 3D 服务「${provider.label}」？`)) return;
        try {
          await api('/provider/delete', { providerId: provider.id });
          onNotice(`${provider.label} 已删除`);
          await onRefresh();
        } catch (error) {
          onNotice(`${provider.label} 删除失败：${error.message}`);
        }
      };

      return h('div', {
        style: {
          border: `1px solid ${tone.border}`,
          borderRadius: 10,
          padding: '10px 12px',
          background: tone.surface,
          display: 'grid',
          gap: 9,
        },
      },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
        h('span', { style: dotStyle(provider.configured) }),
        h('strong', { style: { fontSize: 13.5 } }, provider.label),
        h('span', { style: pillStyle }, provider.kind === 'hy3d' ? '混元3D' : 'Tripo 协议'),
        provider.custom ? h('span', { style: pillStyle }, '第三方') : null,
        h('span', { style: { flex: 1 } }),
        h('span', { style: { fontSize: 11.5, color: provider.configured ? tone.ok : tone.muted } }, provider.configured ? '密钥已配置' : '未配置密钥'),
        h('button', { style: buttonStyle(false), onClick: () => setEditing(!editing), type: 'button' }, editing ? '收起' : '编辑地址'),
        provider.custom ? h('button', { style: buttonStyle(false), onClick: remove, type: 'button' }, '删除') : null,
      ),
      h('div', { style: { fontSize: 11.5, color: tone.muted, wordBreak: 'break-all' } }, provider.baseURL),
      editing ? h('div', { style: { display: 'grid', gap: 8, padding: 9, borderRadius: 8, background: tone.nested } },
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
          h(Field, { label: 'Base URL（可填第三方中转地址）' }, h('input', {
            style: inputStyle,
            value: draft.baseURL,
            onChange: (event) => setDraft({ ...draft, baseURL: event.target.value }),
            spellCheck: false,
          })),
          provider.kind === 'hy3d' ? h(Field, { label: 'Region' }, h('input', {
            style: inputStyle,
            value: draft.region,
            onChange: (event) => setDraft({ ...draft, region: event.target.value }),
            spellCheck: false,
          })) : null,
        ),
        h(Field, { label: '模型 ID（逗号或换行分隔）' }, h('textarea', {
          style: { ...inputStyle, minHeight: 54, resize: 'vertical' },
          value: draft.models,
          onChange: (event) => setDraft({ ...draft, models: event.target.value }),
          spellCheck: false,
        })),
        h('div', { style: { display: 'flex', gap: 8 } },
          h('button', { style: buttonStyle(true), onClick: saveConfig, type: 'button', disabled: Boolean(busy) }, '保存地址与模型'),
          h('button', { style: buttonStyle(false), onClick: () => setEditing(false), type: 'button' }, '取消'),
        ),
      ) : null,
      h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' } },
        h(Field, { label: '默认 3D 模型' }, h('select', {
          style: inputStyle,
          value: selected,
          onChange: (event) => changeModel(event.target.value),
        }, (provider.models.length ? provider.models : ['']).map((model) => h('option', { key: model, value: model }, model || '（先填写模型 ID）')))),
        h('button', { style: buttonStyle(false), onClick: test, type: 'button', disabled: testing === '测试中…' || !provider.configured }, '测试连接'),
        testing ? h('span', { style: { fontSize: 11.5, color: testing.startsWith('✓') ? tone.ok : tone.bad, paddingBottom: 5 } }, testing) : null,
      ),
      h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' } },
        provider.kind === 'hy3d'
          ? h(React.Fragment, null,
            h(Field, { label: 'SecretId' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: key.secretId || '', onChange: (event) => updateKey({ secretId: event.target.value }), placeholder: provider.configured ? '已保存，留空保持不变' : 'SecretId' })),
            h(Field, { label: 'SecretKey' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: key.secretKey || '', onChange: (event) => updateKey({ secretKey: event.target.value }), placeholder: provider.configured ? '已保存，留空保持不变' : 'SecretKey' })),
          )
          : h(Field, { label: 'API Key（官方或第三方平台均可）' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: key.apiKey || '', onChange: (event) => updateKey({ apiKey: event.target.value }), placeholder: provider.configured ? '已保存，输入新值可覆盖' : '粘贴 API Key' })),
        h('button', { style: buttonStyle(true), onClick: saveKey, type: 'button', disabled: Boolean(busy) }, '保存密钥'),
        provider.configured ? h('button', { style: buttonStyle(false), onClick: clearKey, type: 'button' }, '清空') : null,
      ));
    }

    function AddProvider(props) {
      const { onRefresh, onNotice } = props;
      const [open, setOpen] = React.useState(false);
      const [draft, setDraft] = React.useState({ label: '', kind: 'tripo', baseURL: '', models: '', apiKey: '', secretId: '', secretKey: '' });
      const set = (patch) => setDraft({ ...draft, ...patch });
      const submit = async () => {
        try {
          await api('/provider', draft);
          onNotice(`已添加 3D 服务 ${draft.label || '未命名'}`);
          setOpen(false);
          setDraft({ label: '', kind: 'tripo', baseURL: '', models: '', apiKey: '', secretId: '', secretKey: '' });
          await onRefresh();
        } catch (error) {
          onNotice(`添加失败：${error.message}`);
        }
      };
      if (!open) {
        return h('button', { style: buttonStyle(false), onClick: () => setOpen(true), type: 'button' }, '+ 添加第三方 3D 服务');
      }
      return h('div', { style: { border: `1px dashed ${tone.borderStrong}`, borderRadius: 10, padding: 11, display: 'grid', gap: 8, background: tone.nested } },
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
          h(Field, { label: '名称' }, h('input', { style: inputStyle, value: draft.label, onChange: (event) => set({ label: event.target.value }), placeholder: '例如 qwenai Tripo' })),
          h(Field, { label: '协议' }, h('select', { style: inputStyle, value: draft.kind, onChange: (event) => set({ kind: event.target.value }) }, h('option', { value: 'tripo' }, 'Tripo v3 异步协议'), h('option', { value: 'hy3d' }, '腾讯混元3D 协议（TC3 签名）'))),
          h(Field, { label: 'Base URL' }, h('input', { style: inputStyle, value: draft.baseURL, onChange: (event) => set({ baseURL: event.target.value }), placeholder: draft.kind === 'hy3d' ? 'https://ai3d.tencentcloudapi.com' : 'https://openapi.tripo3d.ai/v3' })),
        ),
        h(Field, { label: '模型 ID（逗号或换行分隔）' }, h('input', { style: inputStyle, value: draft.models, onChange: (event) => set({ models: event.target.value }), placeholder: '例如 v3.1-20260211, v3.0-20250812' })),
        draft.kind === 'hy3d'
          ? h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
            h(Field, { label: 'SecretId' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: draft.secretId, onChange: (event) => set({ secretId: event.target.value }) })),
            h(Field, { label: 'SecretKey' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: draft.secretKey, onChange: (event) => set({ secretKey: event.target.value }) })),
          )
          : h(Field, { label: 'API Key' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: draft.apiKey, onChange: (event) => set({ apiKey: event.target.value }) })),
        h('div', { style: { display: 'flex', gap: 8 } },
          h('button', { style: buttonStyle(true), onClick: submit, type: 'button' }, '添加并保存密钥'),
          h('button', { style: buttonStyle(false), onClick: () => setOpen(false), type: 'button' }, '取消'),
        ),
      );
    }

    function ModelPill() {
      const [snapshot, setSnapshot] = React.useState(null);
      const [open, setOpen] = React.useState(false);
      const [selection, setSelection] = React.useState(() => {
        try {
          return JSON.parse(window.localStorage.getItem('dsh3d.selection') || 'null');
        } catch {
          return null;
        }
      });
      React.useEffect(() => {
        api('/status').then(setSnapshot).catch(() => setSnapshot(null));
      }, []);
      if (!snapshot?.providers?.length) return null;
      const provider = snapshot.providers.find((item) => item.id === selection?.providerId) || snapshot.providers[0];
      const model = provider.models.includes(selection?.model) ? selection.model : (provider.defaultModel || provider.models[0] || '');
      const choose = async (providerId, value) => {
        const next = { providerId, model: value };
        setSelection(next);
        try { window.localStorage.setItem('dsh3d.selection', JSON.stringify(next)); } catch { /* ignore */ }
        setOpen(false);
        try { await api('/provider/update', { providerId, defaultModel: value }); } catch { /* ignore */ }
      };
      return h('div', { style: { position: 'relative', display: 'inline-flex' } },
        h('button', {
          type: 'button',
          title: '选择 3D 生成模型',
          onClick: () => setOpen(!open),
          style: {
            ...buttonStyle(false),
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            maxWidth: 190,
            padding: '5px 8px',
          },
        },
        h('span', { style: { width: 7, height: 7, borderRadius: 999, background: provider.configured ? tone.ok : tone.idle } }),
        h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, `3D · ${provider.label}`),
        h('span', { style: { color: tone.muted, fontSize: 11 } }, model),
        h('span', { style: { color: tone.muted, fontSize: 10 } }, '▾')),
        open ? h('div', {
          style: {
            position: 'absolute',
            right: 0,
            bottom: 34,
            zIndex: 50,
            width: 260,
            padding: 9,
            borderRadius: 10,
            border: `1px solid ${tone.borderStrong}`,
            background: 'var(--dsw-alias-bg-overlay, #1c1f26)',
            boxShadow: '0 12px 32px rgba(0,0,0,.35)',
            display: 'grid',
            gap: 8,
          },
        },
        snapshot.providers.map((item) => h('div', { key: item.id, style: { display: 'grid', gap: 4 } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: tone.muted } },
            h('span', { style: dotStyle(item.configured) }),
            item.label,
            !item.configured ? h('span', { style: { color: tone.warn } }, '未配置密钥') : null),
          h('select', {
            style: inputStyle,
            value: item.id === provider.id ? model : (item.defaultModel || item.models[0] || ''),
            disabled: !item.models.length,
            onChange: (event) => choose(item.id, event.target.value),
          }, (item.models.length ? item.models : ['']).map((value) => h('option', { key: value, value }, value || '无模型'))),
        )),
        h('div', { style: { fontSize: 10.5, color: tone.muted, borderTop: `1px solid ${tone.border}`, paddingTop: 6 } }, '选择后作为 3D 工具默认模型；在设置 → 模型 中配置密钥与地址。')) : null,
      );
    }

    function Panel() {
      const [snapshot, setSnapshot] = React.useState(null);
      const [error, setError] = React.useState('');
      const [notice, setNotice] = React.useState('');
      const [busy, setBusy] = React.useState('');
      const [keys, setKeys] = React.useState({});
      const [prompt, setPrompt] = React.useState('A low-poly treasure chest with iron hinges, game ready');
      const [generating, setGenerating] = React.useState(false);
      const [generated, setGenerated] = React.useState(null);
      const [runProvider, setRunProvider] = React.useState('tripo');

      const refresh = React.useCallback(async () => {
        try {
          const data = await api('/status');
          setSnapshot(data);
          setError('');
          if (!data.providers.some((provider) => provider.id === runProvider) && data.providers[0]) {
            setRunProvider(data.providers[0].id);
          }
        } catch (err) {
          setError(err.message);
        }
      }, [runProvider]);

      React.useEffect(() => { refresh(); }, [refresh]);

      const setKeyDraft = (providerId, value) => setKeys((current) => ({ ...current, [providerId]: value }));

      if (!snapshot) {
        return h('div', { style: { border: `1px solid ${tone.border}`, borderRadius: 12, padding: 14, background: tone.surface, color: tone.muted, fontSize: 12.5 } },
          error ? `3D 生成服务加载失败：${error}` : '正在加载 3D 生成服务…');
      }

      const runProviderInfo = snapshot.providers.find((provider) => provider.id === runProvider) || snapshot.providers[0];
      const runModels = runProviderInfo?.models || [];
      const runModel = runProviderInfo?.defaultModel || runModels[0] || '';
      const run = async () => {
        if (!runProviderInfo) return;
        setGenerating(true);
        setGenerated(null);
        try {
          const data = await api('/generate', { providerId: runProviderInfo.id, prompt, model: runModel });
          setGenerated(data.result);
          setNotice('3D 任务完成');
        } catch (err) {
          setNotice(`生成失败：${err.message}`);
        } finally {
          setGenerating(false);
        }
      };

      return h('section', {
        'aria-label': '3D generation services',
        style: { border: `1px solid ${tone.border}`, borderRadius: 12, padding: 14, background: tone.surface, display: 'grid', gap: 12, color: tone.text, marginTop: 18 },
      },
      h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' } },
        h('strong', { style: { fontSize: 15 } }, '3D 生成服务'),
        h('span', { style: { fontSize: 12, color: tone.muted, flex: 1, minWidth: 240 } }, 'Tripo / 混元3D / 第三方兼容服务。密钥存入 DSH 凭据库，不写入配置文件。'),
        h('button', { style: buttonStyle(false), onClick: refresh, type: 'button' }, '刷新'),
      ),
      error ? h('div', { style: { color: tone.bad, fontSize: 12 } }, error) : null,
      notice ? h('div', { style: { color: notice.includes('失败') ? tone.bad : tone.ok, fontSize: 12 } }, notice) : null,
      snapshot.providers.map((provider) => h(ProviderCard, {
        key: provider.id,
        provider,
        busy,
        onRefresh: refresh,
        onNotice: setNotice,
        keyDraft: keys[provider.id],
        setKeyDraft: (value) => setKeyDraft(provider.id, value),
      })),
      h(AddProvider, { onRefresh: refresh, onNotice: setNotice }),
      h('div', { style: { borderTop: `1px solid ${tone.border}`, paddingTop: 11, display: 'grid', gap: 8 } },
        h('div', { style: { fontSize: 12.5, fontWeight: 600 } }, '端到端试生成'),
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' } },
          h(Field, { label: '提示词' }, h('input', { style: inputStyle, value: prompt, onChange: (event) => setPrompt(event.target.value) })),
          h(Field, { label: '服务' }, h('select', {
            style: inputStyle,
            value: runProviderInfo?.id || '',
            onChange: (event) => setRunProvider(event.target.value),
          }, snapshot.providers.map((provider) => h('option', { key: provider.id, value: provider.id }, provider.label)))),
          h(Field, { label: '模型' }, h('select', {
            style: inputStyle,
            value: runModel,
            onChange: () => {},
          }, (runModels.length ? runModels : ['']).map((model) => h('option', { key: model, value: model }, model || '未配置模型')))),
          h('button', {
            style: { ...buttonStyle(true), opacity: generating || !runProviderInfo?.configured ? 0.55 : 1 },
            type: 'button',
            disabled: generating || !runProviderInfo?.configured,
            onClick: run,
          }, generating ? '任务执行中…' : '生成测试模型'),
        ),
        generated ? h('div', { style: { fontSize: 11.5, color: tone.muted, wordBreak: 'break-all', background: tone.nested, borderRadius: 8, padding: 8 } },
          `完成：${generated.providerLabel} / ${generated.model} / ${generated.taskId}`,
          h('br'),
          `文件：${generated.file}（${generated.bytes} 字节）`,
          generated.previewUrl ? h(React.Fragment, null, h('br'), `预览：${generated.previewUrl}`) : null,
        ) : null,
      ));
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('settings.models.footer', () => ctx.slots.register({
          name: 'settings.models.footer',
          id: 'dsh-tripo-support',
          order: 20,
        }, Panel));
        ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
          name: 'conversation.input.right',
          id: 'dsh-tripo-support-3d-model',
          order: 30,
        }, ModelPill));
      },
    };
  },
});
