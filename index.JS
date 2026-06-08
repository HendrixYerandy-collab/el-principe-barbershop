// ══════════════════════════════
//  index.js — El Príncipe Barbershop
//  Frontend principal
// ══════════════════════════════

var S   = { svc: null, price: null, date: null, time: null, calY: new Date().getFullYear(), calM: new Date().getMonth() };
var API = 'http://localhost:3000/api';

var MN = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
          'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
var DN = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

var MESES_NUM = {
  'Ene':'01','Feb':'02','Mar':'03','Abr':'04','May':'05','Jun':'06',
  'Jul':'07','Ago':'08','Sep':'09','Oct':'10','Nov':'11','Dic':'12'
};

// ── SERVICIOS ────────────────────────────────
var SERVICIOS = [
  { id:1,  nombre:'Corte de pelo',           precio:'RD$600', img:'backend/17cbcdb2fe294491cf3848b11be0eaef.jpg',   emoji:'✂'  },
  { id:2,  nombre:'Corte + barba',           precio:'RD$600', img:'backend/Fotos/Corte barba.jpg',                emoji:'🪒' },
  { id:3,  nombre:'Afeitado',                precio:'RD$400', img:'backend/Fotos/0df35a405a583d650b561657a15b5933.jpg', emoji:'💈' },
  { id:4,  nombre:'Diseño barba',            precio:'RD$300', img:'backend/Fotos/Barba.jpg',                      emoji:'✨' },
  { id:5,  nombre:'Corte afeitada y facial', precio:'RD$800', img:'backend/Fotos/316d070964cd8674c526d767d58c9823.jpg', emoji:'⭐' },
  { id:6,  nombre:'Cerquillo',               precio:'RD$300', img:'backend/Fotos/Cerquillo.jpg',                  emoji:'💇' },
  { id:7,  nombre:'Facial',                  precio:'RD$500', img:'backend/Fotos/Facial.jpg',                     emoji:'🧖' },
  { id:8,  nombre:'Vapor facial',            precio:'RD$600', img:'backend/Fotos/Vapor.jpg',                      emoji:'♨️' },
  { id:9,  nombre:'Manos',                   precio:'RD$400', img:'',                                             emoji:'💅' },
  { id:10, nombre:'Pies',                    precio:'RD$500', img:'',                                             emoji:'🦶' },
  { id:11, nombre:'Lavado de cabeza',        precio:'RD$?',   img:'backend/Fotos/Lavado.jpg',                     emoji:'🚿' },
  { id:12, nombre:'Tintado',                 precio:'RD$?',   img:'backend/Fotos/Tinte.jpg',                      emoji:'🖌️'},
  { id:13, nombre:'Corte a tijera',          precio:'RD$700', img:'backend/Fotos/Tijera.jpg',                     emoji:'✂️' },
  { id:14, nombre:'Diseños',                 precio:'RD$?',   img:'backend/Fotos/Dise;o.jpg',                     emoji:'🔥' },
  { id:15, nombre:'Macarilla',               precio:'RD$?',   img:'backend/Fotos/Macarilla.jpg',                  emoji:'🧴' }
];

// ── DÍAS BLOQUEADOS ──────────────────────────
function getDiasBloqueados() {
  try { return JSON.parse(localStorage.getItem('ep_dias_bloqueados') || '[]'); } catch(e) { return []; }
}
function saveDiasBloqueados(dias) {
  try { localStorage.setItem('ep_dias_bloqueados', JSON.stringify(dias)); } catch(e) {}
}

// ── IMAGEN CON FALLBACK ──────────────────────
function mkImgEl(s, cls, h) {
  if (s.img) {
    return '<img src="'+s.img+'" class="'+cls+'" style="height:'+h+'px;" onerror="this.outerHTML=\'<div class=svc-img-placeholder style=height:'+h+'px>'+s.emoji+'</div>\'" />';
  }
  return '<div class="svc-img-placeholder" style="height:'+h+'px;">'+s.emoji+'</div>';
}

// ── RENDERIZAR SERVICIOS ─────────────────────
function renderServicios() {
  var menuGrid = document.getElementById('menu-servicios');
  if (menuGrid) {
    menuGrid.innerHTML = '';
    SERVICIOS.forEach(function(s) {
      var div = document.createElement('div');
      div.className = 'svc-card';
      div.innerHTML = mkImgEl(s,'svc-img',110)+'<div class="svc-info"><div class="svc-name">'+s.nombre+'</div><div class="svc-price">'+s.precio+'</div></div>';
      div.onclick = function() { goAgenda(s.nombre, s.precio); };
      menuGrid.appendChild(div);
    });
  }
  var agendaGrid = document.getElementById('agenda-servicios');
  if (agendaGrid) {
    agendaGrid.innerHTML = '';
    SERVICIOS.forEach(function(s) {
      var div = document.createElement('div');
      div.className = 'ag-sc';
      var imgHtml = s.img
        ? '<img src="'+s.img+'" style="width:34px;height:34px;border-radius:7px;object-fit:cover;" onerror="this.outerHTML=\'<div class=ag-si2>'+s.emoji+'</div>\'" />'
        : '<div class="ag-si2">'+s.emoji+'</div>';
      div.innerHTML = imgHtml+'<div class="ag-sinfo"><div class="ag-sn2">'+s.nombre+'</div><div class="ag-sp">'+s.precio+'</div></div><div class="ag-ck">✓</div>';
      div.onclick = function() {
        document.querySelectorAll('.ag-sc').forEach(function(c){ c.classList.remove('sel'); });
        div.classList.add('sel');
        S.svc   = s.nombre;
        S.price = s.precio;
        S.id_servicio = s.id;
      };
      agendaGrid.appendChild(div);
    });
  }
}

