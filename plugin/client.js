window.__ModuleLoader__.load({
  id: 'dsh-tripo-support',
  factory(require) {
    const React = require('react');
    const ReactDOM = (() => { try { return require('react-dom'); } catch { return null; } })();
    const h = React.createElement;
    const API = '/plugins/dsh-tripo-support';
    const notifyProvidersChanged = () => { try { window.dispatchEvent(new CustomEvent('dsh-3d-providers-changed')); } catch { /* ignore */ } };

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
.dsh-3d-row>.dsh-3d-input{flex:1;min-width:0;width:auto}
.dsh-3d-row>.dsh-3d-btn{flex:none}
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
.dsh-3d-viewer-toolbar{display:flex;gap:4px;flex-wrap:wrap;padding:6px 8px;background:#151a21;border-bottom:1px solid rgba(255,255,255,.10)}
.dsh-3d-viewer-mode{appearance:none;border:1px solid rgba(255,255,255,.14);border-radius:5px;background:transparent;color:rgba(255,255,255,.68);font:inherit;font-size:11px;line-height:18px;padding:1px 7px;cursor:pointer}
.dsh-3d-viewer-mode:hover{background:rgba(255,255,255,.08);color:#fff}
.dsh-3d-viewer-mode-active{border-color:rgba(122,167,255,.8);background:rgba(91,131,255,.22);color:#dce8ff}
.dsh-3d-preview-wrap{border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.24));border-radius:10px;overflow:hidden;background:#15171c}
.dsh-3d-preview-src{padding:6px 9px;font-size:11px;color:rgba(255,255,255,.65);background:#15171c;word-break:break-all}
.dsh-3d-chat-result{display:grid;gap:8px;margin:8px 0;padding:10px 11px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.24));border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff)}
.dsh-3d-chat-result-head{display:flex;gap:7px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--dsw-alias-label-secondary,#6b7280)}
.dsh-3d-chat-result-title{font-weight:600;color:var(--dsw-alias-label-primary,#111827)}
.dsh-3d-chat-result-dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-brand-primary,#4c78ff)}
.dsh-3d-chat-result-error{color:var(--dsw-alias-state-error-primary,#ef4444);font-size:11.5px;word-break:break-all}.dsh-3d-tool{display:grid;gap:8px;padding:2px}
.dsh-3d-tool-head{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:12px}
.dsh-3d-tool-chip{display:inline-flex;align-items:center;padding:1px 6px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.24));border-radius:4px;color:var(--dsw-alias-label-secondary,#6b7280);font-size:10.5px}
`;

const WORKSHOP_CSS = `
.dsh-3d-ws{--dsh-3d-accent:#4c78ff;--dsh-3d-accent-soft:rgba(76,120,255,.12);--dsw-alias-brand-primary:#4c78ff;--dsw-alias-brand-primary-soft:rgba(76,120,255,.12);display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-base,#f6f7f9);color:var(--dsw-alias-label-primary,#1f2328);font-size:13px;overflow:hidden}
.dsh-3d-ws-head{position:relative;z-index:1;display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));background:var(--dsw-alias-bg-layer-1,#fff);flex:none}
.dsh-3d-ws-title{font-size:14px;font-weight:650;letter-spacing:.01em}
.dsh-3d-ws-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary,#6b7280);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-3d-ws-spacer{flex:1}
.dsh-3d-ws-body{display:grid;grid-template-columns:236px minmax(280px,1fr) 340px;gap:0;min-height:0;flex:1}
.dsh-3d-ws-left,.dsh-3d-ws-right{position:relative;z-index:1;display:flex;flex-direction:column;min-height:0;background:var(--dsw-alias-bg-layer-1,#fff)}
.dsh-3d-ws-left{border-right:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2))}
.dsh-3d-ws-right{border-left:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));overflow-y:auto}
.dsh-3d-ws-center{position:relative;z-index:1;display:flex;flex-direction:column;min-width:0;min-height:0;background:#10141a}
.dsh-3d-ws-pane-head{display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));flex:none}
.dsh-3d-ws-pane-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary,#111827)}
.dsh-3d-ws-balance{font-size:10.5px;line-height:18px;padding:0 6px;border-radius:9px;background:rgba(76,120,255,.10);color:var(--dsh-3d-accent,#4c78ff);white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis}
.dsh-3d-ws-hintline{font-size:10.5px;line-height:1.4;color:var(--dsw-alias-label-tertiary,#6b7280);margin-top:-3px}
.dsh-3d-ws-segment{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;padding:3px;border-radius:8px;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.07))}
.dsh-3d-ws-segment-btn{appearance:none;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#6b7280);font:inherit;font-size:11px;line-height:24px;padding:0 4px;cursor:pointer;white-space:nowrap}
.dsh-3d-ws-segment-btn:hover{color:var(--dsw-alias-label-primary,#111827)}
.dsh-3d-ws-segment-btn-active{background:var(--dsw-alias-bg-layer-1,#fff);border-color:var(--dsw-alias-border-l1,rgba(127,127,127,.2));color:var(--dsw-alias-label-primary,#111827);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.dsh-3d-ws-file{display:flex;align-items:center;gap:7px;min-width:0;padding:6px 8px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.24));border-radius:7px;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.04))}
.dsh-3d-ws-file-thumb{width:34px;height:34px;border-radius:6px;object-fit:cover;flex:none;background:var(--dsw-alias-bg-layer-1,#fff)}
.dsh-3d-ws-file-list{display:grid;gap:4px}
.dsh-3d-ws-file-name{min-width:0;flex:1;font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-3d-ws-file-size{font-size:10.5px;color:var(--dsw-alias-label-tertiary,#6b7280);white-space:nowrap}
.dsh-3d-ws-file-remove{appearance:none;border:0;background:none;color:var(--dsw-alias-label-tertiary,#6b7280);font:inherit;font-size:14px;line-height:18px;cursor:pointer;padding:0 2px}
.dsh-3d-ws-file-remove:hover{color:var(--dsw-alias-state-error-primary,#ef4444)}
.dsh-3d-ws-grid2{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.dsh-3d-ws-scope{display:flex;gap:2px;padding:8px 10px 4px;flex:none}
.dsh-3d-ws-scope-btn{flex:1;appearance:none;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));background:transparent;color:var(--dsw-alias-label-secondary,#6b7280);font:inherit;font-size:11.5px;line-height:24px;padding:0 6px;cursor:pointer}
.dsh-3d-ws-scope-btn:first-child{border-radius:6px 0 0 6px}
.dsh-3d-ws-scope-btn:last-child{border-radius:0 6px 6px 0}
.dsh-3d-ws-scope-btn-active{background:var(--dsw-alias-brand-primary-soft,rgba(76,120,255,.12));border-color:var(--dsw-alias-brand-primary,#4c78ff);color:var(--dsw-alias-brand-primary,#4c78ff);font-weight:600}
.dsh-3d-ws-search{margin:6px 10px 8px;height:28px;box-sizing:border-box;width:calc(100% - 20px);border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));border-radius:6px;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#1f2328);font:inherit;font-size:12px;padding:0 8px;outline:none}
.dsh-3d-ws-search:focus{border-color:var(--dsw-alias-brand-primary,#4c78ff)}
.dsh-3d-ws-list{flex:1;overflow-y:auto;padding:0 8px 10px;min-height:0}
.dsh-3d-ws-group{margin-top:8px}
.dsh-3d-ws-group-title{font-size:10.5px;font-weight:600;color:var(--dsw-alias-label-tertiary,#6b7280);padding:3px 4px 5px;text-transform:uppercase;letter-spacing:.04em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-3d-ws-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.dsh-3d-ws-item{display:block;width:100%;padding:0;border:2px solid transparent;border-radius:14px;background:none;color:inherit;text-align:left;cursor:pointer;font:inherit;aspect-ratio:1/1;overflow:hidden}
.dsh-3d-ws-item:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.07))}
.dsh-3d-ws-item-active{border-color:var(--dsw-alias-brand-primary,#4c78ff);box-shadow:0 0 0 2px var(--dsw-alias-brand-primary-soft,rgba(76,120,255,.12))}
.dsh-3d-ws-thumb{width:100%;height:100%;border-radius:12px;overflow:hidden;display:grid;place-items:center;background:linear-gradient(145deg,rgba(76,120,255,.22),rgba(118,86,255,.12));color:var(--dsw-alias-brand-primary,#4c78ff)}
.dsh-3d-ws-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.dsh-3d-ws-item-icon{width:28px;height:28px;border-radius:6px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(76,120,255,.22),rgba(118,86,255,.12));color:var(--dsw-alias-brand-primary,#4c78ff)}
.dsh-3d-ws-slot-grid{display:grid;gap:6px}
.dsh-3d-ws-slot{position:relative;aspect-ratio:1/1;border:1px dashed var(--dsw-alias-border-l2,rgba(127,127,127,.35));border-radius:8px;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.04));overflow:hidden;display:grid;place-items:center;cursor:pointer;min-width:0}
.dsh-3d-ws-slot:hover{border-color:var(--dsh-3d-accent,#4c78ff)}
.dsh-3d-ws-slot img{width:100%;height:100%;object-fit:cover;display:block}
.dsh-3d-ws-slot-label{position:absolute;left:0;right:0;bottom:0;padding:3px 5px;background:rgba(0,0,0,.56);color:#fff;font-size:10px;line-height:1.2;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
.dsh-3d-ws-slot-empty{font-size:10.5px;color:var(--dsw-alias-label-tertiary,#6b7280);text-align:center;padding:4px;pointer-events:none}
.dsh-3d-ws-slot-remove{position:absolute;right:3px;top:3px;width:17px;height:17px;border:0;border-radius:50%;background:rgba(0,0,0,.62);color:#fff;font:inherit;font-size:12px;line-height:17px;padding:0;cursor:pointer;z-index:1}
.dsh-3d-ws-slot-hint{font-size:10.5px;color:var(--dsw-alias-label-tertiary,#6b7280);line-height:1.4}
.dsh-3d-ws-item-main{min-width:0;display:grid;gap:2px}
.dsh-3d-ws-item-name{font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-3d-ws-item-meta{font-size:10.5px;color:var(--dsw-alias-label-tertiary,#6b7280);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-3d-ws-empty{padding:22px 12px;color:var(--dsw-alias-label-secondary,#6b7280);font-size:11.5px;line-height:1.55;text-align:center}
.dsh-3d-ws-viewerbar{display:flex;align-items:center;gap:6px;padding:7px 10px;background:#151a21;border-bottom:1px solid rgba(255,255,255,.1);flex:none;flex-wrap:wrap}
.dsh-3d-ws-viewername{min-width:0;max-width:34%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(255,255,255,.85);font-size:11.5px}
.dsh-3d-ws-mode{appearance:none;border:1px solid rgba(255,255,255,.14);border-radius:5px;background:transparent;color:rgba(255,255,255,.66);font:inherit;font-size:11px;line-height:19px;padding:1px 7px;cursor:pointer}
.dsh-3d-ws-mode:hover{background:rgba(255,255,255,.08);color:#fff}
.dsh-3d-ws-mode-active{border-color:rgba(122,167,255,.8);background:rgba(91,131,255,.22);color:#dce8ff}
.dsh-3d-ws-toolbtn{appearance:none;border:1px solid rgba(255,255,255,.16);border-radius:5px;background:rgba(255,255,255,.04);color:rgba(255,255,255,.75);font:inherit;font-size:11px;line-height:19px;padding:1px 7px;cursor:pointer}
.dsh-3d-ws-toolbtn:hover{background:rgba(255,255,255,.1);color:#fff}
.dsh-3d-ws-viewport{position:relative;flex:1;min-height:0;background:#10141a}
.dsh-3d-ws-viewport dsh-3d-viewer{width:100%;height:100%;display:block;min-height:0;outline:none}
.dsh-3d-ws-viewer-empty{position:absolute;inset:0;display:grid;place-items:center;color:rgba(255,255,255,.45);font-size:12px;padding:24px;text-align:center;pointer-events:none}
.dsh-3d-ws-viewer-empty a{pointer-events:auto}
.dsh-3d-ws-hint{position:absolute;left:10px;right:10px;bottom:34px;color:rgba(255,255,255,.52);font-size:10.5px;line-height:1.5;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.dsh-3d-ws-viewport>.dsh-3d-ws-statusbar{position:absolute;left:0;right:0;bottom:0;background:rgba(21,26,33,.86);border-top:1px solid rgba(255,255,255,.08)}
.dsh-3d-ws-viewer-error{position:absolute;inset:0;display:grid;place-items:center;color:#fca5a5;font-size:12px;padding:24px;text-align:center;background:rgba(16,20,26,.9)}
.dsh-3d-ws-statusbar{display:flex;align-items:center;gap:10px;padding:6px 10px;background:#151a21;border-top:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.5);font-size:10.5px;flex:none;flex-wrap:wrap}
.dsh-3d-ws-statusbar b{color:rgba(255,255,255,.78);font-weight:500}
.dsh-3d-ws-panel{display:grid;gap:9px;padding:10px 12px 16px}
.dsh-3d-ws-field{display:grid;gap:4px;min-width:0}
.dsh-3d-ws-label{font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280);display:flex;align-items:center;gap:6px}
.dsh-3d-ws-label em{font-style:normal;color:var(--dsw-alias-label-tertiary,#9ca3af);font-size:10px}
.dsh-3d-ws-input,.dsh-3d-ws-select,.dsh-3d-ws-textarea{box-sizing:border-box;width:100%;min-width:0;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.3));border-radius:6px;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#1f2328);font:inherit;font-size:12px;outline:none}
.dsh-3d-ws-input,.dsh-3d-ws-select{height:29px;padding:0 8px}
.dsh-3d-ws-textarea{min-height:62px;padding:6px 8px;resize:vertical;line-height:1.45}
.dsh-3d-ws-input:focus,.dsh-3d-ws-select:focus,.dsh-3d-ws-textarea:focus{border-color:var(--dsw-alias-brand-primary,#4c78ff);box-shadow:0 0 0 2px var(--dsw-alias-brand-primary-soft,rgba(76,120,255,.12))}
.dsh-3d-ws-row{display:flex;gap:6px;align-items:center;min-width:0}
.dsh-3d-ws-row>.dsh-3d-ws-input,.dsh-3d-ws-row>.dsh-3d-ws-select{flex:1;min-width:0;width:auto}
.dsh-3d-ws-check{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-secondary,#4b5563);padding:2px 0}
.dsh-3d-ws-check input{accent-color:var(--dsw-alias-brand-primary,#4c78ff)}
.dsh-3d-ws-submit{appearance:none;border:1px solid var(--dsw-alias-brand-primary,#4c78ff);border-radius:7px;background:var(--dsw-alias-brand-primary,#4c78ff);color:#fff;font:inherit;font-size:12.5px;font-weight:600;line-height:32px;padding:0 12px;cursor:pointer}
.dsh-3d-ws-submit:hover:not(:disabled){filter:brightness(1.05)}
.dsh-3d-ws-submit:disabled{opacity:.55;cursor:default}
.dsh-3d-ws-secondary{appearance:none;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#4b5563);font:inherit;font-size:11px;line-height:22px;padding:0 8px;cursor:pointer;white-space:nowrap}
.dsh-3d-ws-secondary:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.07));color:var(--dsw-alias-label-primary,#1f2328)}
.dsh-3d-ws-secondary:disabled{opacity:.45;cursor:default}
.dsh-3d-ws-error{color:var(--dsw-alias-state-error-primary,#cf222e);font-size:11.5px;line-height:1.45;word-break:break-word}
.dsh-3d-ws-success{color:var(--dsw-alias-state-success-primary,#16a34a);font-size:11.5px}
.dsh-3d-ws-job{border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.22));border-radius:8px;padding:8px 9px;display:grid;gap:5px;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.04))}
.dsh-3d-ws-job-head{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:11.5px;color:var(--dsw-alias-label-secondary,#6b7280)}
.dsh-3d-ws-job-status{font-weight:600;color:var(--dsw-alias-label-primary,#1f2328)}
.dsh-3d-ws-progress{height:3px;border-radius:2px;background:var(--dsw-alias-border-l1,rgba(127,127,127,.18));overflow:hidden}
.dsh-3d-ws-progress i{display:block;height:100%;background:var(--dsw-alias-brand-primary,#4c78ff);transition:width .3s}
.dsh-3d-ws-divider{height:1px;background:var(--dsw-alias-border-l1,rgba(127,127,127,.18));margin:2px 0}
.dsh-3d-ws-source{border:1px dashed var(--dsw-alias-border-l1,rgba(127,127,127,.3));border-radius:7px;padding:7px 8px;display:grid;gap:5px}
.dsh-3d-ws-source-title{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary,#6b7280)}
.dsh-3d-ws-source-name{font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-3d-ws-source-actions{display:flex;gap:6px;flex-wrap:wrap}
@media (max-width: 980px){
  .dsh-3d-ws-body{grid-template-columns:1fr;grid-template-rows:180px minmax(320px,1fr) auto;overflow-y:auto}
  .dsh-3d-ws-left{border-right:0;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2))}
  .dsh-3d-ws-right{border-left:0;border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2))}
  .dsh-3d-ws-center{min-height:360px}
}
`;

const modelLabel = (provider, id) => provider?.modelCatalog?.find((item) => item.id === id)?.name || id;
    const protocolLabel = (protocol) => protocol === 'dashscope' ? 'DashScope 3D' : protocol === 'tencent' ? 'HY3D' : protocol === 'meshy' ? 'Meshy' : protocol === 'hyper' ? 'Hyper3D' : 'Tripo v3';
const defaultBase = (protocol) => protocol === 'tencent' ? 'https://ai3d.tencentcloudapi.com' : protocol === 'dashscope' ? 'https://cn-beijing.maas.qianwenaiapi.com/api/v1/services/aigc/video-generation/3d-generation' : protocol === 'meshy' ? 'https://api.meshy.ai' : protocol === 'hyper' ? 'https://api.hyper3d.com/api/v2' : 'https://openapi.tripo3d.ai/v3';

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
      const catalogOf = (item) => item?.modelCatalog?.length ? item.modelCatalog : (item?.models || []).map((id) => ({ id, name: id }));
      const [editing, setEditing] = React.useState(false);
      const [advanced, setAdvanced] = React.useState(false);
      const [draft, setDraft] = React.useState({ baseURL: provider.baseURL, region: provider.region || 'ap-guangzhou' });
      const [catalog, setCatalog] = React.useState(() => catalogOf(provider));
      const [key, setKey] = React.useState({ apiKey: '', secretId: '', secretKey: '', webhookSecret: '' });
      const [authMode, setAuthMode] = React.useState(provider.auth || 'tc3');
      const [testModel, setTestModel] = React.useState(provider.defaultModel || '');
      const [testing, setTesting] = React.useState(null);
      const [discovered, setDiscovered] = React.useState(null);
      const [discoverSource, setDiscoverSource] = React.useState('');
      const [discoverSelected, setDiscoverSelected] = React.useState([]);
      const [discoverBusy, setDiscoverBusy] = React.useState(false);
      const [discoverError, setDiscoverError] = React.useState('');
      React.useEffect(() => {
        setDraft({ baseURL: provider.baseURL, region: provider.region || 'ap-guangzhou' });
        setCatalog(catalogOf(provider));
        setAuthMode(provider.auth || 'tc3');
        setTestModel(provider.defaultModel || '');
      }, [provider.baseURL, provider.region, provider.models, provider.modelCatalog, provider.auth, provider.defaultModel]);
      const set = (patch) => setDraft({ ...draft, ...patch });
      const updateCatalog = (index, patch) => setCatalog(catalog.map((row, current) => current === index ? { ...row, ...patch } : row));
      const removeCatalog = (index) => setCatalog(catalog.filter((_row, current) => current !== index));
      const addCatalog = () => setCatalog([...catalog, { id: '', name: '' }]);
      const save = async () => {
        try {
          const hasKey = Boolean(key.apiKey || key.secretId || key.secretKey || key.webhookSecret);
          const authChanged = provider.protocol === 'tencent' && authMode !== provider.auth;
          if (!hasKey && !advanced && !authChanged) { setEditing(false); return; }
          const modelCatalog = catalog.map((row) => ({ id: String(row.id || '').trim(), name: String(row.name || row.id || '').trim() })).filter((row) => row.id);
          if (authChanged) await api('/provider/update', { providerId: provider.id, auth: authMode, ...(advanced ? { baseURL: draft.baseURL, region: draft.region, modelCatalog } : {}) });
          if (hasKey) await api('/key', { providerId: provider.id, ...key });
          if (advanced && !authChanged) await api('/provider/update', { providerId: provider.id, baseURL: draft.baseURL, region: draft.region, modelCatalog });
          setKey({ apiKey: '', secretId: '', secretKey: '', webhookSecret: '' });
          setEditing(false);
          setAdvanced(false);
          onNotice(`${provider.label} 已保存`);
          await onRefresh();
        } catch (error) { onNotice(`${provider.label} 保存失败：${error.message}`); }
      };
      const test = async () => {
        setTesting({ ok: true, text: '测试中…' });
        try {
          const data = await api('/test', { providerId: provider.id, model: testModel });
          setTesting({ ok: data.result.ok, text: data.result.ok ? `${data.result.model || testModel}：${data.result.message}` : data.result.message });
        } catch (error) { setTesting({ ok: false, text: error.message }); }
      };
      const detectModels = async () => {
        setDiscoverBusy(true);
        setDiscoverError('');
        try {
          const data = await api('/models/discover', { providerId: provider.id });
          setDiscovered(data.models || []);
          setDiscoverSource(data.message || '');
          setDiscoverSelected((data.models || []).filter((model) => !catalog.some((row) => row.id === model.id)).map((model) => model.id));
        } catch (error) { setDiscoverError(error.message); }
        finally { setDiscoverBusy(false); }
      };
      const addDiscovered = () => {
        const additions = (discovered || []).filter((model) => discoverSelected.includes(model.id)).map((model) => ({ id: model.id, name: model.name || model.id }));
        const known = new Set(catalog.map((row) => row.id));
        setCatalog([...catalog, ...additions.filter((model) => !known.has(model.id))]);
        setDiscovered(null);
        setDiscoverSelected([]);
        setDiscoverSource('');
      };
      const remove = async () => {
        if (!window.confirm(`删除 ${provider.label}？此操作会移除该供应商配置。`)) return;
        try { await api('/provider/delete', { providerId: provider.id }); onNotice(`${provider.label} 已删除`); await onRefresh(); } catch (error) { onNotice(error.message); }
      };
      return h('div', { className: 'dsh-3d-card' },
        h('div', { className: 'dsh-3d-row' },
          h(Status, { provider }),
          h('span', { className: 'dsh-3d-name' }, provider.label),
          h('span', { className: 'dsh-3d-badge' }, provider.custom ? '第三方' : '官方'),
          h('span', { className: 'dsh-3d-spacer' }),
          h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => setEditing(!editing) }, editing ? '取消' : '配置'),
          h('button', { className: 'dsh-3d-btn', type: 'button', onClick: remove }, '删除')),
        editing ? h('div', { className: 'dsh-3d-form' },
          provider.protocol === 'tencent'
            ? h(React.Fragment, null,
              h(Field, { label: '认证方式' }, h('select', { className: 'dsh-3d-input', value: authMode, onChange: (e) => setAuthMode(e.target.value) }, h('option', { value: 'bearer' }, 'API Key（Bearer）'), h('option', { value: 'tc3' }, '腾讯云 SecretId + SecretKey'))),
              authMode === 'tc3'
                ? h('div', { className: 'dsh-3d-grid' },
                  h(Field, { label: 'SecretId' }, h('input', { className: 'dsh-3d-input', type: 'password', autoComplete: 'new-password', value: key.secretId, onChange: (e) => setKey({ ...key, secretId: e.target.value }), placeholder: '输入 SecretId' })),
                  h(Field, { label: 'SecretKey' }, h('input', { className: 'dsh-3d-input', type: 'password', autoComplete: 'new-password', value: key.secretKey, onChange: (e) => setKey({ ...key, secretKey: e.target.value }), placeholder: '输入 SecretKey' })))
                : h(Field, { label: 'API Key' }, h('input', { className: 'dsh-3d-input', type: 'password', autoComplete: 'new-password', value: key.apiKey, onChange: (e) => setKey({ ...key, apiKey: e.target.value }), placeholder: '输入 API Key' })))
            : h(Field, { label: 'API Key' }, h('input', { className: 'dsh-3d-input', type: 'password', autoComplete: 'new-password', value: key.apiKey, onChange: (e) => setKey({ ...key, apiKey: e.target.value }), placeholder: '输入 API Key' })),
          h('div', { className: 'dsh-3d-actions' },
            h('select', { className: 'dsh-3d-input', value: testModel, onChange: (e) => setTestModel(e.target.value), style: { maxWidth: '220px' } },
              catalog.map((row) => h('option', { key: row.id, value: row.id }, row.name && row.name !== row.id ? `${row.name} (${row.id})` : row.id))),
            h('button', { className: 'dsh-3d-btn dsh-3d-btn-primary', type: 'button', onClick: save }, '保存'),
            h('button', { className: 'dsh-3d-btn', type: 'button', onClick: test, disabled: !provider.configured && !key.apiKey && !key.secretId && !key.secretKey }, '测试模型'),
            testing ? h('span', { className: testing.ok ? 'dsh-3d-success' : 'dsh-3d-error' }, testing.text) : null),
          h('button', { className: 'dsh-3d-link', type: 'button', onClick: () => setAdvanced(!advanced) }, advanced ? '收起高级设置' : '高级设置（地址 / 模型目录）'),
          advanced ? h('div', { className: 'dsh-3d-form' },
            h('div', { className: 'dsh-3d-grid' },
              h(Field, { label: 'Base URL' }, h('input', { className: 'dsh-3d-input', value: draft.baseURL, onChange: (e) => set({ baseURL: e.target.value }), spellCheck: false })),
              provider.protocol === 'tencent' ? h(Field, { label: 'Region' }, h('input', { className: 'dsh-3d-input', value: draft.region, onChange: (e) => set({ region: e.target.value }), spellCheck: false })) : null),
            h('div', { className: 'dsh-3d-label' }, '模型目录'),
            catalog.map((row, index) => h('div', { className: 'dsh-3d-row', key: `${index}-${row.id}` },
              h('input', { className: 'dsh-3d-input', value: row.id, placeholder: '实际模型 ID', onChange: (e) => updateCatalog(index, { id: e.target.value }), spellCheck: false }),
              h('input', { className: 'dsh-3d-input', value: row.name, placeholder: '显示名称', onChange: (e) => updateCatalog(index, { name: e.target.value }) }),
              h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => removeCatalog(index) }, '删除'))),
            h('button', { className: 'dsh-3d-btn', type: 'button', onClick: addCatalog }, '添加模型'),
            h('div', { className: 'dsh-3d-actions' },
              h('button', { className: 'dsh-3d-btn', type: 'button', onClick: detectModels, disabled: discoverBusy }, discoverBusy ? '检测中…' : '检测可用模型'),
              discoverError ? h('span', { className: 'dsh-3d-error' }, discoverError) : null),
            discovered ? h('div', { className: 'dsh-3d-card', style: { marginTop: '4px' } },
              h('div', { className: 'dsh-3d-muted' }, discoverSource),
              discovered.length ? discovered.map((model) => h('label', { className: 'dsh-3d-row', key: model.id, style: { cursor: 'pointer' } },
                h('input', { type: 'checkbox', checked: discoverSelected.includes(model.id), onChange: (e) => setDiscoverSelected(e.target.checked ? [...discoverSelected, model.id] : discoverSelected.filter((id) => id !== model.id)) }),
                h('span', { className: 'dsh-3d-name' }, model.name && model.name !== model.id ? `${model.name} (${model.id})` : model.id))) : h('div', { className: 'dsh-3d-muted' }, '没有发现模型'),
              h('div', { className: 'dsh-3d-actions' },
                h('button', { className: 'dsh-3d-btn dsh-3d-btn-primary', type: 'button', onClick: addDiscovered, disabled: !discoverSelected.length }, '添加到模型目录'),
                h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => setDiscovered(null) }, '取消'))) : null,
            provider.protocol === 'tripo' ? h(Field, { label: 'Webhook Secret（可选）' }, h('input', { className: 'dsh-3d-input', type: 'password', autoComplete: 'new-password', value: key.webhookSecret, onChange: (e) => setKey({ ...key, webhookSecret: e.target.value }), placeholder: 'whsec_…' })) : null
          ) : null
        ) : null);
    }

    function AddProvider({ presets = [], onRefresh, onNotice }) {
      const [mode, setMode] = React.useState('');
      const [draft, setDraft] = React.useState({ label: '', protocol: 'tripo', auth: 'bearer', baseURL: defaultBase('tripo'), models: '', apiKey: '', secretId: '', secretKey: '' });
      const set = (patch) => setDraft({ ...draft, ...patch });
      const close = () => setMode('');
      const addOfficial = async (presetId) => {
        try { await api('/provider/official', { presetId }); onNotice('官方供应商已添加'); await onRefresh(); close(); } catch (error) { onNotice(`添加失败：${error.message}`); }
      };
      const submitCustom = async () => {
        try { await api('/provider', draft); onNotice(`已添加 ${draft.label || '第三方服务'}`); await onRefresh(); close(); } catch (error) { onNotice(`添加失败：${error.message}`); }
      };
      if (!mode) return h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => setMode('menu') }, '添加模型供应商');
      if (mode === 'menu') return h('div', { className: 'dsh-3d-card' },
        h('div', { className: 'dsh-3d-row' }, h('span', { className: 'dsh-3d-name' }, '添加模型供应商'), h('span', { className: 'dsh-3d-spacer' }), h('button', { className: 'dsh-3d-btn', type: 'button', onClick: close }, '取消')),
        h('div', { className: 'dsh-3d-grid' },
          h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => setMode('official') }, '官方途径'),
          h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => setMode('custom') }, '自定义模型 API')));
      if (mode === 'official') return h('div', { className: 'dsh-3d-card' },
        h('div', { className: 'dsh-3d-row' }, h('span', { className: 'dsh-3d-name' }, '官方途径'), h('span', { className: 'dsh-3d-spacer' }), h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => setMode('menu') }, '返回')),
        h('div', { className: 'dsh-3d-list' },
          presets.filter((preset) => !preset.custom).map((preset) => h('div', { className: 'dsh-3d-row', key: preset.id },
            h('span', { className: 'dsh-3d-name' }, preset.label),
            h('span', { className: 'dsh-3d-badge' }, preset.protocol),
            h('span', { className: 'dsh-3d-spacer' }),
            h('button', { className: 'dsh-3d-btn', type: 'button', disabled: preset.added, onClick: () => addOfficial(preset.id) }, preset.added ? '已添加' : '添加')))));
      return h('div', { className: 'dsh-3d-card' },
        h('div', { className: 'dsh-3d-row' }, h('span', { className: 'dsh-3d-name' }, '自定义模型 API'), h('span', { className: 'dsh-3d-spacer' }), h('button', { className: 'dsh-3d-btn', type: 'button', onClick: () => setMode('menu') }, '返回')),
        h('div', { className: 'dsh-3d-form' },
          h('div', { className: 'dsh-3d-grid' },
            h(Field, { label: '名称' }, h('input', { className: 'dsh-3d-input', value: draft.label, onChange: (e) => set({ label: e.target.value }), placeholder: '例如 第三方 Tripo' })),
            h(Field, { label: '协议' }, h('select', { className: 'dsh-3d-input', value: draft.protocol, onChange: (e) => set({ protocol: e.target.value, baseURL: defaultBase(e.target.value) }) }, h('option', { value: 'tripo' }, 'Tripo v3'), h('option', { value: 'meshy' }, 'Meshy'), h('option', { value: 'hyper' }, 'Hyper3D Rodin'), h('option', { value: 'dashscope' }, 'DashScope 3D'), h('option', { value: 'tencent' }, 'HY3D'))),
            h(Field, { label: 'Base URL' }, h('input', { className: 'dsh-3d-input', value: draft.baseURL, onChange: (e) => set({ baseURL: e.target.value }), spellCheck: false }))),
          h(Field, { label: '模型 ID（逗号分隔，可稍后在模型目录中改名）' }, h('input', { className: 'dsh-3d-input', value: draft.models, onChange: (e) => set({ models: e.target.value }), placeholder: 'v3.1-20260211 或 Tripo/Tripo-H3.1' })),
          draft.protocol === 'tencent'
            ? h(React.Fragment, null,
              h(Field, { label: '认证方式' }, h('select', { className: 'dsh-3d-input', value: draft.auth, onChange: (e) => set({ auth: e.target.value }) }, h('option', { value: 'bearer' }, 'API Key（Bearer）'), h('option', { value: 'tc3' }, '腾讯云 SecretId + SecretKey'))),
              draft.auth === 'tc3'
                ? h('div', { className: 'dsh-3d-grid' },
                  h(Field, { label: 'SecretId' }, h('input', { className: 'dsh-3d-input', type: 'password', value: draft.secretId, onChange: (e) => set({ secretId: e.target.value }) })),
                  h(Field, { label: 'SecretKey' }, h('input', { className: 'dsh-3d-input', type: 'password', value: draft.secretKey, onChange: (e) => set({ secretKey: e.target.value }) })))
                : h(Field, { label: 'API Key' }, h('input', { className: 'dsh-3d-input', type: 'password', value: draft.apiKey, onChange: (e) => set({ apiKey: e.target.value }) })))
            : h(Field, { label: 'API Key' }, h('input', { className: 'dsh-3d-input', type: 'password', value: draft.apiKey, onChange: (e) => set({ apiKey: e.target.value }) })),
          h('div', { className: 'dsh-3d-actions' }, h('button', { className: 'dsh-3d-btn dsh-3d-btn-primary', type: 'button', onClick: submitCustom }, '添加'))));
    }

    function SettingsPage() {
      const [snapshot, setSnapshot] = React.useState(null);
      const [notice, setNotice] = React.useState('');
      const refresh = React.useCallback(async () => {
        try { setSnapshot(await api('/status')); notifyProvidersChanged(); } catch (error) { setNotice(error.message); }
      }, []);
      React.useEffect(() => { refresh(); }, [refresh]);
      if (!snapshot) return h('div', { className: 'dsh-3d-settings' }, h('div', { className: 'dsh-3d-head' }, h('h2', null, '3D 生成'), h('span', { className: 'dsh-3d-muted' }, '正在加载…')));
      return h('div', { className: 'dsh-3d-settings' },
        h('div', { className: 'dsh-3d-head' }, h('h2', null, '3D 生成'), h('span', { className: 'dsh-3d-muted' }, '这里只显示已添加的供应商。模型选择在对话框下方的 3D 胶囊中完成。')),
        notice ? h('div', { className: notice.includes('失败') || notice.includes('错误') ? 'dsh-3d-error' : 'dsh-3d-success' }, notice) : null,
        h('div', { className: 'dsh-3d-list' },
          snapshot.providers.length ? snapshot.providers.map((provider) => h(ProviderCard, { key: provider.id, provider, onRefresh: refresh, onNotice: setNotice })) : h('div', { className: 'dsh-3d-empty' }, '还没有添加供应商')),
        h(AddProvider, { presets: snapshot.presets || [], onRefresh: refresh, onNotice: setNotice }),
        h('div', { className: 'dsh-3d-head' }, h('h2', null, '插件更新'), h('span', { className: 'dsh-3d-muted' }, '检查 GitHub 仓库最新版本；更新前会再次确认。')),
        h(UpdatePanel));
    }

    function UpdatePanel() {
      const [check, setCheck] = React.useState(null);
      const [error, setError] = React.useState('');
      const [message, setMessage] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const load = React.useCallback(async () => {
        setBusy(true);
        setError('');
        try { setCheck(await api('/update/check')); } catch (e) { setError(e.message); }
        finally { setBusy(false); }
      }, []);
      React.useEffect(() => { load(); }, [load]);
      const apply = async () => {
        if (!check?.updateAvailable) return;
        if (!window.confirm(`更新到 v${check.latest}？DSH 可能需要重启后生效。`)) return;
        setBusy(true);
        setError('');
        setMessage('');
        try {
          const data = await api('/update/apply', {});
          const application = data.result?.result?.application || data.result?.application || 'applied';
          setMessage(application === 'restart-required' ? '更新已下载，请重启 DSH 后生效。' : '已更新到最新版本。');
          await load();
        } catch (e) { setError(e.message); }
        finally { setBusy(false); }
      };
      return h('div', { className: 'dsh-3d-card' },
          h('div', { className: 'dsh-3d-row' },
            h('span', { className: `dsh-3d-dot${check?.updateAvailable ? '' : ' dsh-3d-dot-ok'}` }),
            h('span', { className: 'dsh-3d-name' }, 'dsh-tripo-support'),
            h('span', { className: 'dsh-3d-spacer' }),
            h('span', { className: 'dsh-3d-badge' }, check ? `当前 ${check.current}` : '检查中')),
          check ? h('div', { className: 'dsh-3d-grid' },
            h('div', { className: 'dsh-3d-field' }, h('span', { className: 'dsh-3d-label' }, '仓库最新版本'), h('span', { className: 'dsh-3d-name' }, `v${check.latest}`)),
            h('div', { className: 'dsh-3d-field' }, h('span', { className: 'dsh-3d-label' }, '状态'), h('span', { className: check.updateAvailable ? 'dsh-3d-error' : 'dsh-3d-success' }, check.updateAvailable ? '发现新版本' : '已是最新版本'))) : null,
          check?.releaseUrl ? h('a', { href: check.releaseUrl, target: '_blank', rel: 'noreferrer', className: 'dsh-3d-link' }, '查看 GitHub Release') : null,
          h('div', { className: 'dsh-3d-actions' },
            h('button', { className: 'dsh-3d-btn', type: 'button', onClick: load, disabled: busy }, busy ? '检查中…' : '检查更新'),
            check?.updateAvailable ? h('button', { className: 'dsh-3d-btn dsh-3d-btn-primary', type: 'button', onClick: apply, disabled: busy }, '更新到最新版本') : null),
          message ? h('div', { className: 'dsh-3d-success' }, message) : null,
          error ? h('div', { className: 'dsh-3d-error' }, error) : null);
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
                h('span', { className: 'dsh-3d-menu-name' }, provider.label)),
              active ? h('span', { className: 'dsh-3d-menu-check' }, '✓') : null),
            expanded && provider.models.length ? h('div', { className: 'dsh-3d-menu-models' },
              provider.models.map((model) => h('button', {
                key: model,
                type: 'button',
                role: 'menuitemradio',
                'aria-checked': active && model === (snapshot.selection?.model || provider.defaultModel),
                className: `dsh-3d-menu-model${active && model === (snapshot.selection?.model || provider.defaultModel) ? ' dsh-3d-menu-model-active' : ''}`,
                onClick: () => onChooseModel(provider, model),
              }, modelLabel(provider, model), active && model === (snapshot.selection?.model || provider.defaultModel) ? ' ✓' : ''))) : null);
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
      React.useEffect(() => { reload(); const onChange = () => reload(); window.addEventListener('dsh-3d-providers-changed', onChange); return () => window.removeEventListener('dsh-3d-providers-changed', onChange); }, [reload]);
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
          model ? h('span', { className: 'dsh-3d-pill-model' }, modelLabel(provider, model)) : null,
          h('span', { className: `dsh-3d-pill-caret${open ? ' dsh-3d-pill-caret-open' : ''}` }, h('svg', { width: 10, height: 10, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M4 10l4-4 4 4' })))),
        menu ? (ReactDOM?.createPortal ? ReactDOM.createPortal(menu, document.body) : menu) : null);
    }

    function useViewer3D() {
      const [ready, setReady] = React.useState(() => Boolean(customElements.get('dsh-3d-viewer')));
      React.useEffect(() => {
        if (customElements.get('dsh-3d-viewer')) { setReady(true); return; }
        let active = true;
        const script = document.createElement('script');
        script.type = 'module';
        script.src = `${API}/viewer3d.js`;
        script.dataset.dsh3dViewer3d = '1';
        script.addEventListener('load', () => { if (active) setReady(true); });
        document.head.appendChild(script);
        return () => { active = false; };
      }, []);
      return ready;
    }

    function ModelPreview({ src, height = 320, mediaType }) {
      const ready = useViewer3D();
      const [mode, setMode] = React.useState('color');
      const viewerRef = React.useRef(null);
      React.useEffect(() => {
        if (viewerRef.current) viewerRef.current.setAttribute('mode', mode);
      }, [mode]);
      if (!src) return null;
      if (String(mediaType || '').startsWith('image/')) {
        return h('div', { className: 'dsh-3d-preview-wrap' }, h('img', { src, style: { width: '100%', maxHeight: `${height}px`, objectFit: 'contain', display: 'block' } }));
      }
      const modes = [['color', '颜色'], ['normal', '法线'], ['roughness', '粗糙度'], ['metallic', '金属度'], ['wireframe', '线框'], ['clay', '白膜']];
      return h('div', { className: 'dsh-3d-preview-wrap' },
        h('div', { className: 'dsh-3d-viewer-toolbar' },
          modes.map(([id, label]) => h('button', {
            key: id,
            type: 'button',
            className: `dsh-3d-viewer-mode${mode === id ? ' dsh-3d-viewer-mode-active' : ''}`,
            onClick: () => setMode(id),
          }, label))),
        ready
          ? h('dsh-3d-viewer', { ref: viewerRef, src, mode, 'auto-rotate': 'true', style: { width: '100%', height: `${height}px`, display: 'block' } })
          : h('div', { className: 'dsh-3d-muted', style: { height: `${height}px`, display: 'grid', placeItems: 'center' } }, '正在加载 3D 查看器…'),
        h('div', { className: 'dsh-3d-preview-src' }, src));
    }
    const WORKSHOP_MODES = [['color', '颜色'], ['normal', '法线'], ['roughness', '粗糙度'], ['metallic', '金属度'], ['wireframe', '线框'], ['clay', '白膜']];
    const WORKSHOP_FIELD_LABELS = {
      prompt: '描述', imageUrl: '图片链接', imageUrls: '多张图片链接', sourceTaskId: '模型来源', modelUrl: '模型文件地址',
      texturePrompt: '贴图描述', pbr: '高质量材质', format: '输出格式', outFormat: '输出格式', modelVersion: '模型版本',
      granularity: '拆分精细度', segType: '拆分方式', hint: '拆分提示', faceLimit: '目标面数', faceCount: '面数',
      textureQuality: '贴图质量', textureSize: '贴图尺寸', geometryQuality: '模型精度', generateParts: '分部件生成',
      quad: '四边面', smartUv: '自动展开 UV', rigType: '骨骼类型', spec: '骨骼标准', motionType: '动作类型',
      animations: '动作', template: '人物模板', duration: '动作时长', size: '图片尺寸', parameters: '更多参数（高级）',
      faceLevel: '减面程度',
    };
    const WORKSHOP_OPERATION_LABELS = {
      text_to_3d: '文字生成 3D', image_to_3d: '单张图生成 3D', multiview_to_3d: '多张图生成 3D',
      texture: '生成贴图', segment: '拆分模型', smart_segment: '智能拆分', retopology: '减面 / 重建拓扑',
      uv: '展开 UV', mesh_complete: '修补模型', convert: '转换格式', rig_check: '检查绑骨', auto_rig: '自动绑骨',
      animation_retarget: '套用动作', image_to_splat: '图片生成 Splat', text_to_image: '文字生成图片',
      image_to_image: '编辑图片', image_to_multiview: '生成多视图', edit_multiview: '编辑多视图',
      part: '分部件生成', reduce_face: '智能减面', motion: '生成动作', profile_to_3d: '照片生成人物',
    };
    const WORKSHOP_GENERATION_OPERATIONS = new Set(['text_to_3d', 'image_to_3d', 'multiview_to_3d']);
    const WORKSHOP_MODE_HELP = {
      text_to_3d: '文字生成 3D：根据文字描述创建模型。Tripo 基础约 10–20 积分，贴图尺寸、模型精度、分部件等会增加消耗。',
      image_to_3d: '单张图生成 3D：用一张图片作为主体参考。Tripo 基础约 20–30 积分。',
      multiview_to_3d: '多张图生成 3D：按前/左/右/后等视角提供图片，几何更准确。Tripo 基础约 20–30 积分。',
    };
    const WORKSHOP_FIELD_HELP = {
      prompt: '描述你想生成的物体、材质、风格和用途。描述越具体，结果越可控。',
      faceCount: '输出模型的面数上限。面数越高越精细，生成时间和费用可能增加。不同模型支持的上限不同。',
      textureSize: '贴图分辨率。4K / 8K 通常会增加积分消耗，具体以供应商报价为准。',
      textureQuality: '贴图质量等级。精细或极致画质可能增加积分消耗。',
      geometryQuality: '模型几何精度。精细模式会增加生成时间和费用。',
      generateParts: '生成可以单独编辑的模型部件；会关闭贴图与材质，Tripo 预计额外增加 20 积分。',
      quad: '输出四边面网格，适合后续建模；Tripo 可能额外增加 5 积分。',
      pbr: '生成 PBR 材质（颜色、金属度、粗糙度、法线等），质量更好但可能增加费用。',
      texturePrompt: '描述想要的材质、颜色、磨损和风格。',
      sourceTaskId: '要修改的模型来源任务；选中左侧模型后会自动填入。',
      modelUrl: '要修改的模型文件地址；选中左侧模型后会自动填入。旧模型没有保存远程地址时会填入本地路径，云端供应商可能需要公网链接。',
      rigType: '选择角色骨架类型。人形选择「人形（双足）」，动物选择对应的四足/鸟类等。',
      spec: '骨骼命名标准；仅在绑骨时影响导出兼容性。',
      outFormat: '输出文件格式。GLB 适合网页预览，FBX 适合 DCC / 游戏引擎。',
      animations: '要套用的预设动作；Tripo 按动作数量计费，每个动作约 10 积分。',
      faceLevel: '减面程度；程度越高，保留的面越少。',
      format: '输出文件格式。',
      granularity: '拆分精细度。精细会拆出更多语义部件，可能增加费用。',
      segType: '拆分依据：按模型结构或按参考图片。',
      hint: '告诉模型你希望重点拆出哪些部件。',
      template: '人物生成模板。',
      duration: '动作时长，单位为秒。',
      parameters: '高级参数，通常保持默认即可。',
    };
    const WORKSHOP_FIELD_PROTOCOLS = {
      faceCount: ['tripo', 'dashscope', 'tencent'],
      faceLimit: ['tripo', 'dashscope', 'meshy'],
      faceLevel: ['tencent'],
      textureQuality: ['dashscope'],
      textureSize: ['tripo', 'tencent'],
      geometryQuality: ['tripo', 'dashscope'],
      generateParts: ['tripo'],
      quad: ['tripo', 'dashscope', 'meshy'],
      pbr: ['tripo', 'dashscope', 'tencent'],
      texturePrompt: ['tripo', 'dashscope', 'tencent'],
      modelVersion: ['tripo', 'dashscope'],
      rigType: ['tripo', 'dashscope'],
      spec: ['tripo', 'dashscope'],
      outFormat: ['tripo', 'dashscope'],
      animations: ['tripo', 'dashscope'],
      segType: ['tripo', 'dashscope'],
      granularity: ['tripo', 'dashscope'],
      hint: ['tripo', 'dashscope'],
      duration: ['tencent'],
      template: ['tencent'],
    };
    const WORKSHOP_SELECT_OPTIONS = {
      faceCount: [['', '自动'], ['5000', '5,000 面'], ['10000', '10,000 面'], ['20000', '20,000 面'], ['50000', '50,000 面'], ['100000', '100,000 面'], ['200000', '200,000 面']],
      faceLimit: [['', '自动'], ['2000', '2,000 面'], ['5000', '5,000 面'], ['10000', '10,000 面'], ['20000', '20,000 面'], ['50000', '50,000 面'], ['100000', '100,000 面']],
      faceLevel: [['', '自动'], ['high', '高'], ['medium', '中'], ['low', '低']],
      textureQuality: [['', '自动'], ['standard', '标准'], ['detailed', '精细'], ['extreme', '极致 8K']],
      textureSize: [['', '自动'], ['1024', '1K'], ['2048', '2K'], ['4096', '4K'], ['8192', '8K']],
      geometryQuality: [['', '自动'], ['standard', '标准'], ['detailed', '精细']],
      modelVersion: [['', '自动'], ['v3.0', 'v3.0（推荐）'], ['v2.0', 'v2.0'], ['v1.0', 'v1.0']],
      rigType: [['biped', '人形（双足）'], ['quadruped', '四足动物'], ['hexapod', '六足'], ['octopod', '八足'], ['avian', '鸟类 / 有翼'], ['serpentine', '蛇形'], ['aquatic', '水生'], ['others', '其他']],
      spec: [['tripo', 'Tripo 标准'], ['mixamo', 'Mixamo'], ['actorcore', 'ActorCore'], ['unity', 'Unity'], ['unreal', 'Unreal'], ['vrm', 'VRM']],
      outFormat: [['glb', 'GLB'], ['fbx', 'FBX']],
      format: [['GLB', 'GLB'], ['FBX', 'FBX'], ['OBJ', 'OBJ'], ['USDZ', 'USDZ'], ['STL', 'STL']],
      motionType: [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'], ['11', '11'], ['12', '12']],
      duration: Array.from({ length: 12 }, (_, index) => [String(index + 1), `${index + 1} 秒`]),
      segType: [['model', '按模型智能拆分'], ['image', '按图片拆分']],
      granularity: [['', '自动'], ['simple', '简单'], ['balanced', '适中'], ['detailed', '精细']],
    };
    const WORKSHOP_OPERATION_GROUPS = [
      { label: '生成', ids: ['text_to_3d', 'image_to_3d', 'multiview_to_3d', 'profile_to_3d', 'image_to_splat'] },
      { label: '编辑模型', ids: ['texture', 'segment', 'smart_segment', 'retopology', 'uv', 'mesh_complete', 'reduce_face', 'part'] },
      { label: '绑定与动作', ids: ['rig_check', 'auto_rig', 'animation_retarget', 'motion'] },
      { label: '转换与参考图', ids: ['convert', 'text_to_image', 'image_to_image', 'image_to_multiview', 'edit_multiview'] },
    ];
    const WORKSHOP_SOURCE_OPERATIONS = new Set(['texture', 'segment', 'smart_segment', 'retopology', 'uv', 'mesh_complete', 'convert', 'rig_check', 'auto_rig', 'animation_retarget', 'part', 'reduce_face', 'motion']);
    const WORKSHOP_VIEW_SLOTS = {
      four: [['front', '前'], ['left', '左侧'], ['right', '右侧'], ['back', '后']],
      eight: [['front', '前'], ['left_front', '左 45°'], ['left', '左侧'], ['right', '右侧'], ['right_front', '右 45°'], ['back', '后'], ['top', '顶'], ['bottom', '底']],
    };
    const workshopViewSlots = (provider, model) => {
      if (provider?.protocol === 'tencent') return String(model || '').startsWith('3.1') ? WORKSHOP_VIEW_SLOTS.eight : WORKSHOP_VIEW_SLOTS.four;
      return WORKSHOP_VIEW_SLOTS.four;
    };
    const workshopFaceCountOptions = (provider, model) => {
      const high = [['', '自动'], ['1500000', '1.5M'], ['1000000', '1M'], ['500000', '500K'], ['200000', '200K'], ['100000', '100K'], ['50000', '50K'], ['20000', '20K'], ['10000', '10K'], ['5000', '5K']];
      if (provider?.protocol === 'tencent') return high.concat([['3000', '3K']]);
      if (provider?.protocol === 'meshy') return [['', '自动'], ['300000', '300K'], ['200000', '200K'], ['100000', '100K'], ['50000', '50K'], ['20000', '20K'], ['10000', '10K']];
      if (provider?.protocol === 'tripo' || provider?.protocol === 'dashscope') {
        const value = String(model || '');
        if (value.startsWith('v2.5')) return high.filter(([id]) => !id || Number(id) <= 500000);
        if (value.startsWith('v3.0')) return high.filter(([id]) => !id || Number(id) <= 1000000);
        return high;
      }
      return high;
    };
    const workshopModelVersionOptions = (operation) => operation === 'segment'
      ? [['', '自动'], ['v2.0-20260430', '语义分割 v2'], ['v1.0-20250506', '几何分割 v1']]
      : WORKSHOP_SELECT_OPTIONS.modelVersion;
    const estimateTaskCost = (provider, operation, values = {}) => {
      const fallback = (text, note) => ({ amount: null, text, note });
      if (!provider) return fallback('按实际计费', '请选择供应商');
      if (provider.protocol === 'tripo' && !provider.custom) {
        let amount;
        if (WORKSHOP_GENERATION_OPERATIONS.has(operation)) {
          const hasTexture = values.pbr !== false && !values.generateParts;
          amount = operation === 'text_to_3d' ? (hasTexture ? 20 : 10) : (hasTexture ? 30 : 20);
          if (values.generateParts) {
            amount += 20;
          } else {
            if (values.textureSize === '4096') amount += 10;
            if (values.textureSize === '8192') amount += 20;
            if (values.geometryQuality === 'detailed') amount += 20;
            if (values.quad) amount += 5;
          }
        } else {
          amount = {
            texture: values.textureSize === '8192' ? 30 : values.textureSize === '4096' ? 20 : 10,
            segment: 40,
            smart_segment: values.segType === 'image' ? 85 : 55,
            retopology: values.modelVersion === 'v1.0' ? 10 : values.modelVersion === 'v3.0' ? (values.quad ? 40 : 35) : 30,
            uv: 20,
            mesh_complete: 50,
            convert: 5,
            rig_check: 0,
            auto_rig: 25,
            animation_retarget: 10 * (Array.isArray(values.animations) ? Math.max(1, values.animations.length) : Math.max(1, String(values.animations || '').split(/[\n,]/).filter(Boolean).length)),
            text_to_image: 5,
            image_to_image: 5,
            image_to_multiview: 10,
            edit_multiview: 5,
          }[operation];
        }
        if (Number.isFinite(amount)) return { amount, text: `本次任务预计消耗 ${amount} 积分`, note: '参考 Tripo 官网报价；实际以账户扣费为准。' };
        return fallback('按实际计费', '该操作暂无公开固定报价，实际以供应商扣费为准。');
      }
      if (provider.protocol === 'meshy' && !provider.custom) {
        const amount = WORKSHOP_GENERATION_OPERATIONS.has(operation) ? 20 : operation === 'texture' ? (values.textureSize === '8192' ? 15 : 10) : null;
        if (amount !== null) return { amount, text: `本次任务预计消耗 ${amount} 积分`, note: '参考 Meshy API 定价；实际以账户扣费为准。' };
        return fallback('按实际计费', '该操作暂无公开固定积分报价，实际以 Meshy 扣费为准。');
      }
      if (provider.protocol === 'tencent') return fallback('按腾讯云账单', '腾讯云按任务/资源实际计费，不使用积分。');
      if (provider.protocol === 'hyper') return fallback('按订阅额度', 'Hyper3D 按订阅额度或实际扣减计费，不使用积分。');
      if (provider.protocol === 'dashscope') return fallback('按百炼实际计费', '百炼 / qwenai 按平台实际账单计费，不使用积分。');
      return fallback('按实际计费', '按当前网关实际计费。');
    };

    const formatBytes = (bytes) => {
      const value = Number(bytes || 0);
      if (!value) return '0 B';
      if (value < 1024) return `${value} B`;
      if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
      return `${(value / 1024 / 1024).toFixed(1)} MB`;
    };
    const formatWorkshopTime = (value) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };
    const workshopJobLabel = (status) => ({ success: '已完成', failed: '失败', cancelled: '已取消', running: '生成中', queued: '排队中', unknown: '未知', timeout: '超时' }[status] || status || '准备中');

    function readViewerStats(host) {
      if (!host?.model) return null;
      let meshes = 0;
      let triangles = 0;
      host.model.traverse((object) => {
        if (!object?.isMesh) return;
        meshes += 1;
        const geometry = object.geometry;
        const count = geometry?.index?.count || geometry?.attributes?.position?.count || 0;
        triangles += count / 3;
      });
      return { meshes, triangles: Math.round(triangles) };
    }

    function setupMayaControls(host) {
      if (!host || host.__dsh3dMaya) return;
      host.__dsh3dMaya = true;
      const camera = () => host.camera;
      const target = () => host.controls?.target;
      const controls = host.controls;
      if (controls) {
        controls.enabled = false;
        controls.enableDamping = false;
        controls.autoRotate = false;
      }
      const frame = () => {
        if (typeof host.fit === 'function') host.fit();
        const cam = camera();
        const aim = target();
        if (cam && aim) cam.lookAt(aim);
      };
      const reset = () => {
        const cam = camera();
        const aim = target();
        if (!cam || !aim) return;
        frame();
        cam.lookAt(aim);
      };
      const pan = (dx, dy) => {
        const cam = camera();
        const aim = target();
        if (!cam || !aim) return;
        const height = Math.max(1, host.clientHeight || 500);
        const distance = cam.position.distanceTo(aim) || 1;
        const scale = (2 * Math.tan((cam.fov || 35) * Math.PI / 360) * distance) / height;
        const right = cam.position.clone().set(1, 0, 0).applyQuaternion(cam.quaternion).multiplyScalar(-dx * scale);
        const up = cam.position.clone().set(0, 1, 0).applyQuaternion(cam.quaternion).multiplyScalar(dy * scale);
        const move = right.add(up);
        aim.add(move);
        cam.position.add(move);
        cam.lookAt(aim);
      };
      const orbit = (dx, dy) => {
        const cam = camera();
        const aim = target();
        if (!cam || !aim) return;
        const offset = cam.position.clone().sub(aim);
        const radius = offset.length();
        if (!radius) return;
        const theta = Math.atan2(offset.x, offset.z) - dx * 0.0075;
        const phi = Math.max(0.025, Math.min(Math.PI - 0.025, Math.acos(Math.max(-1, Math.min(1, offset.y / radius))) - dy * 0.0075));
        const sinPhi = Math.sin(phi);
        cam.position.set(
          aim.x + radius * sinPhi * Math.sin(theta),
          aim.y + radius * Math.cos(phi),
          aim.z + radius * sinPhi * Math.cos(theta),
        );
        cam.lookAt(aim);
      };
      const dolly = (amount) => {
        const cam = camera();
        const aim = target();
        if (!cam || !aim) return;
        const offset = cam.position.clone().sub(aim);
        const length = offset.length();
        if (!length) return;
        const next = Math.max(0.01, length * Math.exp(amount));
        offset.multiplyScalar(next / length);
        cam.position.copy(aim).add(offset);
        cam.lookAt(aim);
      };
      let drag;
      try { host.tabIndex = 0; } catch { /* ignore */ }
      const onPointerDown = (event) => {
        try { host.focus?.({ preventScroll: true }); } catch { /* ignore */ }
        if (!event.altKey || event.button < 0 || event.button > 2) return;
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, action: event.button === 0 ? 'orbit' : event.button === 1 ? 'pan' : 'dolly' };
        try { host.setPointerCapture?.(event.pointerId); } catch { /* ignore */ }
        event.preventDefault();
        event.stopPropagation();
      };
      const onPointerMove = (event) => {
        if (!drag || drag.id !== event.pointerId) return;
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        drag.x = event.clientX;
        drag.y = event.clientY;
        if (drag.action === 'orbit') orbit(dx, dy);
        else if (drag.action === 'pan') pan(dx, dy);
        else dolly(-dx * 0.01 + dy * 0.01);
        event.preventDefault();
        event.stopPropagation();
      };
      const onPointerUp = (event) => {
        if (!drag || drag.id !== event.pointerId) return;
        drag = undefined;
        try { host.releasePointerCapture?.(event.pointerId); } catch { /* ignore */ }
        event.preventDefault();
        event.stopPropagation();
      };
      const onWheel = (event) => {
        if (!camera()) return;
        dolly(event.deltaY * 0.0012);
        event.preventDefault();
        event.stopPropagation();
      };
      const onContextMenu = (event) => { if (event.altKey) event.preventDefault(); };
      const onKeyDown = (event) => {
        if (event.key !== 'f' && event.key !== 'F') return;
        const tag = String(event.target?.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || event.target?.isContentEditable) return;
        event.preventDefault();
        reset();
      };
      host.addEventListener('pointerdown', onPointerDown, true);
      host.addEventListener('pointermove', onPointerMove, true);
      host.addEventListener('pointerup', onPointerUp, true);
      host.addEventListener('pointercancel', onPointerUp, true);
      host.addEventListener('wheel', onWheel, { capture: true, passive: false });
      host.addEventListener('contextmenu', onContextMenu, true);
      host.addEventListener('keydown', onKeyDown, true);
      host.__dsh3dMayaCleanup = () => {
        host.removeEventListener('pointerdown', onPointerDown, true);
        host.removeEventListener('pointermove', onPointerMove, true);
        host.removeEventListener('pointerup', onPointerUp, true);
        host.removeEventListener('pointercancel', onPointerUp, true);
        host.removeEventListener('wheel', onWheel, true);
        host.removeEventListener('contextmenu', onContextMenu, true);
        host.removeEventListener('keydown', onKeyDown, true);
        delete host.__dsh3dMaya;
      };
      host.__dsh3dFrame = reset;
    }

    function WorkshopViewer({ item, mode, onLoaded }) {
      const ready = useViewer3D();
      const hostRef = React.useRef(null);
      const [error, setError] = React.useState('');
      const [stats, setStats] = React.useState(null);
      const src = item ? `${API}/workshop/model?path=${encodeURIComponent(item.path)}` : '';
      React.useEffect(() => {
        setError('');
        setStats(null);
      }, [src]);
      React.useEffect(() => {
        const host = hostRef.current;
        if (!ready || !host || !src) return undefined;
        const loaded = () => {
          setError('');
          setStats(readViewerStats(host));
          setupMayaControls(host);
          onLoaded?.();
        };
        const failed = (event) => setError(event?.detail || '模型加载失败');
        host.addEventListener('viewer-loaded', loaded);
        host.addEventListener('viewer-error', failed);
        const timer = setTimeout(() => { if (host.ready) loaded(); }, 30);
        return () => {
          clearTimeout(timer);
          host.removeEventListener('viewer-loaded', loaded);
          host.removeEventListener('viewer-error', failed);
          host.__dsh3dMayaCleanup?.();
        };
      }, [ready, src]);
      React.useEffect(() => {
        if (hostRef.current && mode) hostRef.current.setAttribute('mode', mode);
      }, [mode]);
      if (!item) return h('div', { className: 'dsh-3d-ws-viewport' }, h('div', { className: 'dsh-3d-ws-viewer-empty' }, '从左侧选择一个模型预览'));
      if (item.previewable === false) {
        return h('div', { className: 'dsh-3d-ws-viewport' },
          h('div', { className: 'dsh-3d-ws-viewer-empty' },
            h('div', null, `${item.name} 暂不支持内嵌预览。`),
            h('a', { href: src, download: item.name, style: { color: '#9fc0ff', marginTop: '8px', display: 'inline-block' } }, '下载模型文件')),
        );
      }
      return h('div', { className: 'dsh-3d-ws-viewport' },
        ready ? h('dsh-3d-viewer', { key: src, ref: hostRef, src, mode, 'auto-rotate': 'false' }) : h('div', { className: 'dsh-3d-ws-viewer-empty' }, '正在加载 3D 查看器…'),
        error ? h('div', { className: 'dsh-3d-ws-viewer-error' }, `预览失败：${error}`) : null,
        h('div', { className: 'dsh-3d-ws-hint' }, 'Maya 操作：Alt+左键旋转 · Alt+中键平移 · Alt+右键/滚轮缩放 · F 聚焦'),
        item && stats ? h('div', { className: 'dsh-3d-ws-statusbar' }, h('span', null, `${stats.meshes} 个网格`), h('span', null, `${stats.triangles.toLocaleString('zh-CN')} 三角面`), h('span', null, formatBytes(item.bytes))) : null,
      );
    }

    function WorkshopField({ field, value, onChange, options: optionsProp }) {
      const label = WORKSHOP_FIELD_LABELS[field] || field;
      const help = WORKSHOP_FIELD_HELP[field] || '';
      if (field === 'pbr' || field === 'quad' || field === 'smartUv' || field === 'generateParts') {
        return h('label', { className: 'dsh-3d-ws-check', title: help },
          h('input', { type: 'checkbox', checked: field === 'pbr' ? value !== false : Boolean(value), onChange: (event) => onChange(event.target.checked) }),
          h('span', null, label),
          field === 'generateParts' ? h('em', { className: 'dsh-3d-ws-label' }, '会关闭贴图与材质') : null);
      }
      const options = optionsProp || WORKSHOP_SELECT_OPTIONS[field];
      if (options) {
        return h('label', { className: 'dsh-3d-ws-field', title: help }, h('span', { className: 'dsh-3d-ws-label' }, label),
          h('select', { className: 'dsh-3d-ws-select', title: help, value: value ?? options[0][0], onChange: (event) => onChange(event.target.value) },
            options.map(([optionValue, optionLabel]) => h('option', { key: optionValue, value: optionValue, title: optionLabel }, optionLabel))));
      }
      if (field === 'prompt' || field === 'texturePrompt' || field === 'hint' || field === 'animations' || field === 'imageUrls' || field === 'parameters') {
        const placeholder = field === 'imageUrls' ? '每行一个图片链接（2-4 张）' : field === 'animations' ? '每行一个动作名称' : field === 'parameters' ? '一般不用填写' : field === 'prompt' ? '例如：低多边形宝箱，木质纹理，铁质锁扣' : '';
        return h('label', { className: 'dsh-3d-ws-field', title: help }, h('span', { className: 'dsh-3d-ws-label' }, label),
          h('textarea', { className: 'dsh-3d-ws-textarea', title: help, value: value ?? '', placeholder, onChange: (event) => onChange(event.target.value) }));
      }
      return h('label', { className: 'dsh-3d-ws-field', title: help }, h('span', { className: 'dsh-3d-ws-label' }, label),
        h('input', { className: 'dsh-3d-ws-input', title: help, value: value ?? '', placeholder: field === 'sourceTaskId' ? '选择左侧模型后自动填入' : field === 'imageUrl' ? '粘贴公开图片链接，或选择本地图片' : field === 'modelUrl' ? '选择左侧模型后自动填入' : '', onChange: (event) => onChange(event.target.value) }));
    }

    function WorkshopImagePicker({ multiple, provider, operation, uploaded, busy, error, onPick, onClear, urlValue, onUrlChange }) {
      const canLocal = provider?.protocol === 'tripo' || provider?.protocol === 'hyper' || (provider?.protocol === 'tencent' && operation === 'profile_to_3d');
      const canMultiple = provider?.protocol === 'tripo';
      const inputRef = React.useRef(null);
      return h('div', { className: 'dsh-3d-ws-field' },
        h('span', { className: 'dsh-3d-ws-label' }, multiple ? '多张参考图' : '参考图', h('em', { className: 'dsh-3d-ws-label' }, multiple ? '建议 2-4 张' : 'PNG / JPG / WEBP')),
        canLocal ? h(React.Fragment, null,
          h('input', { ref: inputRef, type: 'file', accept: 'image/png,image/jpeg,image/webp', multiple: multiple && canMultiple, style: { display: 'none' }, onChange: (event) => { onPick([...event.target.files || []]); event.target.value = ''; } }),
          h('div', { className: 'dsh-3d-ws-source-actions' },
            h('button', { type: 'button', className: 'dsh-3d-ws-secondary', disabled: busy || (multiple && !canMultiple), onClick: () => inputRef.current?.click() }, busy ? '上传中…' : '选择本地图片'),
            multiple && !canMultiple ? h('span', { className: 'dsh-3d-ws-sub' }, '该供应商多图仅支持链接') : null),
          uploaded?.length ? h('div', { className: 'dsh-3d-ws-file-list' }, uploaded.map((file, index) => h('div', { key: `${file.name}-${index}`, className: 'dsh-3d-ws-file' },
            file.previewUrl ? h('img', { className: 'dsh-3d-ws-file-thumb', src: file.previewUrl, alt: '' }) : null,
            h('span', { className: 'dsh-3d-ws-file-name' }, file.name),
            h('span', { className: 'dsh-3d-ws-file-size' }, formatBytes(file.size)),
            h('button', { type: 'button', className: 'dsh-3d-ws-file-remove', onClick: () => onClear(index), 'aria-label': `移除 ${file.name}` }, '×')))) : null,
          error ? h('div', { className: 'dsh-3d-ws-error' }, error) : null,
        ) : h('div', { className: 'dsh-3d-ws-sub' }, '该供应商需要公网图片链接；可直接粘贴图片 URL。'),
        h('label', { className: 'dsh-3d-ws-field' },
          h('span', { className: 'dsh-3d-ws-label' }, multiple ? '或粘贴多张图片链接' : '或粘贴图片链接'),
          multiple
            ? h('textarea', { className: 'dsh-3d-ws-textarea', value: urlValue ?? '', placeholder: '每行一个图片链接（2-4 张）', onChange: (event) => onUrlChange(event.target.value) })
            : h('input', { className: 'dsh-3d-ws-input', value: urlValue ?? '', placeholder: 'https://…', onChange: (event) => onUrlChange(event.target.value) })));
    }

    function WorkshopMultiViewPicker({ slots, value, busy, error, localUpload, onPickFile, onPickUrl, onClear }) {
      const inputRef = React.useRef(null);
      const targetRef = React.useRef('');
      const [target, setTarget] = React.useState('');
      const choose = (id) => {
        if (busy) return;
        if (!localUpload) {
          const url = window.prompt('粘贴这个视角的图片链接');
          if (url && /^https?:/i.test(url.trim())) onPickUrl(id, url.trim());
          return;
        }
        targetRef.current = id;
        setTarget(id);
        inputRef.current?.click();
      };
      return h('div', { className: 'dsh-3d-ws-field' },
        h('span', { className: 'dsh-3d-ws-label' }, '多视角图片', h('em', { className: 'dsh-3d-ws-label' }, '每个视角最多一张，可留空')),
        localUpload ? h('input', {
          ref: inputRef,
          type: 'file',
          accept: 'image/png,image/jpeg,image/webp',
          style: { display: 'none' },
          onChange: (event) => {
            const file = event.target.files?.[0];
            if (file) onPickFile(targetRef.current || target, file);
            event.target.value = '';
          },
        }) : null,
        h('div', { className: 'dsh-3d-ws-slot-grid', style: { gridTemplateColumns: slots.length > 4 ? 'repeat(4,minmax(0,1fr))' : 'repeat(2,minmax(0,1fr))' } },
          slots.map(([id, label]) => {
            const item = value?.[id];
            return h('div', {
              key: id,
              role: 'button',
              tabIndex: 0,
              className: 'dsh-3d-ws-slot',
              title: item ? `${label}：${item.name || item.url || ''}` : `添加${label}图片`,
              onClick: () => choose(id),
              onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(id); } },
            },
              item ? h('img', { src: item.previewUrl || item.url, alt: label }) : h('span', { className: 'dsh-3d-ws-slot-empty' }, `${label}\n点击添加`),
              h('span', { className: 'dsh-3d-ws-slot-label' }, label),
              item ? h('button', { type: 'button', className: 'dsh-3d-ws-slot-remove', onClick: (event) => { event.stopPropagation(); onClear(id); }, 'aria-label': `移除${label}图片` }, '×') : null);
          })),
        localUpload ? null : h('div', { className: 'dsh-3d-ws-slot-hint' }, '当前供应商无法直接接收本地文件，点击插槽可粘贴公网图片链接。'),
        error ? h('div', { className: 'dsh-3d-ws-error' }, error) : null,
      );
    }

    function captureModelThumbnail(path) {
      return new Promise((resolve, reject) => {
        const element = document.createElement('dsh-3d-viewer');
        element.setAttribute('auto-rotate', 'false');
        element.style.cssText = 'position:fixed;left:-10000px;top:0;width:160px;height:160px;display:block;';
        let settled = false;
        const finish = (callback, value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          element.remove();
          callback(value);
        };
        const timer = setTimeout(() => finish(reject, new Error('生成缩略图超时')), 60000);
        element.addEventListener('viewer-loaded', () => {
          try {
            element.renderer.render(element.scene, element.camera);
            const data = element.renderer.domElement.toDataURL('image/jpeg', 0.78);
            if (!data || data === 'data:,') throw new Error('缩略图内容为空');
            finish(resolve, data);
          } catch (err) {
            finish(reject, err);
          }
        }, { once: true });
        element.addEventListener('viewer-error', (event) => finish(reject, new Error(event?.detail || '缩略图加载失败')), { once: true });
        element.setAttribute('src', `${API}/workshop/model?path=${encodeURIComponent(path)}`);
        document.body.appendChild(element);
      });
    }

    function fileToDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error(`读取 ${file.name} 失败`));
        reader.readAsDataURL(file);
      });
    }

    function WorkshopView(props) {
      const { sessionId, useSessions, useWorkspaces } = props;
      const sessions = useSessions ? useSessions((snapshot) => snapshot) : null;
      const workspaceState = useWorkspaces ? useWorkspaces((snapshot) => snapshot) : null;
      const cwd = sessionId && sessions?.byId ? sessions.byId[sessionId]?.cwd || '' : '';
      const workspaceItems = workspaceState?.items || [];
      const sessionWorkspace = workspaceItems.find((workspace) => Array.isArray(workspace.sessionIds) && workspace.sessionIds.includes(sessionId));
      const currentPath = sessionWorkspace?.path || workspaceItems.find((workspace) => workspace.path === cwd)?.path || cwd || workspaceItems[0]?.path || '';
      const [scope, setScope] = React.useState(() => {
        try { return localStorage.getItem('dsh-3d-workshop-scope') === 'all' ? 'all' : 'current'; } catch { return 'current'; }
      });
      const effectiveScope = scope === 'current' && !currentPath ? 'all' : scope;
      const viewerReady = useViewer3D();
      const [snapshot, setSnapshot] = React.useState(null);
      const [workspaces, setWorkspaces] = React.useState([]);
      const [models, setModels] = React.useState([]);
      const [thumbnails, setThumbnails] = React.useState({});
      const thumbnailQueue = React.useRef(new Set());
      const [activePath, setActivePath] = React.useState('');
      const [search, setSearch] = React.useState('');
      const [loading, setLoading] = React.useState(false);
      const [notice, setNotice] = React.useState('');
      const [mode, setMode] = React.useState('color');
      const [form, setForm] = React.useState({ providerId: '', model: '', operation: 'text_to_3d', values: {} });
      const [job, setJob] = React.useState(null);
      const [submitting, setSubmitting] = React.useState(false);
      const [error, setError] = React.useState('');
      const [showAdvanced, setShowAdvanced] = React.useState(false);
      const [balance, setBalance] = React.useState(null);
      const [balanceVersion, setBalanceVersion] = React.useState(0);
      const [uploaded, setUploaded] = React.useState([]);
      const [uploadBusy, setUploadBusy] = React.useState(false);
      const [uploadError, setUploadError] = React.useState('');

      const loadSnapshot = React.useCallback(() => {
        api('/status').then((data) => { setSnapshot(data); }).catch((err) => setError(err.message));
      }, []);
      const loadModels = React.useCallback(async () => {
        setLoading(true);
        try {
          const query = new URLSearchParams({ scope: effectiveScope });
          if (effectiveScope === 'current' && currentPath) query.set('path', currentPath);
          const data = await api(`/workshop/models?${query.toString()}`);
          setWorkspaces(data.workspaces || []);
          setModels(data.models || []);
          setNotice('');
        } catch (err) {
          setNotice(err.message);
        } finally {
          setLoading(false);
        }
      }, [effectiveScope, currentPath]);
      React.useEffect(() => { loadSnapshot(); }, [loadSnapshot]);
      React.useEffect(() => {
        const reload = () => loadSnapshot();
        window.addEventListener('dsh-3d-providers-changed', reload);
        return () => window.removeEventListener('dsh-3d-providers-changed', reload);
      }, [loadSnapshot]);
      React.useEffect(() => { loadModels(); }, [loadModels]);
      const modelKey = models.map((model) => model.path).join('|');
      React.useEffect(() => {
        if (!viewerReady || !models.length) return undefined;
        let cancelled = false;
        const queue = models.filter((model) => model.previewable && !model.thumbnailUrl && !thumbnailQueue.current.has(model.path)).slice(0, 12);
        (async () => {
          for (const model of queue) {
            if (cancelled) return;
            thumbnailQueue.current.add(model.path);
            try {
              const thumbnail = await captureModelThumbnail(model.path);
              if (!cancelled) setThumbnails((current) => ({ ...current, [model.path]: thumbnail }));
            } catch {
              thumbnailQueue.current.delete(model.path);
            }
          }
        })();
        return () => { cancelled = true; };
      }, [viewerReady, modelKey]);
      React.useEffect(() => {
        try { localStorage.setItem('dsh-3d-workshop-scope', scope); } catch { /* ignore */ }
      }, [scope]);
      React.useEffect(() => {
        const seat = document.querySelector('[data-composer-seat]');
        if (!seat) return undefined;
        const previous = seat.style.display;
        seat.style.display = 'none';
        return () => { seat.style.display = previous; };
      }, []);
      React.useEffect(() => {
        if (models.length && !models.some((model) => model.path === activePath)) setActivePath(models[0].path);
        if (!models.length && activePath) setActivePath('');
      }, [models, activePath]);
      React.useEffect(() => {
        if (!job?.taskId || !job?.provider || ['success', 'failed', 'cancelled', 'unknown', 'timeout'].includes(job.status)) return undefined;
        let active = true;
        let failures = 0;
        const timer = setInterval(async () => {
          try {
            const data = await api(`/task?provider=${encodeURIComponent(job.provider)}&taskId=${encodeURIComponent(job.taskId)}&operation=${encodeURIComponent(job.operation || '')}`);
            if (!active) return;
            failures = 0;
            const result = data.result || {};
            setJob((current) => ({ ...current, ...result, status: result.status || current.status }));
            if (['success', 'failed', 'cancelled', 'unknown', 'timeout'].includes(result.status)) {
              clearInterval(timer);
              if (result.status === 'success') {
                await loadModels();
                if (result.localFile) setActivePath(result.localFile);
                setBalanceVersion((value) => value + 1);
              }
            }
          } catch (err) {
            if (!active) return;
            failures += 1;
            setJob((current) => ({ ...current, error: err.message }));
            if (failures >= 3) clearInterval(timer);
          }
        }, 2200);
        return () => { active = false; clearInterval(timer); };
      }, [job?.taskId, job?.provider, job?.operation, job?.status, loadModels]);

      const providers = snapshot?.providers || [];
      const selectedProvider = providers.find((provider) => provider.id === form.providerId)
        || providers.find((provider) => provider.id === snapshot?.selection?.providerId)
        || providers.find((provider) => provider.configured)
        || providers[0];
      const providerId = selectedProvider?.id || '';
      const modelOptions = selectedProvider?.models || [];
      const currentModel = modelOptions.includes(form.model) ? form.model : (selectedProvider?.defaultModel || modelOptions[0] || '');
      const operationIds = selectedProvider?.operations || [];
      const currentOperation = operationIds.includes(form.operation) ? form.operation : (operationIds.includes('text_to_3d') ? 'text_to_3d' : operationIds[0] || '');
      const operationMeta = snapshot?.operations?.[currentOperation] || { label: currentOperation, fields: [] };
      const operationGroups = WORKSHOP_OPERATION_GROUPS.map((group) => ({ ...group, ids: group.ids.filter((id) => operationIds.includes(id)) })).filter((group) => group.ids.length);
      const groupedIds = new Set(operationGroups.flatMap((group) => group.ids));
      const extraOperationIds = operationIds.filter((id) => !groupedIds.has(id));
      const generationChoices = [['text_to_3d', '文字'], ['image_to_3d', '单张图'], ['multiview_to_3d', '多张图']].filter(([id]) => operationIds.includes(id));
      const imagePickerOperation = new Set(['image_to_3d', 'multiview_to_3d', 'profile_to_3d', 'image_to_splat']).has(currentOperation);
      const fields = (operationMeta.fields || []).filter((field) => {
        if ((field === 'imageUrl' || field === 'imageUrls') && imagePickerOperation) return false;
        if (field === 'sourceTaskId' && imagePickerOperation) return false;
        if (field === 'textureSize' && selectedProvider?.protocol === 'tencent' && !['texture', 'part', 'reduce_face'].includes(currentOperation)) return false;
        const protocols = WORKSHOP_FIELD_PROTOCOLS[field];
        return !protocols || !selectedProvider || protocols.includes(selectedProvider.protocol);
      });
      const active = models.find((model) => model.path === activePath) || null;
      const balanceText = balance?.supported ? `积分 ${balance.balance ?? '—'}` : (balance?.message || '积分暂不可查');
      const estimate = estimateTaskCost(selectedProvider, currentOperation, form.values);
      const estimateButtonText = estimate.amount !== null ? `预计消耗 ${estimate.amount} 积分` : estimate.text;
      const loadBalance = React.useCallback(async () => {
        if (!providerId) { setBalance(null); return; }
        let lastError;
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            const data = await api(`/workshop/balance?provider=${encodeURIComponent(providerId)}`);
            setBalance(data);
            return;
          } catch (err) {
            lastError = err;
            if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 900));
          }
        }
        setBalance({ ok: false, supported: false, message: lastError?.message || '积分暂不可查' });
      }, [providerId]);
      React.useEffect(() => { loadBalance(); }, [loadBalance, balanceVersion]);
      const visibleModels = models.filter((model) => {
        if (!search.trim()) return true;
        const query = search.trim().toLowerCase();
        return [model.name, model.providerLabel, model.operation, model.workspaceTitle].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
      });
      const groupedModels = workspaces.map((workspace) => ({ ...workspace, models: visibleModels.filter((model) => model.workspacePath === workspace.path) })).filter((workspace) => workspace.models.length);
      const updateValue = (key, value) => setForm((current) => ({ ...current, values: { ...current.values, [key]: value } }));
      const lastSourceModel = React.useRef('');
      React.useEffect(() => {
        if (!active || !WORKSHOP_SOURCE_OPERATIONS.has(currentOperation)) {
          if (!active) lastSourceModel.current = '';
          return;
        }
        if (active.provider && selectedProvider?.id && active.provider !== selectedProvider.id) return;
        const changed = lastSourceModel.current !== active.path;
        if (changed) lastSourceModel.current = active.path;
        setForm((current) => {
          const next = { ...current.values };
          let touched = false;
          if (changed || !next.sourceTaskId) {
            const sourceTaskId = active.taskId || active.sourceTaskId;
            if (sourceTaskId) { next.sourceTaskId = sourceTaskId; touched = true; }
          }
          if (changed || !next.modelUrl) {
            const modelUrl = active.modelUrl || active.path;
            if (modelUrl) { next.modelUrl = modelUrl; touched = true; }
          }
          return touched ? { ...current, values: next } : current;
        });
      }, [active?.path, currentOperation, selectedProvider?.id]);
      const selectModel = (model) => {
        setActivePath(model.path);
        if (WORKSHOP_SOURCE_OPERATIONS.has(currentOperation) && model.provider && providers.some((provider) => provider.id === model.provider)) {
          setForm((current) => ({ ...current, providerId: model.provider, model: model.model || current.model }));
        }
      };
      const pickImages = async (files) => {
        const total = currentOperation === 'multiview_to_3d' ? 4 : 1;
        const picked = (files || []).filter((file) => /^image\//.test(file.type)).slice(0, total);
        if (!picked.length) return;
        if (currentOperation === 'multiview_to_3d' && selectedProvider?.protocol !== 'tripo') {
          setUploadError('当前供应商的多图生成只支持粘贴图片链接');
          return;
        }
        setUploadBusy(true);
        setUploadError('');
        try {
          const results = [];
          for (const file of picked) {
            const dataUrl = await fileToDataUrl(file);
            const data = await api('/workshop/upload', {
              providerId,
              fileName: file.name,
              mediaType: file.type,
              data: dataUrl,
            });
            results.push({ name: file.name, size: file.size, previewUrl: dataUrl, ...data });
          }
          setUploaded(results);
          setForm((current) => {
            const values = { ...current.values, imageUrl: '', imageUrls: '', imageBase64: undefined, imageFileToken: undefined, imageFileTokens: undefined };
            if (selectedProvider?.protocol === 'tripo') {
              if (currentOperation === 'multiview_to_3d') values.imageFileTokens = results.map((file) => file.fileToken).filter(Boolean);
              else values.imageFileToken = results[0]?.fileToken;
            } else {
              values.imageBase64 = results[0]?.dataUrl;
            }
            return { ...current, values };
          });
        } catch (err) {
          setUploadError(err.message);
          setUploaded([]);
          setForm((current) => ({ ...current, values: { ...current.values, imageFileToken: undefined, imageFileTokens: undefined, imageBase64: undefined } }));
        } finally {
          setUploadBusy(false);
        }
      };
      const removeUploaded = (index) => {
        const next = uploaded.filter((_, itemIndex) => itemIndex !== index);
        setUploaded(next);
        setForm((current) => {
          const values = { ...current.values };
          if (selectedProvider?.protocol === 'tripo') {
            if (currentOperation === 'multiview_to_3d') values.imageFileTokens = next.map((file) => file.fileToken).filter(Boolean);
            else values.imageFileToken = next[0]?.fileToken;
          } else {
            values.imageBase64 = next[0]?.dataUrl;
          }
          return { ...current, values };
        });
      };
      const setImageUrlText = (value) => {
        setUploaded([]);
        setForm((current) => ({ ...current, values: { ...current.values, imageUrl: value, imageBase64: undefined, imageFileToken: undefined } }));
      };
      const setImageUrlsText = (value) => {
        setUploaded([]);
        setForm((current) => ({ ...current, values: { ...current.values, imageUrls: value, imageFileTokens: undefined } }));
      };
      const setMultiviewSlot = (slotId, item) => setForm((current) => ({
        ...current,
        values: { ...current.values, multiviewSlots: { ...(current.values.multiviewSlots || {}), [slotId]: item } },
      }));
      const clearMultiviewSlot = (slotId) => setForm((current) => {
        const next = { ...(current.values.multiviewSlots || {}) };
        delete next[slotId];
        return { ...current, values: { ...current.values, multiviewSlots: next } };
      });
      const pickMultiviewFile = async (slotId, file) => {
        if (!slotId || !file) return;
        setUploadBusy(true);
        setUploadError('');
        try {
          const dataUrl = await fileToDataUrl(file);
          const data = await api('/workshop/upload', { providerId, fileName: file.name, mediaType: file.type, data: dataUrl });
          setMultiviewSlot(slotId, {
            name: file.name,
            previewUrl: dataUrl,
            ...(data.fileToken ? { fileToken: data.fileToken } : { dataUrl: data.dataUrl || dataUrl }),
          });
        } catch (err) {
          setUploadError(err.message);
        } finally {
          setUploadBusy(false);
        }
      };
      const pickMultiviewUrl = (slotId, url) => setMultiviewSlot(slotId, { name: '图片链接', url, previewUrl: url });
      const chooseProvider = (id) => {
        const provider = providers.find((item) => item.id === id);
        setUploaded([]);
        setUploadError('');
        setBalance(null);
        setForm((current) => ({ ...current, providerId: id, model: provider?.defaultModel || provider?.models?.[0] || '', operation: provider?.operations?.includes('text_to_3d') ? 'text_to_3d' : (provider?.operations?.[0] || ''), values: {} }));
      };
      const useActiveAsSource = () => {
        if (!active) return;
        setForm((current) => ({ ...current, values: { ...current.values, ...((active.taskId || active.sourceTaskId) ? { sourceTaskId: active.taskId || active.sourceTaskId } : {}), ...((active.modelUrl || active.path) ? { modelUrl: active.modelUrl || active.path } : {}) } }));
      };
      const submit = async () => {
        if (!selectedProvider || !currentOperation) return;
        setSubmitting(true);
        setError('');
        setJob(null);
        try {
          let parameters;
          if (form.values.parameters && String(form.values.parameters).trim()) parameters = JSON.parse(String(form.values.parameters));
          const values = { ...form.values };
          delete values.parameters;
          for (const field of fields) {
            if (values[field] === undefined || values[field] === '') {
              if (field === 'format' || field === 'outFormat') values[field] = 'GLB';
              if (field === 'segType') values[field] = 'model';
              if (field === 'pbr') values[field] = true;
            }
          }
          if (typeof values.imageUrls === 'string') values.imageUrls = values.imageUrls.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
          if (typeof values.animations === 'string') values.animations = values.animations.split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
          for (const key of ['faceLimit', 'faceCount', 'duration', 'motionType']) {
            if (values[key] !== undefined && values[key] !== '') values[key] = Number(values[key]);
          }
          if (Array.isArray(values.imageUrls) && !values.imageUrls.length) delete values.imageUrls;
          if (Array.isArray(values.animations) && !values.animations.length) delete values.animations;
          if (['image_to_3d', 'multiview_to_3d', 'profile_to_3d'].includes(currentOperation)) {
            const slots = values.multiviewSlots || {};
            const filledSlots = Object.values(slots).filter((slot) => slot && (slot.fileToken || slot.url || slot.dataUrl));
            const hasImage = values.imageUrl || values.imageFileToken || values.imageBase64 || values.imageUrls?.length || values.imageFileTokens?.length || filledSlots.length;
            if (!hasImage) throw new Error('请先选择本地图片，或填写图片链接');
            if (currentOperation === 'multiview_to_3d') {
              if (!slots.front) throw new Error('多视角生成至少需要「前」视图');
              if (filledSlots.length < 2) throw new Error('多视角生成至少需要 2 张不同视角的图片');
            }
          }
          const data = await api('/workshop/generate', {
            providerId,
            model: currentModel,
            operation: currentOperation,
            args: { ...values, ...(parameters ? { parameters } : {}) },
            workspacePath: currentPath || workspaces[0]?.path || '',
          });
          if (data.result) {
            setJob({ ...data.result, status: data.result.status || 'success' });
            await loadModels();
            if (data.result.localFile) setActivePath(data.result.localFile);
          } else if (data.task) {
            setJob({ ...data.task, status: data.task.status || 'queued' });
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setSubmitting(false);
        }
      };
      const scopeButton = (id, label) => h('button', {
        type: 'button',
        className: `dsh-3d-ws-scope-btn${effectiveScope === id ? ' dsh-3d-ws-scope-btn-active' : ''}`,
        onClick: () => { if (id === 'current' && !currentPath) { setNotice('当前会话还没有工作区，已显示全部工作区。'); return; } setScope(id); },
      }, label);
      const hostRefocus = () => {
        const host = document.querySelector('.dsh-3d-ws-viewport dsh-3d-viewer');
        host?.__dsh3dFrame?.();
      };
      const left = h('aside', { className: 'dsh-3d-ws-left' },
        h('div', { className: 'dsh-3d-ws-pane-head' }, h('span', { className: 'dsh-3d-ws-pane-title' }, '已生成模型'), h('span', { className: 'dsh-3d-ws-spacer' }), h('button', { type: 'button', className: 'dsh-3d-ws-secondary', onClick: loadModels, disabled: loading }, loading ? '刷新中' : '刷新')),
        h('div', { className: 'dsh-3d-ws-scope' }, scopeButton('current', '当前工作区'), scopeButton('all', '全部工作区')),
        h('input', { className: 'dsh-3d-ws-search', value: search, placeholder: '搜索模型 / 供应商', onChange: (event) => setSearch(event.target.value) }),
        h('div', { className: 'dsh-3d-ws-list' },
          notice ? h('div', { className: 'dsh-3d-ws-empty' }, notice) : null,
          !notice && !loading && !visibleModels.length ? h('div', { className: 'dsh-3d-ws-empty' }, '当前范围还没有 3D 模型。\n右侧可以直接发起生成。') : null,
          groupedModels.map((workspace) => h('div', { key: workspace.path, className: 'dsh-3d-ws-group' },
            h('div', { className: 'dsh-3d-ws-group-title', title: workspace.path }, workspace.title || workspace.path),
            h('div', { className: 'dsh-3d-ws-grid' }, workspace.models.map((model) => {
              const detail = [model.name, model.providerLabel || '本地模型', WORKSHOP_OPERATION_LABELS[model.operation] || model.operation, formatWorkshopTime(model.updatedAt), formatBytes(model.bytes)].filter(Boolean).join('\n');
              return h('button', {
                key: model.path,
                type: 'button',
                title: detail,
                'aria-label': detail,
                className: `dsh-3d-ws-item${model.path === activePath ? ' dsh-3d-ws-item-active' : ''}`,
                onClick: () => selectModel(model),
              },
                h('span', { className: 'dsh-3d-ws-thumb' },
                  (thumbnails[model.path] || model.thumbnailUrl)
                    ? h('img', { src: thumbnails[model.path] || model.thumbnailUrl, alt: '', loading: 'lazy', referrerPolicy: 'no-referrer', onError: (event) => { event.currentTarget.style.display = 'none'; } })
                    : h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M12 2 21 7 12 12 3 7Z' }), h('path', { d: 'M3 7v10l9 5 9-5V7' }), h('path', { d: 'M12 12v10' }))));
            })))),
      ));
      const center = h('main', { className: 'dsh-3d-ws-center' },
        h('div', { className: 'dsh-3d-ws-viewerbar' },
          h('span', { className: 'dsh-3d-ws-viewername', title: active?.path || '' }, active?.name || '主预览视口'),
          h('span', { className: 'dsh-3d-ws-spacer' }),
          WORKSHOP_MODES.map(([id, label]) => h('button', { key: id, type: 'button', className: `dsh-3d-ws-mode${mode === id ? ' dsh-3d-ws-mode-active' : ''}`, onClick: () => setMode(id) }, label)),
          h('button', { type: 'button', className: 'dsh-3d-ws-toolbtn', onClick: () => hostRefocus(), disabled: !active }, '聚焦')),
        h(WorkshopViewer, { item: active, mode, onLoaded: () => {} }),
        active ? h('div', { className: 'dsh-3d-ws-statusbar' }, h('span', null, active.workspaceTitle || ''), h('span', null, active.taskId ? `任务 ${active.taskId}` : '本地文件'), h('span', null, active.operation || '')) : null,
      );
      const right = h('aside', { className: 'dsh-3d-ws-right' },
        h('div', { className: 'dsh-3d-ws-pane-head' },
          h('span', { className: 'dsh-3d-ws-pane-title' }, '生成 3D'),
          h('span', { className: 'dsh-3d-ws-spacer' }),
          h('span', { className: 'dsh-3d-ws-balance', title: balance?.message || '' }, balanceText)),
        h('div', { className: 'dsh-3d-ws-panel' },
          h('label', { className: 'dsh-3d-ws-field' }, h('span', { className: 'dsh-3d-ws-label' }, '供应商'),
            h('select', { className: 'dsh-3d-ws-select', value: providerId, onChange: (event) => chooseProvider(event.target.value) },
              providers.length ? providers.map((provider) => h('option', { key: provider.id, value: provider.id }, `${provider.label}${provider.configured ? '' : '（未配置）'}`)) : h('option', { value: '' }, '没有可用供应商'))),
          h('label', { className: 'dsh-3d-ws-field' }, h('span', { className: 'dsh-3d-ws-label' }, '模型'),
            h('select', { className: 'dsh-3d-ws-select', value: currentModel, onChange: (event) => setForm((current) => ({ ...current, model: event.target.value })) },
              modelOptions.length ? modelOptions.map((model) => h('option', { key: model, value: model }, modelLabel(selectedProvider, model))) : h('option', { value: '' }, '没有模型'))),
          h('label', { className: 'dsh-3d-ws-field' }, h('span', { className: 'dsh-3d-ws-label' }, '任务类型'),
            h('select', { className: 'dsh-3d-ws-select', title: operationMeta.description || '', value: currentOperation, onChange: (event) => { setUploaded([]); setUploadError(''); setForm((current) => ({ ...current, operation: event.target.value, values: { ...current.values, multiviewSlots: undefined } })); } },
              operationGroups.map((group) => h('optgroup', { key: group.label, label: group.label }, group.ids.map((id) => h('option', { key: id, value: id }, WORKSHOP_OPERATION_LABELS[id] || snapshot?.operations?.[id]?.label || id)))),
              extraOperationIds.length ? h('optgroup', { label: '其他' }, extraOperationIds.map((id) => h('option', { key: id, value: id }, WORKSHOP_OPERATION_LABELS[id] || snapshot?.operations?.[id]?.label || id))) : null)),
          operationMeta.description ? h('div', { className: 'dsh-3d-ws-hintline', title: operationMeta.description }, operationMeta.description) : null,
          WORKSHOP_GENERATION_OPERATIONS.has(currentOperation) && generationChoices.length ? h('div', { className: 'dsh-3d-ws-segment' }, generationChoices.map(([id, label]) => h('button', {
            key: id,
            type: 'button',
            title: WORKSHOP_MODE_HELP[id],
            className: `dsh-3d-ws-segment-btn${currentOperation === id ? ' dsh-3d-ws-segment-btn-active' : ''}`,
            onClick: () => { setUploaded([]); setUploadError(''); setForm((current) => ({ ...current, operation: id, values: { ...current.values, imageUrl: '', imageUrls: '', imageBase64: undefined, imageFileToken: undefined, imageFileTokens: undefined, multiviewSlots: undefined } })); },
          }, label))) : null,
          !selectedProvider?.configured ? h('div', { className: 'dsh-3d-ws-error' }, '该供应商还没有配置密钥，请先到设置 → 3D 生成中配置。') : null,
          WORKSHOP_SOURCE_OPERATIONS.has(currentOperation) ? h('div', { className: 'dsh-3d-ws-source' },
            h('div', { className: 'dsh-3d-ws-source-title' }, '要修改的模型'),
            h('div', { className: 'dsh-3d-ws-source-name', title: active?.path || '' }, active ? active.name : '先在左侧选择模型'),
            h('div', { className: 'dsh-3d-ws-source-actions' },
              h('button', { type: 'button', className: 'dsh-3d-ws-secondary', disabled: !active || (!active.taskId && !active.modelUrl), onClick: useActiveAsSource }, '重新填入模型信息'),
              (active?.taskId || active?.sourceTaskId) ? h('span', { className: 'dsh-3d-ws-sub' }, `任务 ${active.taskId || active.sourceTaskId}`) : null)) : null,
          imagePickerOperation ? (currentOperation === 'multiview_to_3d'
            ? h(WorkshopMultiViewPicker, {
              slots: workshopViewSlots(selectedProvider, currentModel),
              value: form.values.multiviewSlots,
              busy: uploadBusy,
              error: uploadError,
              localUpload: ['tripo', 'tencent'].includes(selectedProvider?.protocol),
              onPickFile: pickMultiviewFile,
              onPickUrl: pickMultiviewUrl,
              onClear: clearMultiviewSlot,
            })
            : h(WorkshopImagePicker, {
              multiple: false,
              provider: selectedProvider,
              operation: currentOperation,
              uploaded,
              busy: uploadBusy,
              error: uploadError,
              onPick: pickImages,
              onClear: removeUploaded,
              urlValue: form.values.imageUrl,
              onUrlChange: setImageUrlText,
            })) : null,
          fields.map((field) => h(WorkshopField, {
            key: field,
            field,
            value: form.values[field],
            onChange: (value) => updateValue(field, value),
            options: field === 'faceCount' ? workshopFaceCountOptions(selectedProvider, currentModel) : (field === 'modelVersion' ? workshopModelVersionOptions(currentOperation) : undefined),
          })),
          h('button', { type: 'button', className: 'dsh-3d-ws-secondary', onClick: () => setShowAdvanced((value) => !value) }, showAdvanced ? '收起更多参数' : '更多参数'),
          showAdvanced && !fields.includes('parameters') ? h(WorkshopField, { field: 'parameters', value: form.values.parameters, onChange: (value) => updateValue('parameters', value) }) : null,
          h('button', { type: 'button', className: 'dsh-3d-ws-submit', onClick: submit, title: estimate.note, disabled: submitting || !selectedProvider?.configured || !currentModel || !currentOperation }, submitting ? '提交中…' : `${WORKSHOP_GENERATION_OPERATIONS.has(currentOperation) ? '开始生成' : '开始处理'}（${estimateButtonText}）`),
          error ? h('div', { className: 'dsh-3d-ws-error' }, error) : null,
          job ? h('div', { className: 'dsh-3d-ws-job' },
            h('div', { className: 'dsh-3d-ws-job-head' }, h('span', { className: 'dsh-3d-ws-job-status' }, workshopJobLabel(job.status)), h('span', null, job.providerLabel || job.provider || ''), h('span', null, WORKSHOP_OPERATION_LABELS[job.operation] || job.operation || ''), job.taskId ? h('span', { className: 'dsh-3d-ws-sub' }, job.taskId) : null),
            typeof job.progress === 'number' ? h('div', { className: 'dsh-3d-ws-progress' }, h('i', { style: { width: `${Math.max(4, Math.min(100, job.progress))}%` } })) : null,
            job.error ? h('div', { className: 'dsh-3d-ws-error' }, job.error) : null,
            job.status === 'success' && job.localFile ? h('div', { className: 'dsh-3d-ws-success' }, `已保存：${String(job.localFile).split(/[\\\\/]/).pop()}`) : null) : null,
        ),
      );
      return h('div', { className: 'dsh-3d-ws' },
        h('div', { className: 'dsh-3d-ws-head' },
          h('span', { className: 'dsh-3d-ws-title' }, '3D 工坊'),
          h('span', { className: 'dsh-3d-ws-sub' }, `${visibleModels.length} 个模型`),
          h('span', { className: 'dsh-3d-ws-spacer' }),
          h('span', { className: 'dsh-3d-ws-sub' }, currentPath || '全部工作区')),
        h('div', { className: 'dsh-3d-ws-body' }, left, center, right),
      );
    }

    function ChatResultNode(props) {
      const initial = props.node?.data?.result || null;
      const [result, setResult] = React.useState(initial);
      const [status, setStatus] = React.useState(initial?.status || '');
      React.useEffect(() => {
        if (!initial) return;
        setResult(initial);
        setStatus(initial.status || '');
      }, [initial]);
      React.useEffect(() => {
        if (!result?.taskId || !result?.provider) return;
        if (['success', 'failed', 'cancelled', 'unknown', 'timeout'].includes(status)) return;
        let cancelled = false;
        let failures = 0;
        const timer = setInterval(async () => {
          try {
            const data = await api(`/task?provider=${encodeURIComponent(result.provider)}&taskId=${encodeURIComponent(result.taskId)}&operation=${encodeURIComponent(result.operation || '')}`);
            if (cancelled) return;
            failures = 0;
            setStatus(data.result.status);
            setResult((current) => ({ ...current, ...data.result, previewUrl: data.result.previewUrl || current?.previewUrl }));
            if (['success', 'failed', 'cancelled', 'unknown'].includes(data.result.status)) clearInterval(timer);
          } catch {
            failures += 1;
            if (failures >= 3) {
              clearInterval(timer);
              setResult((current) => (current ? { ...current, error: current.error || '任务查询失败' } : current));
            }
          }
        }, 2500);
        return () => { cancelled = true; clearInterval(timer); };
      }, [result?.taskId, result?.provider, result?.operation, status]);
      if (!result) return null;
      const preview = result.previewUrl || result.preview;
      return h('div', { className: 'dsh-3d-chat-result' },
        h('div', { className: 'dsh-3d-chat-result-head' },
          h('span', { className: 'dsh-3d-chat-result-dot' }),
          h('span', { className: 'dsh-3d-chat-result-title' }, '3D 结果'),
          h('span', { className: 'dsh-3d-tool-chip' }, result.providerLabel || result.provider || ''),
          result.operation ? h('span', { className: 'dsh-3d-tool-chip' }, result.operation) : null,
          result.model ? h('span', { className: 'dsh-3d-muted' }, result.model) : null,
          status || result.status ? h('span', { className: 'dsh-3d-muted' }, status || result.status) : null),
        preview ? h(ModelPreview, { src: preview, height: 360, mediaType: result.mediaType }) : h('div', { className: 'dsh-3d-muted' }, status === 'failed' ? '任务失败' : '正在生成 3D 模型…'),
        result.error ? h('div', { className: 'dsh-3d-chat-result-error' }, result.error) : null,
        result.localFile ? h('div', { className: 'dsh-3d-muted' }, `已保存：${String(result.localFile).split(/[\\\\/]/).pop()}`) : null);
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
        let failures = 0;
        const timer = setInterval(async () => {
          try {
            const data = await api(`/task?provider=${encodeURIComponent(result.provider)}&taskId=${encodeURIComponent(result.taskId)}&operation=${encodeURIComponent(result.operation || '')}`);
            if (cancelled) return;
            failures = 0;
            setStatus(data.result.status);
            if (data.result.previewUrl) setPreview(data.result.previewUrl);
            if (['success', 'failed', 'cancelled', 'unknown'].includes(data.result.status)) clearInterval(timer);
          } catch {
            failures += 1;
            if (failures >= 3) {
              clearInterval(timer);
              setResult((current) => (current ? { ...current, error: current.error || '任务查询失败' } : current));
            }
          }
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
        preview ? h('div', { className: 'dsh-3d-muted' }, '3D 预览已显示在对话中。') : null,
        result.localFile ? h('div', { className: 'dsh-3d-muted' }, `已保存：${String(result.localFile).split(/[\\\\/]/).pop()}`) : null);
    }

    const RESULT_NODE_KIND = 'dsh-tripo-result';

    function resultMeta(value) {
      if (!value || typeof value !== 'object' || value.kind !== 'dsh-tripo-support') return null;
      if (!value.taskId && !value.previewUrl && !value.localFile) return null;
      return value;
    }

    function create3DResultDefinition() {
      return {
        kind: RESULT_NODE_KIND,
        target: 'chat',
        match: (event) => {
          if (event.type !== 'tool/result') return null;
          const turn = event.data?.turn;
          if (typeof turn !== 'number' || !Number.isSafeInteger(turn) || turn < 0) return null;
          if (!resultMeta(event.data?.meta)) return null;
          return { id: `result:${event.seq}`, role: 'start' };
        },
        start: (_context, match) => {
          const turn = match.event.data?.turn;
          const result = resultMeta(match.event.data?.meta);
          if (typeof turn !== 'number' || !result) throw new Error('dsh-tripo-result requires a 3D tool result');
          return { turn, result, seq: match.event.seq };
        },
        update: (context) => context.state,
        buildViewNode: (context) => {
          if (!context.state?.result) return null;
          return {
            key: context.key,
            kind: RESULT_NODE_KIND,
            id: context.id,
            target: 'chat',
            anchorSeq: context.state.seq,
            location: { kind: 'session' },
            visibility: 'visible',
            data: { turn: context.state.turn, result: context.state.result },
          };
        },
      };
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          const style = document.createElement('style');
          style.dataset.plugin = 'dsh-tripo-support';
          style.textContent = `${CSS}\n${WORKSHOP_CSS}`;
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
        ctx.slots.inject('conversation.view', () => ctx.slots.register({
          name: 'conversation.view',
          id: 'dsh-tripo-workshop',
          order: 26,
          label: () => '3D 工坊',
        }, WorkshopView));
        for (const key of ['create_3d_task', 'run_3d_operation', 'generate_3d', 'wait_3d_task']) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({ name: 'tool.call.toolview', key }, ToolPreview));
        }
        ctx.inject(['uiConversation'], (owner) => {
          const uiConversation = owner.uiConversation || owner.get?.('uiConversation');
          if (!uiConversation?.events?.register) return;
          owner.effect(() => uiConversation.events.register(create3DResultDefinition()), 'dsh-tripo-support: chat result node');
          owner.slots.inject('conversation.chat.node', () => owner.slots.register({ name: 'conversation.chat.node', key: RESULT_NODE_KIND }, ChatResultNode));
        });
      },
    };
  },
});


























