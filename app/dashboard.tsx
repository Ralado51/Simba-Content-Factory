"use client";

import { useMemo, useState } from "react";

type View =
  | "Visão geral"
  | "Vídeos"
  | "Aprovações"
  | "Calendário"
  | "Publicações"
  | "Configurações";

type ClipStatus = "Aguardando" | "Aprovado" | "Rejeitado";

const navItems: { label: View; icon: string }[] = [
  { label: "Visão geral", icon: "⌂" },
  { label: "Vídeos", icon: "▶" },
  { label: "Aprovações", icon: "✓" },
  { label: "Calendário", icon: "□" },
  { label: "Publicações", icon: "↗" },
  { label: "Configurações", icon: "⚙" },
];

const clipsSeed = [
  {
    id: 1,
    title: "Simba descobriu o edredom perfeito",
    source: "20250926_203516.mp4",
    duration: "00:30",
    category: "Fofo",
    score: 94,
    platform: "Shorts · Reels · TikTok",
    status: "Aguardando" as ClipStatus,
    color: "blue",
  },
  {
    id: 2,
    title: "A reação quando o humano levanta",
    source: "simba_cama_02.mp4",
    duration: "00:15",
    category: "Engraçado",
    score: 89,
    platform: "Shorts · Reels",
    status: "Aguardando" as ClipStatus,
    color: "coral",
  },
  {
    id: 3,
    title: "O melhor lugar para ficar quentinho",
    source: "simba_frio_04.mp4",
    duration: "01:00",
    category: "Curioso",
    score: 82,
    platform: "TikTok · Reels",
    status: "Aguardando" as ClipStatus,
    color: "aqua",
  },
];

const videos = [
  ["20250926_203516.mp4", "Processando", "285 MB", "02:18", "Hoje, 15:42"],
  ["simba_cama_02.mp4", "Analisado", "164 MB", "01:04", "Hoje, 14:08"],
  ["simba_frio_04.mp4", "Aguardando aprovação", "198 MB", "01:46", "Ontem, 20:31"],
  ["simba_petisco_07.mp4", "Publicado", "92 MB", "00:54", "16 jul, 18:15"],
  ["simba_janela_01.mp4", "Erro", "231 MB", "03:11", "15 jul, 10:22"],
];

function StatCard({ value, label, delta, accent }: { value: string; label: string; delta: string; accent: string }) {
  return (
    <article className="stat-card">
      <div className={`stat-mark ${accent}`} />
      <div>
        <span className="eyebrow">{label}</span>
        <div className="stat-row"><strong>{value}</strong><span>{delta}</span></div>
      </div>
    </article>
  );
}

function StatusPill({ children }: { children: string }) {
  const cls = children.toLowerCase().replaceAll(" ", "-").replace("ç", "c").replace("ã", "a");
  return <span className={`status ${cls}`}>{children}</span>;
}