// ── VISTAS ──────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}
function goHome()  { showView('view-home'); }
function goLogin() { showView('view-login'); }
function goSec(secId) {
  showView('view-home');
  setTimeout(function(){
    var el = document.getElementById(secId);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  }, 80);
}
function goAgenda(svc, price) {
  showView('view-agenda');
  if (svc && price) {
    setTimeout(function(){
      document.querySelectorAll('.ag-sc').forEach(function(c){ c.classList.remove('sel'); });
      document.querySelectorAll('.ag-sc').forEach(function(c){
        var n = c.querySelector('.ag-sn2');
        if (n && n.textContent === svc) {
          c.classList.add('sel');
          var sv = SERVICIOS.find(function(x){ return x.nombre === svc; });
          S.svc   = svc;
          S.price = price;
          S.id_servicio = sv ? sv.id : 1;
        }
      });
    }, 50);
  }
}

// ── NAVEGACIÓN DE PASOS ──────────────────────
function agGoTo(step) {
  if (step === 2 && !S.svc)  { flash('ab1'); toast('Selecciona un servicio primero.', 'warn'); return; }
  if (step === 3) {
    if (!S.date) { flash('ab2'); toast('Selecciona una fecha.', 'warn'); return; }
    if (!S.time) { flash('ab2'); toast('Selecciona un horario.', 'warn'); return; }
    document.getElementById('ss').textContent  = S.svc;
    document.getElementById('sd').textContent  = S.date;
    document.getElementById('sh').textContent  = S.time;
    document.getElementById('sp2').textContent = S.price;
  }
  document.querySelectorAll('.ag-panel').forEach(function(p){ p.classList.remove('active'); });
  document.getElementById('ap'+step).classList.add('active');
  updAgBar(step);
  window.scrollTo(0,0);
}
function flash(id) {
  var b = document.getElementById(id);
  if (!b) return;
  b.style.opacity = '0.4';
  b.style.transform = 'scale(0.97)';
  setTimeout(function(){ b.style.opacity = ''; b.style.transform = ''; }, 500);
}
function updAgBar(step) {
  for (var i = 1; i <= 3; i++) {
    var si = document.getElementById('asi-'+i);
    var sn = document.getElementById('asn-'+i);
    if (!si || !sn) continue;
    si.classList.remove('active','done');
    sn.classList.remove('active','done');
    if (i < step)       { si.classList.add('done'); sn.classList.add('done'); }
    else if (i === step){ si.classList.add('active'); sn.classList.add('active'); }
  }
}

// ── TOAST NOTIFICACIONES ─────────────────────
function toast(msg, tipo) {
  var t = document.getElementById('toast-global');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast-global';
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);z-index:9999;padding:12px 22px;border-radius:10px;font-size:13px;font-family:DM Sans,sans-serif;font-weight:500;opacity:0;transition:all 0.3s;pointer-events:none;max-width:320px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.2);';
    document.body.appendChild(t);
  }
  var bg = tipo === 'ok' ? '#2d7a4e' : tipo === 'warn' ? '#b07820' : '#c0392b';
  t.style.background = bg;
  t.style.color = '#fff';
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(function(){
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(10px)';
  }, 3000);
}

// ── CALENDARIO ──────────────────────────────
function chMo(d) {
  S.calM += d;
  if (S.calM > 11) { S.calM = 0; S.calY++; }
  if (S.calM < 0)  { S.calM = 11; S.calY--; }
  // No permitir ir al pasado
  var hoy = new Date();
  if (S.calY < hoy.getFullYear() || (S.calY === hoy.getFullYear() && S.calM < hoy.getMonth())) {
    S.calM += (d > 0 ? -1 : 1);
    if (S.calM > 11) { S.calM = 0; S.calY++; }
    if (S.calM < 0)  { S.calM = 11; S.calY--; }
    return;
  }
  renderCal();
}

