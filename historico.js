(function(){
  const STORAGE_KEY = 'historicoTimesDataV1';
  const state = {
    teams: [],
    editMode: false,
    tiebreaker: 'asc', // asc = menos vices primeiro
    search: ''
  };

  const initialTeams = [
    // Dados ilustrativos para demonstração. Ajuste no modo edição.
    { id: 'PAL', name: 'Palmeiras', titles: 12, vices: 4, relegations: 2, color: '#a7f3d0' },
    { id: 'FLA', name: 'Flamengo', titles: 8, vices: 5, relegations: 0, color: '#fecaca' },
    { id: 'SAN', name: 'Santos', titles: 8, vices: 6, relegations: 1, color: '#e5e7eb' },
    { id: 'COR', name: 'Corinthians', titles: 7, vices: 2, relegations: 1, color: '#d1d5db' },
    { id: 'SAO', name: 'São Paulo', titles: 6, vices: 4, relegations: 0, color: '#fee2e2' },
    { id: 'CRU', name: 'Cruzeiro', titles: 4, vices: 5, relegations: 1, color: '#bfdbfe' },
    { id: 'VAS', name: 'Vasco', titles: 4, vices: 3, relegations: 4, color: '#fde68a' },
    { id: 'FLU', name: 'Fluminense', titles: 4, vices: 2, relegations: 2, color: '#bbf7d0' },
    { id: 'INT', name: 'Internacional', titles: 3, vices: 6, relegations: 1, color: '#fecaca' },
    { id: 'CAM', name: 'Atlético Mineiro', titles: 2, vices: 6, relegations: 1, color: '#e5e7eb' },
    { id: 'GRE', name: 'Grêmio', titles: 2, vices: 3, relegations: 3, color: '#bae6fd' },
    { id: 'BOT', name: 'Botafogo', titles: 2, vices: 3, relegations: 3, color: '#e5e7eb' },
    { id: 'BAH', name: 'Bahia', titles: 2, vices: 1, relegations: 4, color: '#ddd6fe' },
    { id: 'CAP', name: 'Athletico-PR', titles: 0, vices: 1, relegations: 1, color: '#fecaca' },
    { id: 'FOR', name: 'Fortaleza', titles: 0, vices: 0, relegations: 2, color: '#bae6fd' }
  ];

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.teams));
  }
  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed)){
          return parsed;
        }
      }
    } catch(err){}
    return initialTeams;
  }

  function sortTeams(list){
    const tiebreak = state.tiebreaker;
    return [...list].sort((a,b)=>{
      if(b.titles !== a.titles) return b.titles - a.titles; // desc
      if(tiebreak === 'asc'){
        if(a.vices !== b.vices) return a.vices - b.vices; // menos vices primeiro
      } else {
        if(a.vices !== b.vices) return b.vices - a.vices; // mais vices primeiro
      }
      if(a.relegations !== b.relegations) return a.relegations - b.relegations; // menos rebaixamentos
      return a.name.localeCompare(b.name);
    });
  }

  function filteredTeams(){
    const q = state.search.trim().toLowerCase();
    const list = q
      ? state.teams.filter(t => t.name.toLowerCase().includes(q))
      : state.teams;
    return sortTeams(list);
  }

  function render(){
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    const data = filteredTeams();
    data.forEach((t, idx)=>{
      const tr = document.createElement('tr');

      // posição
      const tdPos = document.createElement('td');
      tdPos.className = 'pos';
      tdPos.textContent = idx + 1;

      // time
      const tdTeam = document.createElement('td');
      tdTeam.className = 'team';
      const teamDiv = document.createElement('div');
      teamDiv.className = 'team-cell';

      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.style.background = t.color || '#e5e7eb';
      badge.textContent = (t.id || t.name.substring(0,3)).toUpperCase();

      const info = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'team-name';
      name.textContent = t.name;
      const sub = document.createElement('div');
      sub.className = 'team-sub';
      sub.textContent = `ID: ${t.id}`;
      info.appendChild(name);
      info.appendChild(sub);

      teamDiv.appendChild(badge);
      teamDiv.appendChild(info);
      tdTeam.appendChild(teamDiv);

      // números
      const tdTitles = makeNumberCell(t, 'titles');
      const tdVices  = makeNumberCell(t, 'vices');
      const tdRelegs = makeNumberCell(t, 'relegations');

      tr.appendChild(tdPos);
      tr.appendChild(tdTeam);
      tr.appendChild(tdTitles);
      tr.appendChild(tdVices);
      tr.appendChild(tdRelegs);

      tbody.appendChild(tr);
    });
  }

  function makeNumberCell(team, key){
    const td = document.createElement('td');
    td.className = 'num';
    if(state.editMode){
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = '1';
      input.className = 'editable';
      input.value = Number(team[key] || 0);
      input.addEventListener('change', ()=>{
        team[key] = Math.max(0, parseInt(input.value || '0', 10));
        save();
        render(); // reordenar e atualizar posição
      });
      td.appendChild(input);
    } else {
      td.textContent = Number(team[key] || 0).toString();
    }
    return td;
  }

  function bindUI(){
    const searchInput = document.getElementById('searchInput');
    const editToggle = document.getElementById('editToggle');
    const tiebreakSelect = document.getElementById('tiebreakSelect');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    const resetBtn = document.getElementById('resetBtn');

    searchInput.addEventListener('input', (e)=>{
      state.search = e.target.value;
      render();
    });

    editToggle.addEventListener('change', (e)=>{
      state.editMode = e.target.checked;
      render();
    });

    tiebreakSelect.addEventListener('change', (e)=>{
      state.tiebreaker = e.target.value;
      render();
    });

    exportBtn.addEventListener('click', ()=>{
      const dataStr = JSON.stringify(state.teams, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historico-times.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    importFile.addEventListener('change', async (e)=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if(!Array.isArray(parsed)) throw new Error('JSON inválido');
        // validação básica
        const normalized = parsed.map(p=>({
          id: String(p.id||'').toUpperCase().slice(0,5),
          name: String(p.name||''),
          titles: Math.max(0, parseInt(p.titles||0,10)),
          vices: Math.max(0, parseInt(p.vices||0,10)),
          relegations: Math.max(0, parseInt(p.relegations||0,10)),
          color: String(p.color||'#e5e7eb')
        })).filter(p=>p.name);
        if(normalized.length === 0) throw new Error('Lista vazia');
        state.teams = normalized;
        save();
        render();
      } catch(err){
        alert('Falha ao importar: ' + (err && err.message ? err.message : 'erro desconhecido'));
      } finally {
        e.target.value = '';
      }
    });

    resetBtn.addEventListener('click', ()=>{
      if(confirm('Restaurar os dados iniciais ilustrativos?')){
        state.teams = initialTeams.map(t=>({...t}));
        save();
        render();
      }
    });
  }

  function init(){
    state.teams = load().map(t=>({...t}));
    bindUI();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