function Overview({ onOpenApprovals }: { onOpenApprovals: () => void }) {
  return (
    <>
      <section className="hero-row">
        <div>
          <span className="kicker"><i /> PIPELINE ATIVO</span>
          <h1>Sua fábrica de conteúdo<br /><em>está trabalhando.</em></h1>
          <p>Do vídeo bruto à publicação, com aprovação humana em cada decisão.</p>
        </div>
        <button className="primary-button" onClick={onOpenApprovals}>Revisar 3 cortes <span>→</span></button>
      </section>

      <section className="stats-grid">
        <StatCard value="12" label="VÍDEOS ESTE MÊS" delta="+4" accent="blue" />
        <StatCard value="3" label="AGUARDANDO APROVAÇÃO" delta="agora" accent="coral" />
        <StatCard value="8" label="PUBLICADOS" delta="+18%" accent="aqua" />
        <StatCard value="48,2 mil" label="VISUALIZAÇÕES" delta="+24%" accent="violet" />
      </section>

      <section className="overview-grid">
        <article className="panel pipeline-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">ATIVIDADE</span><h2>Pipeline agora</h2></div>
            <button className="text-button">Ver todos</button>
          </div>
          <div className="pipeline-list">
            <div className="pipeline-item active">
              <div className="job-icon blue">▶</div>
              <div className="job-main"><strong>20250926_203516.mp4</strong><span>Detectando cenas e movimento</span><div className="progress"><i style={{ width: "68%" }} /></div></div>
              <span className="percent">68%</span>
            </div>
            <div className="pipeline-item">
              <div className="job-icon coral">W</div>
              <div className="job-main"><strong>simba_cama_02.mp4</strong><span>Transcrição concluída</span></div>
              <StatusPill>Concluído</StatusPill>
            </div>
            <div className="pipeline-item">
              <div className="job-icon aqua">AI</div>
              <div className="job-main"><strong>simba_frio_04.mp4</strong><span>3 momentos selecionados</span></div>
              <StatusPill>Revisar</StatusPill>
            </div>
          </div>
        </article>

        <article className="panel performance-card">
          <div className="panel-heading"><div><span className="eyebrow">DESEMPENHO</span><h2>Últimos 7 dias</h2></div><span className="trend">↗ 24%</span></div>
          <div className="chart">
            {[34, 48, 42, 72, 58, 88, 76].map((h, i) => <i key={i} style={{ height: `${h}%` }} className={i === 5 ? "peak" : ""} />)}
          </div>
          <div className="chart-labels"><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span><span>DOM</span></div>
          <div className="best"><span className="mini-thumb">S</span><div><span>Melhor conteúdo</span><strong>Simba e o edredom</strong></div><b>18,4 mil</b></div>
        </article>
      </section>

      <section className="panel approval-strip">
        <div className="panel-heading"><div><span className="eyebrow">PRÓXIMOS PASSOS</span><h2>Cortes aguardando você</h2></div><button className="text-button" onClick={onOpenApprovals}>Abrir fila →</button></div>
        <div className="clip-cards">
          {clipsSeed.map((clip) => <ClipMini key={clip.id} clip={clip} />)}
        </div>
      </section>
    </>
  );
}

function ClipMini({ clip }: { clip: typeof clipsSeed[number] }) {
  return (
    <div className="clip-mini">
      <div className={`clip-visual ${clip.color}`}><span>SIMBA</span><button aria-label="Reproduzir">▶</button><small>{clip.duration}</small></div>
      <div className="clip-copy"><strong>{clip.title}</strong><div><span>{clip.category}</span><b>{clip.score}</b></div></div>
    </div>
  );
}