function renderCal() {
  var lbl = document.getElementById('cm-lbl');
  if (lbl) lbl.textContent = MN[S.calM] + ' ' + S.calY;
  var g = document.getElementById('dgrid');
  if (!g) return;
  g.innerHTML = '';

  DN.forEach(function(d) {
    var e = document.createElement('div');
    e.className = 'dl';
    e.textContent = d;
    g.appendChild(e);
  });

  var fd  = new Date(S.calY, S.calM, 1).getDay();
  var dim = new Date(S.calY, S.calM+1, 0).getDate();
  var today = new Date(); today.setHours(0,0,0,0);
  var bloqueados = getDiasBloqueados();

  for (var i = 0; i < fd; i++) {
    var e = document.createElement('div');
    e.className = 'dc';
    g.appendChild(e);
  }

  for (var d = 1; d <= dim; d++) {
    var cell = document.createElement('div');
    var dt   = new Date(S.calY, S.calM, d);
    var ds   = d + ' ' + MN[S.calM].substring(0,3) + ' ' + S.calY;
    var fechaISO = S.calY + '-' + String(S.calM+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    var esBloqueado = bloqueados.indexOf(fechaISO) > -1;

    if (dt < today) {
      cell.className = 'dc past';
    } else if (esBloqueado) {
      cell.className = 'dc bloqueado';
      cell.title = 'No disponible';
    } else {
      cell.className = 'dc avail';
      if (dt.toDateString() === today.toDateString()) cell.classList.add('today');
      if (S.date === ds) cell.classList.add('sel');
      (function(dss, el) {
        el.onclick = function() {
          S.date = dss;
          S.time = null;
          renderCal();
          renderTimes();
        };
      })(ds, cell);
    }
    cell.textContent = d;
    g.appendChild(cell);
  }
}

// ── HORARIOS ────────────────────────────────
function renderTimes() {
  var tg = document.getElementById('tgrid');
  if (!tg) return;

  var slots = [
    '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
    '12:00 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM',
    '4:30 PM','5:00 PM','5:30 PM','6:00 PM'
  ];

  if (!S.date) {
    tg.innerHTML = '';
    slots.forEach(function(t) {
      var btn = document.createElement('button');
      btn.className = 'tbtn unavail';
      btn.textContent = t;
      btn.disabled = true;
      tg.appendChild(btn);
    });
    return;
  }

  tg.innerHTML = '<p style="grid-column:span 4;text-align:center;padding:1rem;color:#aaa;font-size:12px;">Cargando horarios...</p>';

  var pf = S.date.split(' ');
  var fechaSQL = pf[2] + '-' + MESES_NUM[pf[1]] + '-' + pf[0].padStart(2,'0');

  fetch(API + '/citas/horarios/' + fechaSQL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var ocupados = data.ok ? data.ocupados : [];
      tg.innerHTML = '';
      slots.forEach(function(t) {
        var btn = document.createElement('button');
        btn.className = 'tbtn';
        btn.textContent = t;

        // Convertir hora para comparar
        var hp = t.split(' '), hn = hp[0].split(':'), hh = parseInt(hn[0]);
        if (hp[1] === 'PM' && hh !== 12) hh += 12;
        if (hp[1] === 'AM' && hh === 12) hh = 0;
        var horaComp = hh.toString().padStart(2,'0') + ':' + hn[1];

        var estaOcupado = ocupados.some(function(o) { return o && o.substring(0,5) === horaComp; });

        if (estaOcupado) {
          btn.classList.add('unavail');
          btn.disabled = true;
          btn.title = 'Horario ocupado';
        } else {
          if (S.time === t) btn.classList.add('sel');
          btn.onclick = function() {
            S.time = t;
            document.querySelectorAll('.tbtn').forEach(function(b){ b.classList.remove('sel'); });
            btn.classList.add('sel');
          };
        }
        tg.appendChild(btn);
      });
    })
    .catch(function() {
      // Si el backend falla, mostrar todos disponibles
      tg.innerHTML = '';
      slots.forEach(function(t) {
        var btn = document.createElement('button');
        btn.className = 'tbtn';
        btn.textContent = t;
        if (S.time === t) btn.classList.add('sel');
        btn.onclick = function() {
          S.time = t;
          document.querySelectorAll('.tbtn').forEach(function(b){ b.classList.remove('sel'); });
          btn.classList.add('sel');
        };
        tg.appendChild(btn);
      });
    });
}

