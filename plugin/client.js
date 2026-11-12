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
      ok: 'var(--dsw-alias-state-success-primary, #1a7f37)',
      bad: 'var(--dsw-alias-state-error-primary, #cf222e)',
      warn: 'var(--dsw-alias-state-warn-primary, #9a6700)',
      idle: 'var(--dsw-alias-state-idle-primary, #9ca3af)',
      accent: '#4d6bfe',
    };
    const inputStyle = { boxSizing: 'border-box', width: '100%', minWidth: 0, padding: '6px 9px', borderRadius: 7, border: `1px solid ${tone.border}`, background: tone.surface, color: tone.text, font: 'inherit', fontSize: 12.5, outline: 'none' };
    const buttonStyle = (primary) => ({ appearance: 'none', border: `1px solid ${primary ? tone.accent : tone.border}`, background: primary ? tone.accent : 'transparent', color: primary ? '#fff' : tone.text, borderRadius: 7, padding: '5px 10px', font: 'inherit', fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap' });
    const pillStyle = { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 7px', borderRadius: 999, border: `1px solid ${tone.border}`, color: tone.muted, fontSize: 11, lineHeight: 1.5 };
    const dotStyle = (ok) => ({ width: 7, height: 7, borderRadius: 999, background: ok ? tone.ok : tone.idle, display: 'inline-block', flex: '0 0 auto' });

    async function api(path, body) {
      const response = await fetch(API + path, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`);
      return data;
    }

    function Field({ label, children }) {
      return h('label', { style: { display: 'grid', gap: 4, minWidth: 0, flex: '1 1 180px' } }, h('span', { style: { fontSize: 11.5, color: tone.muted } }, label), children);
    }

    function useModelViewer() {
      React.useEffect(() => {
        if (customElements.get('model-viewer')) return;
        const existing = document.querySelector('script[data-dsh-3d-viewer]');
        if (existing) return;
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
      if (String(mediaType || '').startsWith('image/')) { return h('div', { style: { border: `1px solid ${tone.border}`, borderRadius: 10, overflow: 'hidden', background: '#15171c' } }, h('img', { src, style: { width: '100%', maxHeight: `${height}px`, objectFit: 'contain', display: 'block' } })); }
      return h('div', { style: { border: `1px solid ${tone.border}`, borderRadius: 10, overflow: 'hidden', background: '#15171c' } },
        h('model-viewer', { src, loading: 'eager', reveal: 'auto', 'camera-controls': true, 'auto-rotate': true, 'interaction-prompt': 'none', 'shadow-intensity': '1.1', exposure: '1.05', style: { width: '100%', height: `${height}px`, display: 'block' } }),
        h('div', { style: { padding: '6px 9px', fontSize: 11, color: 'rgba(255,255,255,.65)', background: '#15171c', wordBreak: 'break-all' } }, src));
    }

    function protocolLabel(protocol) {
      return protocol === 'dashscope' ? 'DashScope 3D' : protocol === 'tencent' ? '混元3D / TC3' : 'Tripo v3';
    }

    function defaultBase(protocol) {
      if (protocol === 'tencent') return 'https://ai3d.tencentcloudapi.com';
      if (protocol === 'dashscope') return 'https://cn-beijing.maas.qianwenaiapi.com/api/v1/services/aigc/video-generation/3d-generation';
      return 'https://openapi.tripo3d.ai/v3';
    }

    function ProviderCard({ provider, operations, onRefresh, onNotice, keyDraft, setKeyDraft }) {
      const [testing, setTesting] = React.useState('');
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState({ baseURL: provider.baseURL, models: provider.models.join(', '), region: provider.region || 'ap-guangzhou', defaultModel: provider.defaultModel });
      React.useEffect(() => setDraft({ baseURL: provider.baseURL, models: provider.models.join(', '), region: provider.region || 'ap-guangzhou', defaultModel: provider.defaultModel }), [provider.baseURL, provider.models, provider.region, provider.defaultModel]);
      const key = keyDraft || {};
      const updateKey = (patch) => setKeyDraft({ ...key, ...patch });
      const saveKey = async () => {
        try { await api('/key', { providerId: provider.id, ...key }); setKeyDraft({}); onNotice(`${provider.label} 密钥已保存`); await onRefresh(); } catch (error) { onNotice(`${provider.label} 保存失败：${error.message}`); }
      };
      const clearKey = async () => {
        try { await api('/key/clear', { providerId: provider.id }); onNotice(`${provider.label} 密钥已清空`); await onRefresh(); } catch (error) { onNotice(`${provider.label} 清空失败：${error.message}`); }
      };
      const test = async () => {
        setTesting('测试中…');
        try { const data = await api('/test', { providerId: provider.id }); setTesting(data.result.ok ? `✓ ${data.result.message}` : `✗ ${data.result.message}`); } catch (error) { setTesting(`✗ ${error.message}`); }
      };
      const saveConfig = async () => {
        try { await api('/provider/update', { providerId: provider.id, baseURL: draft.baseURL, models: draft.models, defaultModel: draft.defaultModel, region: draft.region }); setEditing(false); onNotice(`${provider.label} 配置已保存`); await onRefresh(); } catch (error) { onNotice(`${provider.label} 配置保存失败：${error.message}`); }
      };
      const remove = async () => {
        if (!window.confirm(`删除 3D 服务「${provider.label}」？`)) return;
        try { await api('/provider/delete', { providerId: provider.id }); onNotice(`${provider.label} 已删除`); await onRefresh(); } catch (error) { onNotice(`${provider.label} 删除失败：${error.message}`); }
      };
      return h('div', { style: { border: `1px solid ${tone.border}`, borderRadius: 10, padding: '10px 12px', background: tone.surface, display: 'grid', gap: 8 } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
          h('span', { style: dotStyle(provider.configured) }),
          h('strong', { style: { fontSize: 13.5 } }, provider.label),
          h('span', { style: pillStyle }, protocolLabel(provider.protocol)),
          provider.custom ? h('span', { style: pillStyle }, '第三方') : null,
          h('span', { style: { flex: 1 } }),
          h('span', { style: { fontSize: 11.5, color: provider.configured ? tone.ok : tone.muted } }, provider.configured ? '密钥已配置' : '未配置密钥'),
          h('button', { style: buttonStyle(false), type: 'button', onClick: () => setEditing(!editing) }, editing ? '收起' : '编辑'),
          provider.custom ? h('button', { style: buttonStyle(false), type: 'button', onClick: remove }, '删除') : null),
        h('div', { style: { fontSize: 11.5, color: tone.muted, wordBreak: 'break-all' } }, provider.baseURL),
        h('div', { style: { fontSize: 11.5, color: tone.muted } }, `${provider.models.length} 个模型 · ${provider.operations.length} 个操作 · 默认 ${provider.defaultModel || '无'}`),
        editing ? h('div', { style: { display: 'grid', gap: 8, padding: 9, borderRadius: 8, background: tone.nested } },
          h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
            h(Field, { label: 'Base URL（可填第三方中转地址）' }, h('input', { style: inputStyle, value: draft.baseURL, onChange: (e) => setDraft({ ...draft, baseURL: e.target.value }), spellCheck: false })),
            provider.protocol === 'tencent' ? h(Field, { label: 'Region' }, h('input', { style: inputStyle, value: draft.region, onChange: (e) => setDraft({ ...draft, region: e.target.value }), spellCheck: false })) : null),
          h(Field, { label: '模型 ID（逗号或换行分隔）' }, h('textarea', { style: { ...inputStyle, minHeight: 54, resize: 'vertical' }, value: draft.models, onChange: (e) => setDraft({ ...draft, models: e.target.value }), spellCheck: false })),
          h(Field, { label: '默认模型' }, h('input', { style: inputStyle, value: draft.defaultModel, onChange: (e) => setDraft({ ...draft, defaultModel: e.target.value }), spellCheck: false })),
          h('div', { style: { display: 'flex', gap: 8 } }, h('button', { style: buttonStyle(true), type: 'button', onClick: saveConfig }, '保存配置'), h('button', { style: buttonStyle(false), type: 'button', onClick: () => setEditing(false) }, '取消'))) : null,
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' } },
          provider.protocol === 'tencent'
            ? h(React.Fragment, null,
              h(Field, { label: 'SecretId' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: key.secretId || '', onChange: (e) => updateKey({ secretId: e.target.value }), placeholder: provider.configured ? '已保存，留空保持不变' : 'SecretId' })),
              h(Field, { label: 'SecretKey' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: key.secretKey || '', onChange: (e) => updateKey({ secretKey: e.target.value }), placeholder: provider.configured ? '已保存，留空保持不变' : 'SecretKey' })))
            : h(Field, { label: 'API Key（官方或第三方平台均可）' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: key.apiKey || '', onChange: (e) => updateKey({ apiKey: e.target.value }), placeholder: provider.configured ? '已保存，输入新值可覆盖' : '粘贴 API Key' })),
          h('button', { style: buttonStyle(true), type: 'button', onClick: saveKey }, '保存密钥'),
          provider.configured ? h('button', { style: buttonStyle(false), type: 'button', onClick: clearKey }, '清空') : null),
        h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
          h('button', { style: buttonStyle(false), type: 'button', onClick: test, disabled: testing === '测试中…' || !provider.configured }, '测试连接'),
          testing ? h('span', { style: { fontSize: 11.5, color: testing.startsWith('✓') ? tone.ok : tone.bad } }, testing) : null),
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' } },
          h(Field, { label: 'Webhook Secret（Tripo 回调可选）' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: key.webhookSecret || '', onChange: (e) => updateKey({ webhookSecret: e.target.value }), placeholder: 'whsec_…（保存到凭据库）' })),
          h('span', { style: { fontSize: 10.5, color: tone.muted, paddingBottom: 5, wordBreak: 'break-all' } }, `回调路径：/plugins/dsh-tripo-support/webhook/${provider.id}`)));
    }

    function AddProvider({ onRefresh, onNotice }) {
      const [open, setOpen] = React.useState(false);
      const [draft, setDraft] = React.useState({ label: '', protocol: 'tripo', baseURL: defaultBase('tripo'), models: '', apiKey: '', secretId: '', secretKey: '' });
      const set = (patch) => setDraft({ ...draft, ...patch });
      if (!open) return h('button', { style: buttonStyle(false), type: 'button', onClick: () => setOpen(true) }, '+ 添加第三方 / 自定义 3D 服务');
      const submit = async () => {
        try { await api('/provider', draft); onNotice(`已添加 3D 服务 ${draft.label || '未命名'}`); setOpen(false); await onRefresh(); } catch (error) { onNotice(`添加失败：${error.message}`); }
      };
      return h('div', { style: { border: `1px dashed ${tone.borderStrong}`, borderRadius: 10, padding: 11, display: 'grid', gap: 8, background: tone.nested } },
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
          h(Field, { label: '名称' }, h('input', { style: inputStyle, value: draft.label, onChange: (e) => set({ label: e.target.value }), placeholder: '例如 第三方 Tripo' })),
          h(Field, { label: '协议' }, h('select', { style: inputStyle, value: draft.protocol, onChange: (e) => set({ protocol: e.target.value, baseURL: defaultBase(e.target.value) }) }, h('option', { value: 'tripo' }, 'Tripo v3 异步协议'), h('option', { value: 'dashscope' }, 'DashScope 3D（百炼/qianwenai）'), h('option', { value: 'tencent' }, '腾讯混元3D（TC3 签名）'))),
          h(Field, { label: 'Base URL' }, h('input', { style: inputStyle, value: draft.baseURL, onChange: (e) => set({ baseURL: e.target.value }), spellCheck: false }))),
        h(Field, { label: '模型 ID（逗号或换行分隔；DashScope 可填任意 Tripo/… 或 Hunyuan/… 模型）' }, h('textarea', { style: { ...inputStyle, minHeight: 54, resize: 'vertical' }, value: draft.models, onChange: (e) => set({ models: e.target.value }), placeholder: '例如 v3.1-20260211 或 Tripo/Tripo-H3.1' })),
        draft.protocol === 'tencent'
          ? h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } }, h(Field, { label: 'SecretId' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: draft.secretId, onChange: (e) => set({ secretId: e.target.value }) })), h(Field, { label: 'SecretKey' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: draft.secretKey, onChange: (e) => set({ secretKey: e.target.value }) })))
          : h(Field, { label: 'API Key' }, h('input', { style: inputStyle, type: 'password', autoComplete: 'new-password', value: draft.apiKey, onChange: (e) => set({ apiKey: e.target.value }) })),
        h('div', { style: { display: 'flex', gap: 8 } }, h('button', { style: buttonStyle(true), type: 'button', onClick: submit }, '添加并保存密钥'), h('button', { style: buttonStyle(false), type: 'button', onClick: () => setOpen(false) }, '取消')));
    }

    function OperationPanel({ snapshot, onNotice }) {
      const [providerId, setProviderId] = React.useState('');
      const [operation, setOperation] = React.useState('text_to_3d');
      const [model, setModel] = React.useState('');
      const [fields, setFields] = React.useState({ prompt: 'A low-poly treasure chest with iron hinges, game ready', imageUrl: '', imageUrls: '', sourceTaskId: '', modelUrl: '', format: 'GLB', outFormat: 'glb', size: '2048x2048', animations: 'preset:walk', texturePrompt: '', faceLimit: '', faceCount: '', faceLevel: 'high', motionType: '', template: '', duration: '', modelVersion: '', granularity: '', segType: 'model', hint: '', smartUv: false, imageBase64: '', quad: false, pbr: true, rigType: 'biped', spec: 'tripo', parameters: '{}' });
      const [busy, setBusy] = React.useState(false);
      const [result, setResult] = React.useState(null);
      const provider = snapshot.providers.find((item) => item.id === providerId) || snapshot.providers[0];
      const operations = provider ? provider.operations.map((id) => ({ id, ...snapshot.operations[id] })).filter((item) => item.label) : [];
      const activeOperation = operations.find((item) => item.id === operation) || operations[0];
      React.useEffect(() => {
        if (provider && !snapshot.providers.some((item) => item.id === providerId)) setProviderId(provider.id);
      }, [providerId, provider, snapshot.providers]);
      React.useEffect(() => {
        if (activeOperation && !operations.some((item) => item.id === operation)) setOperation(activeOperation.id);
      }, [activeOperation, operation, operations]);
      React.useEffect(() => { if (provider) setModel(provider.defaultModel || provider.models[0] || ''); }, [provider?.id, provider?.defaultModel]);
      const set = (patch) => setFields({ ...fields, ...patch });
      const run = async () => {
        if (!provider) return;
        setBusy(true); setResult(null);
        try {
          let parameters = {};
          try { parameters = fields.parameters ? JSON.parse(fields.parameters) : {}; } catch { throw new Error('高级参数不是合法 JSON'); }
          const body = {
            providerId: provider.id,
            operation,
            model,
            prompt: fields.prompt || undefined,
            imageUrl: fields.imageUrl || undefined,
            imageUrls: fields.imageUrls ? fields.imageUrls.split(/[,\n]/).map((x) => x.trim()).filter(Boolean) : undefined,
            sourceTaskId: fields.sourceTaskId || undefined,
            modelUrl: fields.modelUrl || undefined,
            format: fields.format || undefined,
            size: fields.size || undefined,
            outFormat: fields.outFormat || undefined,
            animations: fields.animations ? fields.animations.split(/[,\n]/).map((x) => x.trim()).filter(Boolean) : undefined,
            texturePrompt: fields.texturePrompt || undefined,
            faceLimit: fields.faceLimit ? Number(fields.faceLimit) : undefined,
            faceCount: fields.faceCount ? Number(fields.faceCount) : undefined,
            faceLevel: fields.faceLevel || undefined,
            motionType: fields.motionType ? Number(fields.motionType) : undefined,
            template: fields.template || undefined,
            duration: fields.duration ? Number(fields.duration) : undefined,
            modelVersion: fields.modelVersion || undefined,
            granularity: fields.granularity || undefined,
            segType: fields.segType || undefined,
            hint: fields.hint || undefined,
            smartUv: fields.smartUv,
            imageBase64: fields.imageBase64 || undefined,
            quad: fields.quad,
            pbr: fields.pbr,
            rigType: fields.rigType || undefined,
            spec: fields.spec || undefined,
            parameters,
          };
          const data = await api('/operation', body);
          setResult(data.result);
          onNotice(data.result.status === 'success' ? '3D 操作完成' : `3D 操作结束：${data.result.status}`);
        } catch (error) { onNotice(`操作失败：${error.message}`); } finally { setBusy(false); }
      };
      const show = (name) => activeOperation?.fields?.includes(name);
      return h('div', { style: { borderTop: `1px solid ${tone.border}`, paddingTop: 12, display: 'grid', gap: 9 } },
        h('div', { style: { fontSize: 12.5, fontWeight: 600 } }, '3D 操作面板（生成 / 拆件 / 拓扑 / 贴图 / 绑定 / 动画）'),
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' } },
          h(Field, { label: '服务' }, h('select', { style: inputStyle, value: provider?.id || '', onChange: (e) => setProviderId(e.target.value) }, snapshot.providers.map((item) => h('option', { key: item.id, value: item.id }, item.label)))),
          h(Field, { label: '操作' }, h('select', { style: inputStyle, value: activeOperation?.id || '', onChange: (e) => setOperation(e.target.value) }, operations.map((item) => h('option', { key: item.id, value: item.id }, item.label)))),
          h(Field, { label: '模型' }, h('input', { style: inputStyle, value: model, onChange: (e) => setModel(e.target.value), spellCheck: false }))),
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' } },
          show('prompt') ? h(Field, { label: '提示词' }, h('input', { style: inputStyle, value: fields.prompt, onChange: (e) => set({ prompt: e.target.value }) })) : null,
          show('imageUrl') ? h(Field, { label: '图片 URL' }, h('input', { style: inputStyle, value: fields.imageUrl, onChange: (e) => set({ imageUrl: e.target.value }) })) : null,
          show('imageUrls') ? h(Field, { label: '多视图 URL（逗号分隔，2-4 张）' }, h('input', { style: inputStyle, value: fields.imageUrls, onChange: (e) => set({ imageUrls: e.target.value }) })) : null,
          show('sourceTaskId') ? h(Field, { label: '前序 task_id' }, h('input', { style: inputStyle, value: fields.sourceTaskId, onChange: (e) => set({ sourceTaskId: e.target.value }) })) : null,
          show('modelUrl') ? h(Field, { label: '模型 URL（与 task_id 二选一）' }, h('input', { style: inputStyle, value: fields.modelUrl, onChange: (e) => set({ modelUrl: e.target.value }) })) : null,
          show('format') ? h(Field, { label: '目标格式' }, h('input', { style: inputStyle, value: fields.format, onChange: (e) => set({ format: e.target.value }) })) : null,
          show('size') ? h(Field, { label: '图片尺寸' }, h('input', { style: inputStyle, value: fields.size, onChange: (e) => set({ size: e.target.value }) })) : null,
          show('animations') ? h(Field, { label: '动画（逗号分隔）' }, h('input', { style: inputStyle, value: fields.animations, onChange: (e) => set({ animations: e.target.value }) })) : null,
          show('texturePrompt') ? h(Field, { label: '贴图提示词' }, h('input', { style: inputStyle, value: fields.texturePrompt, onChange: (e) => set({ texturePrompt: e.target.value }) })) : null,
          show('faceLimit') ? h(Field, { label: '面数上限' }, h('input', { style: inputStyle, value: fields.faceLimit, onChange: (e) => set({ faceLimit: e.target.value }) })) : null,
          show('faceCount') ? h(Field, { label: '面数' }, h('input', { style: inputStyle, value: fields.faceCount, onChange: (e) => set({ faceCount: e.target.value }) })) : null,
          show('faceLevel') ? h(Field, { label: '减面档位' }, h('input', { style: inputStyle, value: fields.faceLevel, onChange: (e) => set({ faceLevel: e.target.value }) })) : null,
          show('motionType') ? h(Field, { label: '动作类型' }, h('input', { style: inputStyle, value: fields.motionType, onChange: (e) => set({ motionType: e.target.value }) })) : null,
          show('template') ? h(Field, { label: '人物模板' }, h('input', { style: inputStyle, value: fields.template, onChange: (e) => set({ template: e.target.value }) })) : null,
          show('duration') ? h(Field, { label: '时长（秒）' }, h('input', { style: inputStyle, value: fields.duration, onChange: (e) => set({ duration: e.target.value }) })) : null,
          show('modelVersion') ? h(Field, { label: '算法版本' }, h('input', { style: inputStyle, value: fields.modelVersion, onChange: (e) => set({ modelVersion: e.target.value }) })) : null,
          show('granularity') ? h(Field, { label: '分割精度' }, h('input', { style: inputStyle, value: fields.granularity, onChange: (e) => set({ granularity: e.target.value }) })) : null,
          show('segType') ? h(Field, { label: '分割类型' }, h('input', { style: inputStyle, value: fields.segType, onChange: (e) => set({ segType: e.target.value }) })) : null,
          show('hint') ? h(Field, { label: '分割提示' }, h('input', { style: inputStyle, value: fields.hint, onChange: (e) => set({ hint: e.target.value }) })) : null,
          show('rigType') ? h(Field, { label: '骨骼类型' }, h('input', { style: inputStyle, value: fields.rigType, onChange: (e) => set({ rigType: e.target.value }) })) : null,
          show('quad') ? h(Field, { label: '四边面' }, h('input', { type: 'checkbox', checked: fields.quad, onChange: (e) => set({ quad: e.target.checked }) })) : null,
          show('pbr') ? h(Field, { label: 'PBR 材质' }, h('input', { type: 'checkbox', checked: fields.pbr, onChange: (e) => set({ pbr: e.target.checked }) })) : null,
          show('smartUv') ? h(Field, { label: '同时展开 UV' }, h('input', { type: 'checkbox', checked: fields.smartUv, onChange: (e) => set({ smartUv: e.target.checked }) })) : null,
          h(Field, { label: '高级参数 JSON' }, h('input', { style: inputStyle, value: fields.parameters, onChange: (e) => set({ parameters: e.target.value }) }))),
        h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
          h('button', { style: buttonStyle(true), type: 'button', onClick: run, disabled: busy || !provider?.configured }, busy ? '执行中…' : '执行操作'),
          h('span', { style: { fontSize: 11.5, color: tone.muted } }, '会创建异步任务、轮询并下载到工作区；生成类操作可显示 3D 预览。')),
        result ? h('div', { style: { display: 'grid', gap: 8 } },
          h('div', { style: { fontSize: 11.5, color: result.status === 'success' ? tone.ok : tone.bad, background: tone.nested, borderRadius: 8, padding: 8, wordBreak: 'break-all' } }, `${result.providerLabel || provider.label} / ${result.operation} / ${result.status} / ${result.taskId || ''}${result.localFile ? `\n文件：${result.localFile}` : ''}${result.error ? `\n错误：${result.error}` : ''}`),
          result.previewUrl ? h(ModelPreview, { src: result.previewUrl, height: 300, mediaType: result.mediaType }) : null) : null);
    }

    function Panel() {
      const [snapshot, setSnapshot] = React.useState(null);
      const [error, setError] = React.useState('');
      const [notice, setNotice] = React.useState('');
      const [keys, setKeys] = React.useState({});
      const refresh = React.useCallback(async () => {
        try { const data = await api('/status'); setSnapshot(data); setError(''); } catch (err) { setError(err.message); }
      }, []);
      React.useEffect(() => { refresh(); }, [refresh]);
      if (!snapshot) return h('div', { style: { border: `1px solid ${tone.border}`, borderRadius: 12, padding: 14, background: tone.surface, color: tone.muted, fontSize: 12.5 } }, error ? `3D 生成服务加载失败：${error}` : '正在加载 3D 生成服务…');
      return h('section', { 'aria-label': '3D generation services', style: { border: `1px solid ${tone.border}`, borderRadius: 12, padding: 14, background: tone.surface, display: 'grid', gap: 10, color: tone.text, marginTop: 18 } },
        h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' } },
          h('strong', { style: { fontSize: 15 } }, '3D 生成服务'),
          h('span', { style: { fontSize: 12, color: tone.muted, flex: 1, minWidth: 240 } }, 'Tripo 官方 / qianwenai（DashScope）/ 混元3D 官方 / 第三方兼容服务。密钥存入 DSH 凭据库，不写入配置文件。'),
          h('button', { style: buttonStyle(false), type: 'button', onClick: refresh }, '刷新')),
        error ? h('div', { style: { color: tone.bad, fontSize: 12 } }, error) : null,
        notice ? h('div', { style: { color: notice.includes('失败') ? tone.bad : tone.ok, fontSize: 12 } }, notice) : null,
        snapshot.providers.map((provider) => h(ProviderCard, { key: provider.id, provider, operations: snapshot.operations, onRefresh: refresh, onNotice: setNotice, keyDraft: keys[provider.id], setKeyDraft: (value) => setKeys((current) => ({ ...current, [provider.id]: value })) })),
        h(AddProvider, { onRefresh: refresh, onNotice: setNotice }),
        h(OperationPanel, { snapshot, onNotice: setNotice }));
    }

    function ModelPill() {
      const [snapshot, setSnapshot] = React.useState(null);
      const [open, setOpen] = React.useState(false);
      const [selection, setSelection] = React.useState(() => { try { return JSON.parse(window.localStorage.getItem('dsh3d.selection') || 'null'); } catch { return null; } });
      React.useEffect(() => { api('/status').then(setSnapshot).catch(() => setSnapshot(null)); }, []);
      if (!snapshot?.providers?.length) return null;
      const provider = snapshot.providers.find((item) => item.id === selection?.providerId) || snapshot.providers[0];
      const model = provider.models.includes(selection?.model) ? selection.model : (provider.defaultModel || provider.models[0] || '');
      const choose = async (providerId, value) => {
        setSelection({ providerId, model: value });
        try { window.localStorage.setItem('dsh3d.selection', JSON.stringify({ providerId, model: value })); } catch { /* ignore */ }
        setOpen(false);
        try { await api('/provider/update', { providerId, defaultModel: value }); } catch { /* ignore */ }
      };
      return h('div', { style: { position: 'relative', display: 'inline-flex' } },
        h('button', { type: 'button', title: '选择 3D 生成模型', onClick: () => setOpen(!open), style: { ...buttonStyle(false), display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: 190, padding: '5px 8px' } },
          h('span', { style: dotStyle(provider.configured) }),
          h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, `3D · ${provider.label}`),
          h('span', { style: { color: tone.muted, fontSize: 11 } }, model), h('span', { style: { color: tone.muted, fontSize: 10 } }, '▾')),
        open ? h('div', { style: { position: 'absolute', right: 0, bottom: 34, zIndex: 50, width: 280, padding: 9, borderRadius: 10, border: `1px solid ${tone.borderStrong}`, background: 'var(--dsw-alias-bg-overlay, #1c1f26)', boxShadow: '0 12px 32px rgba(0,0,0,.35)', display: 'grid', gap: 8 } },
          snapshot.providers.map((item) => h('div', { key: item.id, style: { display: 'grid', gap: 4 } },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: tone.muted } }, h('span', { style: dotStyle(item.configured) }), item.label, !item.configured ? h('span', { style: { color: tone.warn } }, '未配置密钥') : null),
            h('select', { style: inputStyle, value: item.id === provider.id ? model : (item.defaultModel || item.models[0] || ''), disabled: !item.models.length, onChange: (e) => choose(item.id, e.target.value) }, (item.models.length ? item.models : ['']).map((value) => h('option', { key: value, value }, value || '无模型'))))),
          h('div', { style: { fontSize: 10.5, color: tone.muted, borderTop: `1px solid ${tone.border}`, paddingTop: 6 } }, '选择后作为 3D 工具默认模型；在设置 → 模型 中配置密钥与地址。')) : null);
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
      useModelViewer();
      React.useEffect(() => {
        if (!result?.taskId || !result?.provider || status === 'success' || status === 'failed') return;
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
      if (!result) return h('div', { style: { padding: 8, color: tone.muted, fontSize: 12 } }, props.phase === 'result' ? '3D 任务已返回' : '3D 任务准备中…');
      return h('div', { style: { display: 'grid', gap: 8, padding: 2 } },
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: tone.text } },
          h('strong', null, result.providerLabel || result.provider || '3D'),
          h('span', { style: pillStyle }, result.operation || ''),
          h('span', { style: pillStyle }, status || result.status || ''),
          result.taskId ? h('span', { style: { color: tone.muted, fontSize: 11 } }, result.taskId) : null),
        preview ? h(ModelPreview, { src: preview, height: 320, mediaType: result.mediaType }) : h('div', { style: { fontSize: 11.5, color: tone.muted } }, '任务完成后会在这里显示 3D 预览。'),
        result.localFile ? h('div', { style: { fontSize: 11, color: tone.muted, wordBreak: 'break-all' } }, result.localFile) : null);
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('settings.models.footer', () => ctx.slots.register({ name: 'settings.models.footer', id: 'dsh-tripo-support', order: 20 }, Panel));
        ctx.slots.inject('conversation.input.right', () => ctx.slots.register({ name: 'conversation.input.right', id: 'dsh-tripo-support-3d-model', order: 30 }, ModelPill));
        for (const key of ['create_3d_task', 'run_3d_operation', 'generate_3d', 'wait_3d_task']) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({ name: 'tool.call.toolview', key }, ToolPreview));
        }
      },
    };
  },
});