function VideosView() {
  const [filter, setFilter] = useState("Todos");
  const filtered = filter === "Todos" ? videos : videos.filter((video) => video[1] === filter);
  return (
    <section className="page-section">
      <div className="page-title"><div><span className="eyebrow">BIBLIOTECA</span><h1>Vídeos</h1><p>Acompanhe cada arquivo desde a chegada até a publicação.</p></div><button className="primary-button">+ Adicionar vídeo</button></div>
      <div className="toolbar">
        <div className="tabs">{["Todos", "Processando", "Aguardando aprovação", "Publicado", "Erro"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <label className="search">⌕ <input placeholder="Buscar vídeo" /></label>
      </div>
      <div className="table-card">
        <div className="table-row table-head"><span>ARQUIVO</span><span>STATUS</span><span>TAMANHO</span><span>DURAÇÃO</span><span>ATUALIZADO</span><span /></div>
        {filtered.map((video, index) => <div className="table-row" key={video[0]}><span className="file-cell"><i className={`file-thumb c${index % 4}`}>▶</i><strong>{video[0]}</strong></span><span><StatusPill>{video[1]}</StatusPill></span><span>{video[2]}</span><span>{video[3]}</span><span>{video[4]}</span><button className="more">•••</button></div>)}
      </div>
    </section>
  );
}

function ApprovalsView() {
  const [clips, setClips] = useState(clipsSeed);
  const [selectedId, setSelectedId] = useState(1);
  const [notice, setNotice] = useState("");
  const selected = clips.find((clip) => clip.id === selectedId) ?? clips[0];
  const updateStatus = (status: ClipStatus) => {
    setClips((current) => current.map((clip) => clip.id === selected.id ? { ...clip, status } : clip));
    setNotice(status === "Aprovado" ? "Corte aprovado e enviado para a fila de publicação." : "Corte rejeitado e retirado da fila.");
  };
  const pending = clips.filter((clip) => clip.status === "Aguardando").length;
  return (
    <section className="page-section">
      <div className="page-title"><div><span className="eyebrow">FILA DE DECISÃO</span><h1>Aprovações <sup>{pending}</sup></h1><p>Revise o corte, ajuste os textos e decida quando publicar.</p></div></div>
      {notice && <div className="notice" role="status"><span>✓</span>{notice}<button onClick={() => setNotice("")}>×</button></div>}
      <div className="approval-workspace">
        <div className="approval-queue">
          {clips.map((clip) => <button key={clip.id} className={selected.id === clip.id ? "selected" : ""} onClick={() => setSelectedId(clip.id)}><span className={`queue-thumb ${clip.color}`}>▶</span><span><strong>{clip.title}</strong><small>{clip.duration} · Nota {clip.score}</small></span><StatusPill>{clip.status}</StatusPill></button>)}
        </div>
        <div className={`video-stage ${selected.color}`}><span className="stage-brand">SIMBA</span><button className="play" aria-label="Reproduzir vídeo">▶</button><div className="caption">quando você encontra<br /><b>o lugar perfeito</b></div><div className="timeline"><i /></div></div>
        <div className="editor-panel">
          <div className="score-row"><span className="score-badge">{selected.score}</span><div><strong>Alto potencial</strong><small>Momento fofo com reação clara e final forte.</small></div></div>
          <label>Título<input defaultValue={selected.title} /></label>
          <label>Descrição<textarea defaultValue="Simba não pode ver um edredom dando bobeira. O melhor lugar sempre é debaixo dele, pertinho do humano. 🐾" /></label>
          <label>Hashtags<input defaultValue="#Simba #Pets #CachorroFofo #Shorts" /></label>
          <div className="platform-checks"><label><input type="checkbox" defaultChecked /> YouTube</label><label><input type="checkbox" defaultChecked /> Instagram</label><label><input type="checkbox" defaultChecked /> TikTok</label></div>
          <div className="decision-row"><button className="reject" onClick={() => updateStatus("Rejeitado")}>Rejeitar</button><button className="secondary">Refazer</button><button className="approve" onClick={() => updateStatus("Aprovado")}>Aprovar corte</button></div>
        </div>
      </div>
    </section>
  );
}

function CalendarView() {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  return <section className="page-section"><div className="page-title"><div><span className="eyebrow">PLANEJAMENTO</span><h1>Calendário</h1><p>Distribua os conteúdos sem disputar atenção entre plataformas.</p></div><button className="primary-button">+ Agendar publicação</button></div><div className="calendar-card"><div className="calendar-top"><button>←</button><h2>Julho 2026</h2><button>→</button></div><div className="weekdays">{["DOM","SEG","TER","QUA","QUI","SEX","SÁB"].map(d => <span key={d}>{d}</span>)}</div><div className="calendar-grid">{days.map((day, i) => <div key={i} className={day < 1 || day > 31 ? "muted" : day === 18 ? "today" : ""}><b>{day < 1 ? 30 + day : day > 31 ? day - 31 : day}</b>{day === 18 && <><span className="event youtube">18:00 · Shorts</span><span className="event instagram">20:30 · Reels</span></>}{day === 20 && <span className="event tiktok">19:15 · TikTok</span>}{day === 23 && <span className="event youtube">18:30 · Shorts</span>}</div>)}</div></div></section>;
}

function PublicationsView() {
  return <section className="page-section"><div className="page-title"><div><span className="eyebrow">DISTRIBUIÇÃO</span><h1>Publicações</h1><p>Status, links e desempenho de cada conteúdo publicado.</p></div></div><div className="publication-grid">{[
    ["Simba e o edredom", "YouTube Shorts", "Publicado", "18,4 mil", "1.240", "98"],
    ["A cara de quem quer petisco", "Instagram Reels", "Publicado", "12,7 mil", "934", "61"],
    ["Quem manda nessa casa?", "TikTok", "Agendado", "—", "—", "—"],
  ].map((item, i) => <article className="publication-card" key={item[0]}><div className={`publication-cover c${i}`}><span>SIMBA</span><small>{item[1]}</small></div><div className="publication-body"><StatusPill>{item[2]}</StatusPill><h3>{item[0]}</h3><div className="metric-row"><span><b>{item[3]}</b> visualizações</span><span><b>{item[4]}</b> curtidas</span><span><b>{item[5]}</b> comentários</span></div><button className="secondary full">Ver detalhes ↗</button></div></article>)}</div></section>;
}

function SettingsView() {
  const [saved, setSaved] = useState(false);
  return <section className="page-section"><div className="page-title"><div><span className="eyebrow">PREFERÊNCIAS</span><h1>Configurações</h1><p>Controle o estilo e os limites da fábrica de conteúdo.</p></div></div><div className="settings-grid"><div className="settings-nav"><button className="active">Processamento</button><button>OneDrive</button><button>Identidade visual</button><button>Plataformas</button><button>Modelos de IA</button></div><form className="settings-form" onSubmit={(e) => { e.preventDefault(); setSaved(true); }}><h2>Processamento de vídeo</h2><p>Defina como os novos cortes serão gerados.</p><div className="field-grid"><label>Durações padrão<select defaultValue="15, 30 e 60 segundos"><option>15, 30 e 60 segundos</option><option>15 e 30 segundos</option></select></label><label>Nota mínima<select defaultValue="75"><option>75</option><option>80</option><option>85</option></select></label></div>{["Acompanhar o Simba no enquadramento", "Adicionar legendas animadas", "Normalizar volume", "Aplicar logo discreto", "Adicionar tela final"].map((item, i) => <label className="toggle-row" key={item}><span><strong>{item}</strong><small>{i === 0 ? "Usa detecção visual para manter o Simba no quadro vertical." : "Aplicado automaticamente aos novos cortes."}</small></span><input type="checkbox" defaultChecked={i !== 4} /></label>)}<button className="primary-button" type="submit">{saved ? "Configurações salvas ✓" : "Salvar alterações"}</button></form></div></section>;
}

export default function Dashboard({ displayName }: { displayName: string }) {
  const [view, setView] = useState<View>("Visão geral");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const firstName = useMemo(() => displayName.split(/[ @]/)[0], [displayName]);
  return (
    <main className="app-shell">
      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <div className="brand"><span className="brand-mark">S</span><div><strong>SIMBA</strong><small>CONTENT FACTORY</small></div></div>
        <nav>{navItems.map((item) => <button key={item.label} className={view === item.label ? "active" : ""} onClick={() => { setView(item.label); setSidebarOpen(false); }}><span>{item.icon}</span>{item.label}{item.label === "Aprovações" && <b>3</b>}</button>)}</nav>
        <div className="system-card"><span><i /> SISTEMA ONLINE</span><strong>Todos os serviços ativos</strong><small>n8n · Whisper · Ollama</small></div>
        <div className="sidebar-footer"><span className="avatar">AJ</span><div><strong>{firstName}</strong><small>Administrador</small></div><button>•••</button></div>
      </aside>
      <section className="main-area">
        <header><button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button><div><span>SIMBA CONTENT FACTORY</span><b>/</b><strong>{view}</strong></div><div className="header-actions"><button aria-label="Pesquisar">⌕</button><button aria-label="Notificações" className="notification">♢<i /></button><span className="date">18 JUL 2026</span></div></header>
        <div className="content-wrap">
          {view === "Visão geral" && <Overview onOpenApprovals={() => setView("Aprovações")} />}
          {view === "Vídeos" && <VideosView />}
          {view === "Aprovações" && <ApprovalsView />}
          {view === "Calendário" && <CalendarView />}
          {view === "Publicações" && <PublicationsView />}
          {view === "Configurações" && <SettingsView />}
        </div>
      </section>
    </main>
  );
}