// ── CONFIRMAR CITA ───────────────────────────
function confirmar() {
  var name  = document.getElementById('in').value.trim();
  var phone = document.getElementById('ip').value.trim();
  var last  = document.getElementById('il').value.trim();

  if (!name || !phone) {
    if (!name)  document.getElementById('in').style.borderColor = 'rgba(200,50,50,0.7)';
    if (!phone) document.getElementById('ip').style.borderColor = 'rgba(200,50,50,0.7)';
    setTimeout(function(){
      document.getElementById('in').style.borderColor = '';
      document.getElementById('ip').style.borderColor = '';
    }, 1500);
    toast('Completa tu nombre y teléfono.', 'error');
    return;
  }

  var fullName = name + (last ? ' ' + last : '');

  // Deshabilitar botón mientras se procesa
  var btnConfirmar = document.querySelector('#ap3 .bp');
  if (btnConfirmar) { btnConfirmar.disabled = true; btnConfirmar.textContent = 'Guardando...'; }

  // Preparar datos para API
  var pf = S.date.split(' ');
  var fechaSQL = pf[2] + '-' + MESES_NUM[pf[1]] + '-' + pf[0].padStart(2,'0');
  var hp = S.time.split(' '), hn = hp[0].split(':'), hh = parseInt(hn[0]);
  if (hp[1] === 'PM' && hh !== 12) hh += 12;
  if (hp[1] === 'AM' && hh === 12) hh = 0;
  var horaSQL = hh.toString().padStart(2,'0') + ':' + hn[1] + ':00';

  var token = localStorage.getItem('ep_token');
  var headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  fetch(API + '/citas', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      nombre:      name,
      apellido:    last,
      telefono:    phone,
      id_servicio: S.id_servicio || 1,
      fecha_cita:  fechaSQL,
      hora_cita:   horaSQL
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (btnConfirmar) { btnConfirmar.disabled = false; btnConfirmar.textContent = 'Confirmar cita'; }
    if (!d.ok) {
      toast(d.error || 'No se pudo guardar la cita.', 'error');
      return;
    }

    // Mostrar ticket con turno real del servidor
    var numReal = d.numero_turno || 1;
    mostrarTicket(numReal, fullName);

    // Guardar en sesión local si está logueado
    var sesion = JSON.parse(localStorage.getItem('ep_sesion') || 'null');
    if (sesion) {
      var numStr = numReal < 10 ? '0'+numReal : ''+numReal;
      sesion.citas = sesion.citas || [];
      sesion.citas.push({
        turno:    numStr,
        nombre:   name,
        apellido: last,
        servicio: S.svc,
        fecha:    S.date,
        hora:     S.time,
        precio:   S.price,
        anio:     new Date().getFullYear()
      });
      localStorage.setItem('ep_sesion', JSON.stringify(sesion));
    }
  })
  .catch(function(err) {
    console.error('Error al confirmar:', err);
    if (btnConfirmar) { btnConfirmar.disabled = false; btnConfirmar.textContent = 'Confirmar cita'; }
    toast('Error de conexión con el servidor.', 'error');
  });
}

function mostrarTicket(num, fullName) {
  var numStr = num < 10 ? '0'+num : ''+num;

  document.getElementById('tkt-num').textContent   = numStr;
  document.getElementById('t-svc').textContent     = S.svc;
  document.getElementById('t-date').textContent    = S.date;
  document.getElementById('t-time').textContent    = S.time;
  document.getElementById('t-name').textContent    = fullName;
  document.getElementById('t-price').textContent   = S.price;

  // Barras de código de barras decorativas
  var bars = document.getElementById('tkt-bars');
  bars.innerHTML = '';
  [2,1,3,1,2,2,1,4,1,2,3,1,2,1,3,2,1,2,3,1].forEach(function(w, i) {
    var b = document.createElement('div');
    b.className = 'tkt-bar';
    b.style.width  = w + 'px';
    b.style.height = (16 + ((num*7 + i*13) % 18)) + 'px';
    bars.appendChild(b);
  });

  document.querySelectorAll('.ag-panel').forEach(function(p){ p.classList.remove('active'); });
  document.getElementById('ap4').classList.add('active');
  for (var i = 1; i <= 3; i++) {
    var sn = document.getElementById('asn-'+i);
    if (sn) { sn.classList.remove('active'); sn.classList.add('done'); }
  }
  window.scrollTo(0,0);
}

// ── WHATSAPP ─────────────────────────────────
function enviarWhatsApp() {
  var num    = document.getElementById('tkt-num').textContent;
  var svc    = document.getElementById('t-svc').textContent;
  var fecha  = document.getElementById('t-date').textContent;
  var hora   = document.getElementById('t-time').textContent;
  var nombre = document.getElementById('t-name').textContent;
  var precio = document.getElementById('t-price').textContent;
  var msg = '✂ *El Príncipe Barbershop*\n\n✅ *Cita confirmada*\n\n' +
    '👤 Cliente: ' + nombre + '\n💈 Servicio: ' + svc + '\n📅 Fecha: ' + fecha +
    '\n⏰ Hora: ' + hora + '\n🎫 Turno #' + num + '\n💰 Total: ' + precio +
    '\n\n📍 Santo Domingo, República Dominicana\n¡Te esperamos! 👑';
  window.open('https://wa.me/18298108866?text=' + encodeURIComponent(msg), '_blank');
}

// ── REINICIAR AGENDA ─────────────────────────
function resetAgenda() {
  var hoy = new Date();
  S = { svc:null, price:null, date:null, time:null, calY:hoy.getFullYear(), calM:hoy.getMonth(), id_servicio:null };
  document.querySelectorAll('.ag-sc').forEach(function(c){ c.classList.remove('sel'); });
  ['in','il','ip'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('.ag-panel').forEach(function(p){ p.classList.remove('active'); });
  document.getElementById('ap1').classList.add('active');
  updAgBar(1);
  renderCal();
  renderTimes();
  window.scrollTo(0,0);
}

// ── LOGIN / REGISTRO ─────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.login-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.login-form').forEach(function(f){ f.classList.remove('active'); });
  document.getElementById('tab-'+tab).classList.add('active');
  document.getElementById('form-'+tab).classList.add('active');
  document.getElementById('login-error').textContent = '';
  document.getElementById('reg-error').textContent   = '';
}

function iniciarSesion() {
  var email = document.getElementById('login-email').value.trim();
  var pass  = document.getElementById('login-pass').value;
  var err   = document.getElementById('login-error');
  err.textContent = '';

  if (!email || !pass) { err.textContent = 'Completa todos los campos.'; return; }

  var btn = document.querySelector('#form-login .bp');
  if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }

  fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: pass })
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    if (!d.ok) { err.textContent = d.error; return; }
    localStorage.setItem('ep_token',  d.token);
    localStorage.setItem('ep_sesion', JSON.stringify(d.usuario));
    activarNavUsuario(d.usuario);
    if (d.usuario.es_admin) { irAdmin(); }
    else                    { cargarMisCitasYVerRegistro(d.usuario); }
  })
  .catch(function() {
    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    err.textContent = 'Error de conexión con el servidor.';
  });
}

function registrarse() {
  var nombre   = document.getElementById('reg-nombre').value.trim();
  var apellido = document.getElementById('reg-apellido').value.trim();
  var telefono = document.getElementById('reg-telefono').value.trim();
  var email    = document.getElementById('reg-email').value.trim();
  var pass     = document.getElementById('reg-pass').value;
  var err      = document.getElementById('reg-error');
  err.textContent = '';

  if (!nombre || !telefono || !email || !pass) {
    err.textContent = 'Completa todos los campos obligatorios.';
    return;
  }
  if (pass.length < 6) { err.textContent = 'La contraseña debe tener al menos 6 caracteres.'; return; }

  var btn = document.querySelector('#form-registro .bp');
  if (btn) { btn.disabled = true; btn.textContent = 'Creando cuenta...'; }

  fetch(API + '/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, telefono, email, password: pass })
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (btn) { btn.disabled = false; btn.textContent = 'Crear cuenta'; }
    if (!d.ok) { err.textContent = d.error; return; }
    localStorage.setItem('ep_token',  d.token);
    localStorage.setItem('ep_sesion', JSON.stringify(d.usuario));
    activarNavUsuario(d.usuario);
    verRegistroAnual();
  })
  .catch(function() {
    if (btn) { btn.disabled = false; btn.textContent = 'Crear cuenta'; }
    err.textContent = 'Error de conexión con el servidor.';
  });
}


// ── MENÚ MÓVIL ──────────────────────────────────────
function toggleMenu() {
  var m = document.getElementById('nav-menu-open');
  var b = document.getElementById('nav-menu-btn');
  if (m) {
    m.classList.toggle('visible');
    b.textContent = m.classList.contains('visible') ? '✕' : '☰';
  }
}
function cerrarMenu() {
  var m = document.getElementById('nav-menu-open');
  var b = document.getElementById('nav-menu-btn');
  if (m) { m.classList.remove('visible'); if(b) b.textContent = '☰'; }
}
function actualizarBtnTema() {
  var esOscuro = document.body.getAttribute('data-tema') === 'oscuro';
  var btnTema  = document.getElementById('btn-tema');
  var linkTema = document.querySelector('.nav-link-tema');
  if (btnTema)  btnTema.textContent  = esOscuro ? '☀️' : '🌙';
  if (linkTema) linkTema.textContent = esOscuro ? '☀️ Cambiar tema' : '🌙 Cambiar tema';
}
// Cerrar menú al hacer click fuera
document.addEventListener('click', function(e) {
  var menu = document.getElementById('nav-menu-open');
  var btn  = document.getElementById('nav-menu-btn');
  if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
    cerrarMenu();
  }
});

// ── NAV USUARIO ──────────────────────────────
function activarNavUsuario(usuario) {
  var nu = document.getElementById('nav-usuario');
  var nb = document.getElementById('nav-login-btn');
  var nv = document.getElementById('nav-bienvenido');
  var na = document.getElementById('nav-admin-link');
  var nr = document.getElementById('nav-reg-link');
  // Menú móvil
  var mLogin  = document.getElementById('menu-login-link');
  var mAdmin  = document.getElementById('menu-admin-link');
  var mReg    = document.getElementById('menu-reg-link');
  var mSalir  = document.getElementById('menu-salir-link');
  var mInfo   = document.getElementById('menu-usuario-info');

  // Nav escritorio
  if (nu) nu.style.display = 'flex';
  if (nb) nb.style.display = 'none';
  if (nv) nv.textContent   = usuario.nombre; // Solo nombre, sin "Hola,"

  // Menú móvil — mostrar nombre del usuario
  if (mInfo) {
    mInfo.textContent = '👋 Hola, ' + usuario.nombre;
    mInfo.classList.add('visible');
  }
  if (mLogin) mLogin.style.display = 'none';
  if (mSalir) mSalir.style.display = 'flex';

  if (usuario.es_admin) {
    if (na)     na.style.display     = 'flex';
    if (nr)     nr.style.display     = 'none';
    if (mAdmin) mAdmin.style.display = 'flex';
    if (mReg)   mReg.style.display   = 'none';
  } else {
    if (na)     na.style.display     = 'none';
    if (nr)     nr.style.display     = 'flex';
    if (mAdmin) mAdmin.style.display = 'none';
    if (mReg)   mReg.style.display   = 'flex';
  }
}
function desactivarNavUsuario() {
  var nu     = document.getElementById('nav-usuario');
  var nb     = document.getElementById('nav-login-btn');
  var na     = document.getElementById('nav-admin-link');
  var mLogin = document.getElementById('menu-login-link');
  var mAdmin = document.getElementById('menu-admin-link');
  var mReg   = document.getElementById('menu-reg-link');
  var mSalir = document.getElementById('menu-salir-link');
  var mInfo  = document.getElementById('menu-usuario-info');
  if (nu)     nu.style.display     = 'none';
  if (nb)     nb.style.display     = 'block';
  if (na)     na.style.display     = 'none';
  if (mLogin) mLogin.style.display = 'flex';
  if (mAdmin) mAdmin.style.display = 'none';
  if (mReg)   mReg.style.display   = 'none';
  if (mSalir) mSalir.style.display = 'none';
  if (mInfo)  { mInfo.textContent  = ''; mInfo.classList.remove('visible'); }
}
function cerrarSesion() {
  localStorage.removeItem('ep_sesion');
  localStorage.removeItem('ep_token');
  desactivarNavUsuario();
  goHome();
  toast('Sesión cerrada correctamente.', 'ok');
}

// ── REGISTRO ANUAL (USUARIO) ─────────────────
// Carga citas desde el servidor y las guarda en sesión local
function cargarMisCitasYVerRegistro(usuario) {
  var token = localStorage.getItem('ep_token');
  fetch(API + '/citas/mis-citas', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (d.ok && d.citas) {
      // Formatear citas del servidor al formato local
      var citasFormateadas = d.citas.map(function(c) {
        var partesFecha = (c.fecha_cita || '').split('-');
        var mesNombre   = partesFecha.length === 3
          ? parseInt(partesFecha[1]) - 1
          : 0;
        var mesesCortos = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        var fechaDisplay = partesFecha.length === 3
          ? parseInt(partesFecha[2]) + ' ' + mesesCortos[mesNombre] + ' ' + partesFecha[0]
          : c.fecha_cita;

        // Convertir hora HH:MM a formato 12h
        var horaDisplay = c.hora_cita || '';
        if (horaDisplay && horaDisplay.length >= 5) {
          var hh = parseInt(horaDisplay.substring(0,2));
          var mm = horaDisplay.substring(3,5);
          var ampm = hh >= 12 ? 'PM' : 'AM';
          if (hh > 12) hh -= 12;
          if (hh === 0) hh = 12;
          horaDisplay = hh + ':' + mm + ' ' + ampm;
        }

        var numStr = c.numero_turno < 10 ? '0'+c.numero_turno : ''+c.numero_turno;
        return {
          turno:    numStr,
          nombre:   c.nombre,
          apellido: c.apellido || '',
          servicio: c.servicio,
          precio:   c.precio,
          fecha:    fechaDisplay,
          hora:     horaDisplay,
          estado:   c.estado,
          anio:     c.anio || new Date().getFullYear()
        };
      });

      // Actualizar sesión local
      usuario.citas = citasFormateadas;
      localStorage.setItem('ep_sesion', JSON.stringify(usuario));
    }
    verRegistroAnual();
  })
  .catch(function() {
    verRegistroAnual();
  });
}

function verRegistroAnual() {
  var sesion = JSON.parse(localStorage.getItem('ep_sesion') || 'null');
  if (!sesion) { goLogin(); return; }

  var anio = new Date().getFullYear();
  document.getElementById('reg-anio').textContent = anio;

  var citas = sesion.citas || [];
  var citasAnio = citas.filter(function(c) {
    return parseInt(c.anio) === anio;
  });

  var tbody = document.getElementById('reg-tbody');
  var vacio = document.getElementById('reg-vacio');
  var tabla = document.getElementById('reg-tabla');
  tbody.innerHTML = '';

  if (citasAnio.length === 0) {
    tabla.style.display = 'none';
    vacio.style.display = 'block';
    document.getElementById('reg-total').textContent = 'RD$0';
  } else {
    tabla.style.display = 'table';
    vacio.style.display = 'none';
    var total = 0;

    citasAnio.forEach(function(c, idx) {
      var tr = document.createElement('tr');
      var pn = 0;
      if (c.precio && c.precio !== 'RD$?') {
        var sn = c.precio.replace(/[^0-9]/g,'');
        if (sn) pn = parseInt(sn);
      }
      total += pn;

      // Badge de estado
      var estadoBadge = '';
      if (c.estado) {
        var ec = c.estado === 'completada' ? '#2d7a4e' : c.estado === 'cancelada' ? '#b03030' : '#b07820';
        estadoBadge = '<span style="background:'+ec+'18;color:'+ec+';padding:2px 8px;border-radius:20px;font-size:10px;border:1px solid '+ec+'40;">'+c.estado+'</span>';
      }

      tr.innerHTML =
        '<td style="color:#aaa;">'+(idx+1)+'</td>'+
        '<td style="font-family:\'Playfair Display\',serif;color:#c8922a;font-weight:700;">#'+c.turno+'</td>'+
        '<td>'+escHtml(c.nombre || sesion.nombre)+'</td>'+
        '<td>'+escHtml(c.apellido || sesion.apellido || '-')+'</td>'+
        '<td>'+escHtml(c.servicio)+'</td>'+
        '<td>'+escHtml(c.fecha)+'</td>'+
        '<td>'+escHtml(c.hora)+'</td>'+
        '<td style="color:#c8922a;font-weight:600;">'+escHtml(c.precio)+'</td>'+
        (c.estado ? '<td>'+estadoBadge+'</td>' : '');
      tbody.appendChild(tr);
    });

    document.getElementById('reg-total').textContent = 'RD$' + total.toLocaleString();
  }

  showView('view-registro');
}

// Recargar citas del servidor cuando entra al registro
function verRegistroConRecarga() {
  var sesion = JSON.parse(localStorage.getItem('ep_sesion') || 'null');
  if (!sesion) { goLogin(); return; }
  cargarMisCitasYVerRegistro(sesion);
}

// Prevenir XSS
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── PANEL ADMIN ──────────────────────────────
var adminFiltroFecha  = '';
var adminFiltroEstado = 'todas';

function irAdmin() {
  var sesion = JSON.parse(localStorage.getItem('ep_sesion') || 'null');
  if (!sesion || !sesion.es_admin) { toast('Acceso denegado.', 'error'); goHome(); return; }
  showView('view-admin');
  adminFiltroFecha = new Date().toISOString().split('T')[0];
  var filtroInput = document.getElementById('admin-filtro-fecha');
  if (filtroInput) filtroInput.value = adminFiltroFecha;
  cargarStatsAdmin();
  cargarCitasAdmin();
  renderDiasBloqueados();
}

function cargarStatsAdmin() {
  var token = localStorage.getItem('ep_token');
  fetch(API + '/citas/stats', { headers: { 'Authorization': 'Bearer ' + token } })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (!d.ok) return;
    var h = d.hoy;
    document.getElementById('admin-total-hoy').textContent   = h.total       || 0;
    document.getElementById('admin-pendientes').textContent  = h.pendientes  || 0;
    document.getElementById('admin-completadas').textContent = h.completadas || 0;
    document.getElementById('admin-canceladas').textContent  = h.canceladas  || 0;
    document.getElementById('admin-ingresos').textContent    = 'RD$' + (parseFloat(h.ingresos)||0).toLocaleString();
    document.getElementById('admin-semana').textContent      = d.semana      || 0;
    document.getElementById('admin-mes').textContent         = d.mes         || 0;
  })
  .catch(function(){});
}

function cargarCitasAdmin() {
  var token = localStorage.getItem('ep_token');
  var url   = API + '/citas/todas?';

  if (adminFiltroFecha)  url += 'fecha='  + adminFiltroFecha + '&';
  if (adminFiltroEstado && adminFiltroEstado !== 'todas') url += 'estado=' + adminFiltroEstado;

  // Indicador de carga
  var tbody = document.getElementById('admin-tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:#aaa;">Cargando...</td></tr>';

  fetch(url, { headers: { 'Authorization': 'Bearer ' + token } })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (d.ok) renderAdminTabla(d.citas);
    else      toast('Error al cargar citas: ' + (d.error || ''), 'error');
  })
  .catch(function(e) {
    console.error('Error admin:', e);
    toast('Error de conexión con el servidor.', 'error');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:#c05050;">Error de conexión</td></tr>';
  });
}

function filtrarAdmin() {
  var fi = document.getElementById('admin-filtro-fecha');
  var fe = document.getElementById('admin-filtro-estado');
  adminFiltroFecha  = fi ? fi.value : '';
  adminFiltroEstado = fe ? fe.value : 'todas';
  cargarCitasAdmin();
}

function renderAdminTabla(citas) {
  var tbody = document.getElementById('admin-tbody');
  var vacio = document.getElementById('admin-vacio');
  var tabla = document.getElementById('admin-tabla');
  tbody.innerHTML = '';

  if (!citas || citas.length === 0) {
    tabla.style.display = 'none';
    vacio.style.display = 'block';
    return;
  }

  tabla.style.display = 'table';
  vacio.style.display = 'none';

  citas.forEach(function(c) {
    var tr = document.createElement('tr');
    var ec = c.estado === 'completada' ? '#2d7a4e' : c.estado === 'cancelada' ? '#b03030' : '#b07820';
    var bgEstado = ec + '18';

    // Hora en formato amigable
    var horaDisplay = c.hora_cita || '';
    if (horaDisplay && horaDisplay.length >= 5) {
      var hh = parseInt(horaDisplay.substring(0,2));
      var mm = horaDisplay.substring(3,5);
      var ap = hh >= 12 ? 'PM' : 'AM';
      if (hh > 12) hh -= 12;
      if (hh === 0) hh = 12;
      horaDisplay = hh + ':' + mm + ' ' + ap;
    }

    tr.innerHTML =
      '<td class="tbl-turno">#'+c.numero_turno+'</td>'+
      '<td class="tbl-cliente">'+
        '<div class="cliente-nombre">'+escHtml(c.nombre)+' '+escHtml(c.apellido||'')+'</div>'+
        '<div class="cliente-tel">📱 '+escHtml(c.telefono)+'</div>'+
      '</td>'+
      '<td class="tbl-servicio">'+escHtml(c.servicio)+'</td>'+
      '<td class="tbl-hora">'+horaDisplay+'</td>'+
      '<td>'+
        '<span class="estado-badge" style="background:'+bgEstado+';color:'+ec+';border-color:'+ec+'40;">'+c.estado+'</span>'+
      '</td>'+
      '<td class="tbl-acciones">'+
        (c.estado !== 'completada' ?
          '<button class="btn-accion btn-ok" onclick="cambiarEstado('+c.id_cita+',\'completada\')">✓ Listo</button>' : '')+
        (c.estado !== 'cancelada' ?
          '<button class="btn-accion btn-cancelar" onclick="cambiarEstado('+c.id_cita+',\'cancelada\')">✗ Cancelar</button>' : '')+
        (c.estado === 'cancelada' ?
          '<button class="btn-accion btn-delete" onclick="eliminarCita('+c.id_cita+')">🗑 Borrar</button>' : '')+
      '</td>';
    tbody.appendChild(tr);
  });
}

function cambiarEstado(id_cita, estado) {
  var token = localStorage.getItem('ep_token');
  fetch(API + '/citas/estado', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ id_cita: id_cita, estado: estado })
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (d.ok) {
      toast(estado === 'completada' ? '✓ Marcada como completada' : '✗ Cita cancelada', estado === 'completada' ? 'ok' : 'warn');
      cargarCitasAdmin();
      cargarStatsAdmin();
    } else {
      toast(d.error || 'Error al cambiar estado.', 'error');
    }
  })
  .catch(function(e) { console.error('Error:', e); toast('Error de conexión.', 'error'); });
}

function eliminarCita(id_cita) {
  if (!confirm('¿Seguro que deseas eliminar esta cita permanentemente?')) return;
  var token = localStorage.getItem('ep_token');
  fetch(API + '/citas/' + id_cita, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (d.ok) { toast('Cita eliminada.', 'ok'); cargarCitasAdmin(); cargarStatsAdmin(); }
    else      { toast(d.error || 'Error al eliminar.', 'error'); }
  })
  .catch(function() { toast('Error de conexión.', 'error'); });
}

// ── DÍAS BLOQUEADOS (ADMIN) ──────────────────
function renderDiasBloqueados() {
  var dias = getDiasBloqueados();
  var grid = document.getElementById('admin-dias-grid');
  if (!grid) return;
  if (dias.length === 0) {
    grid.innerHTML = '<span style="font-size:12px;color:#aaa;">No hay días bloqueados</span>';
    return;
  }
  grid.innerHTML = '';
  dias.forEach(function(fecha) {
    var tag = document.createElement('div');
    tag.className = 'dia-bloqueado-tag';
    tag.innerHTML = escHtml(fecha) + '<button onclick="desbloquearDia(\''+escHtml(fecha)+'\')">×</button>';
    grid.appendChild(tag);
  });
}

function bloquearDia() {
  var input = document.getElementById('admin-fecha-bloquear');
  var fecha = input.value;
  if (!fecha) { toast('Selecciona una fecha para bloquear.', 'warn'); return; }
  var dias = getDiasBloqueados();
  if (dias.indexOf(fecha) === -1) {
    dias.push(fecha);
    saveDiasBloqueados(dias);
    toast('Día bloqueado: ' + fecha, 'ok');
  } else {
    toast('Ese día ya está bloqueado.', 'warn');
  }
  input.value = '';
  renderDiasBloqueados();
}

function desbloquearDia(fecha) {
  var dias = getDiasBloqueados().filter(function(d){ return d !== fecha; });
  saveDiasBloqueados(dias);
  renderDiasBloqueados();
  toast('Día desbloqueado.', 'ok');
}

// ── TEMA OSCURO / CLARO ──────────────────────
function toggleTema() {
  var body = document.body;
  var btn  = document.getElementById('btn-tema');
  var esOscuro = body.getAttribute('data-tema') === 'oscuro';
  if (esOscuro) {
    body.removeAttribute('data-tema');
    try { localStorage.setItem('ep_tema', 'claro'); } catch(e) {}
  } else {
    body.setAttribute('data-tema', 'oscuro');
    try { localStorage.setItem('ep_tema', 'oscuro'); } catch(e) {}
  }
  actualizarBtnTema();
}

// ── AUTO-REFRESH ADMIN ────────────────────────
var adminRefreshTimer = null;
function iniciarAutoRefresh() {
  if (adminRefreshTimer) clearInterval(adminRefreshTimer);
  adminRefreshTimer = setInterval(function() {
    var vistaAdmin = document.getElementById('view-admin');
    if (vistaAdmin && vistaAdmin.classList.contains('active')) {
      cargarCitasAdmin();
      cargarStatsAdmin();
    }
  }, 30000); // Cada 30 segundos
}

// ── INIT ────────────────────────────────────
renderServicios();
renderCal();
renderTimes();

// Restaurar sesión
(function() {
  var sesion = JSON.parse(localStorage.getItem('ep_sesion') || 'null');
  if (sesion) activarNavUsuario(sesion);
})();

// Restaurar tema
(function() {
  var tema = localStorage.getItem('ep_tema');
  if (tema === 'oscuro') {
    document.body.setAttribute('data-tema', 'oscuro');
  }
  actualizarBtnTema();
})();

// Iniciar auto-refresh para admin
iniciarAutoRefresh();