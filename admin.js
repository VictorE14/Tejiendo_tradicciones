const authKey = 'adminAuthSession';
let products = [];
let adminUsers = [];
let currentMainTab = 'products';

const $ = id => document.getElementById(id);

function isAuthenticated() {
  return sessionStorage.getItem(authKey) === 'true';
}

function getCurrentAdminUser() {
  try {
    return JSON.parse(sessionStorage.getItem('adminUser') || '{}');
  } catch {
    return {};
  }
}

function isSuperAdmin() {
  const user = getCurrentAdminUser();
  return (user.rol || 'admin') === 'admin';
}

function updateAdminHeaderUser() {
  const badgeContainer = $('adminUserBadge');
  if (!badgeContainer) return;
  const user = getCurrentAdminUser();
  if (!user || !user.nombre) {
    badgeContainer.innerHTML = '';
    return;
  }
  const isSuper = isSuperAdmin();
  const roleText = isSuper ? 'Administrador' : 'Vendedor';
  const roleIcon = isSuper ? '👑' : '🛍️';
  const roleClass = isSuper ? 'admin' : 'vendedor';

  badgeContainer.innerHTML = `
    <div class="admin-user-pill" title="Sesión activa: ${escapeHtml(user.email || '')}">
      <span>${escapeHtml(user.nombre)}</span>
      <span class="pill-role ${roleClass}">${roleIcon} ${roleText}</span>
    </div>
  `;
}

function updateRoleUI() {
  const isSuper = isSuperAdmin();
  const kickerDesc = $('productsKickerDesc');
  if (kickerDesc) {
    if (isSuper) {
      kickerDesc.textContent = 'Modo Administrador: acceso total para gestionar productos, existencias, administradores y personalización.';
    } else {
      kickerDesc.textContent = 'Modo Vendedor: consulta y actualización de existencias e inventario de productos.';
    }
  }
}

function switchMainTab(tab) {
  const isSuper = isSuperAdmin();
  if (!isSuper && (tab === 'admins' || tab === 'showcase')) {
    tab = 'products';
  }

  currentMainTab = tab;
  const navProducts = $('navTabProducts');
  const navAdmins = $('navTabAdmins');
  const navShowcase = $('navTabShowcase');
  const prodSection = $('productsSection');
  const adminSection = $('adminsSection');
  const showcaseSection = $('showcaseSection');

  navProducts?.classList.toggle('active', tab === 'products');
  navAdmins?.classList.toggle('active', tab === 'admins');
  navShowcase?.classList.toggle('active', tab === 'showcase');

  if (prodSection) prodSection.hidden = (tab !== 'products');
  if (adminSection) adminSection.hidden = (tab !== 'admins');
  if (showcaseSection) showcaseSection.hidden = (tab !== 'showcase');

  if (tab === 'admins') {
    if (isSuper) fetchAdmins();
  } else if (tab === 'showcase') {
    if (isSuper) loadShowcaseSettings();
  }
}

function updateAuthUI() {
  const loginScreen = $('adminLoginScreen');
  const dashboard = $('adminDashboard');
  const loggedIn = isAuthenticated();

  if (loggedIn) {
    if (loginScreen) {
      loginScreen.hidden = true;
      loginScreen.style.setProperty('display', 'none', 'important');
    }
    if (dashboard) {
      dashboard.hidden = false;
      dashboard.style.setProperty('display', 'block', 'important');
    }

    const isSuper = isSuperAdmin();
    const navAdmins = $('navTabAdmins');
    const navShowcase = $('navTabShowcase');
    if (navAdmins) {
      navAdmins.hidden = !isSuper;
      navAdmins.style.display = isSuper ? '' : 'none';
    }
    if (navShowcase) {
      navShowcase.hidden = !isSuper;
      navShowcase.style.display = isSuper ? '' : 'none';
    }

    updateAdminHeaderUser();
    updateRoleUI();

    fetchProducts();
    if (isSuper) {
      fetchAdmins();
    } else {
      switchMainTab('products');
    }
  } else {
    if (loginScreen) {
      loginScreen.hidden = false;
      loginScreen.style.setProperty('display', 'flex', 'important');
    }
    if (dashboard) {
      dashboard.hidden = true;
      dashboard.style.setProperty('display', 'none', 'important');
    }
    const badgeContainer = $('adminUserBadge');
    if (badgeContainer) badgeContainer.innerHTML = '';

    const loginError = $('loginError');
    if (loginError) {
      loginError.hidden = true;
      loginError.style.display = 'none';
    }
    const loginForm = $('loginForm');
    if (loginForm) {
      loginForm.hidden = false;
      loginForm.style.setProperty('display', 'flex', 'important');
    }
    switchMainTab('products');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const emailInput = $('loginEmail');
  const passInput = $('loginPassword');
  const errorMsg = $('loginError');
  const submitBtn = $('loginSubmitBtn');

  const username = emailInput.value.trim().toLowerCase();
  const password = passInput.value;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Verificando...';
  if (errorMsg) errorMsg.hidden = true;

  try {
    if (window.supabaseClient) {
      const { data, error } = await window.supabaseClient.rpc('login_admin', {
        p_email: username,
        p_password: password
      });

      if (error) throw error;

      if (data && data.success && data.user) {
        sessionStorage.setItem(authKey, 'true');
        sessionStorage.setItem('adminUser', JSON.stringify(data.user));
        passInput.value = '';
        updateAuthUI();
        return;
      } else {
        throw new Error(data?.message || 'Credenciales no válidas');
      }
    } else {
      throw new Error('No se pudo conectar con Supabase');
    }
  } catch (err) {
    if (errorMsg) {
      errorMsg.textContent = err.message || 'Error al iniciar sesión';
      errorMsg.hidden = false;
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Ingresar al panel';
  }
}

function handleLogout() {
  sessionStorage.removeItem(authKey);
  sessionStorage.removeItem('adminUser');
  const errorMsg = $('loginError');
  if (errorMsg) errorMsg.hidden = true;
  updateAuthUI();
}

function imageFor(product) {
  return product.imagen || product.image || 'images/logo/logo colectivo.png';
}

async function fetchProducts() {
  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('productos')
        .select('*')
        .order('codigo');

      if (!error && data) {
        products = data;
      } else if (error) {
        console.error('Error de Supabase:', error);
      }
    } catch (e) {
      console.warn('Error al consultar productos:', e);
    }
  }
  populateShowcaseProductSelects();
  render();
}

function render() {
  if (!isAuthenticated()) return;

  const term = $('productSearch').value.trim().toLowerCase();
  const category = $('categoryFilter').value;
  const filtered = products.filter(product => {
    const name = product.nombre || product.name || '';
    const code = product.codigo || product.code || '';
    const cat = product.categoria || product.category || '';
    const matchesText = [name, code, cat].some(value => value.toLowerCase().includes(term));
    return matchesText && (category === 'Todos' || cat === category);
  });

  $('totalProducts').textContent = products.length;
  $('availableProducts').textContent = products.filter(product => Number(product.stock) > 0).length;
  $('totalStock').textContent = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  $('lowStock').textContent = products.filter(product => Number(product.stock) <= 2).length;

  $('productRows').innerHTML = filtered.map(product => {
    const name = product.nombre || product.name || '';
    const code = product.codigo || product.code || '';
    const price = Number(product.precio ?? product.price ?? 0);
    const stock = Number(product.stock ?? 0);
    const cat = product.categoria || product.category || '';

    return `
      <tr>
        <td>
          <div class="admin-product">
            <img src="${imageFor(product)}" alt="${name}" onerror="this.src='images/logo/logo colectivo.png'">
            <div>
              ${name}
              <span class="admin-code">${code}</span>
            </div>
          </div>
        </td>
        <td>${cat}</td>
        <td>$${price.toFixed(2)} MXN</td>
        <td>
          <div class="stock-control">
            <button data-stock="-1" data-id="${product.id}" aria-label="Disminuir stock">−</button>
            <strong>${stock}</strong>
            <button data-stock="1" data-id="${product.id}" aria-label="Aumentar stock">+</button>
          </div>
        </td>
        <td>
          <span class="admin-status ${stock === 0 ? 'empty' : ''}">
            ${stock === 0 ? 'Agotado' : stock <= 2 ? 'Por reponer' : 'Disponible'}
          </span>
        </td>
        <td>
          <div class="admin-actions">
            <button class="admin-icon" data-edit="${product.id}" type="button">Editar</button>
            ${isSuperAdmin() ? `<button class="admin-icon" data-delete="${product.id}" type="button">Eliminar</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  $('emptyState').hidden = filtered.length > 0;
}

function openForm(product) {
  const form = $('productForm');
  form.hidden = false;
  $('formTitle').textContent = product ? 'Editar producto' : 'Nuevo producto';
  $('editId').value = product?.id || '';
  $('name').value = product?.nombre || product?.name || '';
  $('code').value = product?.codigo || product?.code || '';
  $('price').value = product?.precio ?? product?.price ?? '';
  $('stock').value = product?.stock ?? 0;
  $('category').value = product?.categoria || product?.category || 'Aretes';
  $('description').value = product?.descripcion || product?.description || '';

  const currentImage = product?.imagen || product?.image || '';
  $('image').value = currentImage;
  $('imageFile').value = '';

  const preview = $('imagePreview');
  const container = $('imagePreviewContainer');
  if (currentImage) {
    preview.src = currentImage;
    container.style.display = 'flex';
  } else {
    container.style.display = 'none';
  }

  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  $('name').focus();
}

// ==========================================
// FUNCIONES CRUD PARA GESTIÓN DE ADMINISTRADORES
// ==========================================

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchAdmins() {
  if (!isAuthenticated()) return;
  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient.rpc('listar_admins');
      if (error) {
        console.warn('RPC listar_admins notice:', error);
        const notice = $('adminSqlNotice');
        if (notice) notice.hidden = false;
      } else if (data) {
        const notice = $('adminSqlNotice');
        if (notice) notice.hidden = true;
        adminUsers = data;
      }
    } catch (err) {
      console.error('Error al consultar administradores:', err);
    }
  }
  renderAdmins();
}

function renderAdmins() {
  if (!isAuthenticated()) return;

  const term = $('adminSearch')?.value.trim().toLowerCase() || '';
  const roleFilter = $('adminRoleFilter')?.value || 'Todos';
  const currentUser = getCurrentAdminUser();

  const filtered = adminUsers.filter(user => {
    const name = (user.nombre || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const matchesText = name.includes(term) || email.includes(term);
    const matchesRole = (roleFilter === 'Todos') || (user.rol === roleFilter);
    return matchesText && matchesRole;
  });

  if ($('totalAdmins')) $('totalAdmins').textContent = adminUsers.length;
  if ($('activeAdmins')) $('activeAdmins').textContent = adminUsers.filter(u => u.activo).length;
  if ($('roleAdmins')) $('roleAdmins').textContent = adminUsers.filter(u => u.rol === 'admin').length;
  if ($('roleSellers')) $('roleSellers').textContent = adminUsers.filter(u => u.rol === 'vendedor').length;

  const rowsContainer = $('adminUserRows');
  if (!rowsContainer) return;

  rowsContainer.innerHTML = filtered.map(user => {
    const isMe = (currentUser.id && currentUser.id === user.id) ||
      (currentUser.email && currentUser.email.toLowerCase() === user.email.toLowerCase());

    const initials = (user.nombre || 'Admin')
      .trim()
      .split(/\s+/)
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const roleLabel = user.rol === 'admin' ? 'Administrador' : 'Vendedor';
    const roleClass = user.rol === 'admin' ? 'badge-role-admin' : 'badge-role-vendedor';
    const roleIcon = user.rol === 'admin' ? '👑' : '🛍️';
    const statusLabel = user.activo ? 'Activo' : 'Inactivo';
    const statusClass = user.activo ? '' : 'inactive';

    const dateStr = user.created_at
      ? new Date(user.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
      : '—';

    return `
      <tr>
        <td>
          <div class="admin-user-cell">
            <div class="admin-avatar">${initials}</div>
            <div>
              <span class="admin-user-name">${escapeHtml(user.nombre)}</span>
              ${isMe ? '<span class="admin-user-badge-me">Tú</span>' : ''}
            </div>
          </div>
        </td>
        <td><code>${escapeHtml(user.email)}</code></td>
        <td>
          <span class="admin-badge-role ${roleClass}">${roleIcon} ${escapeHtml(roleLabel)}</span>
        </td>
        <td>
          <span class="admin-status ${statusClass}">${statusLabel}</span>
        </td>
        <td>${dateStr}</td>
        <td>
          <div class="admin-actions">
            <button class="admin-icon" data-admin-edit="${user.id}" type="button">Editar</button>
            <button class="admin-icon" data-admin-delete="${user.id}" type="button">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const empty = $('adminUserEmptyState');
  if (empty) empty.hidden = filtered.length > 0;
}

function openAdminForm(admin = null) {
  if (!isSuperAdmin()) {
    alert('Acceso restringido: Solo los administradores pueden gestionar usuarios.');
    return;
  }
  const form = $('adminUserForm');
  if (!form) return;
  form.hidden = false;

  const title = $('adminFormTitle');
  const idInput = $('adminUserId');
  const nameInput = $('adminUserName');
  const emailInput = $('adminUserEmail');
  const roleInput = $('adminUserRole');
  const activeInput = $('adminUserActive');
  const passInput = $('adminUserPassword');
  const confirmInput = $('adminUserConfirmPassword');
  const passHint = $('adminPassHint');
  const msgDiv = $('adminFormMsg');

  if (msgDiv) {
    msgDiv.hidden = true;
    msgDiv.textContent = '';
  }

  if (admin) {
    if (title) title.textContent = 'Editar Administrador';
    if (idInput) idInput.value = admin.id;
    if (nameInput) nameInput.value = admin.nombre || '';
    if (emailInput) emailInput.value = admin.email || '';
    if (roleInput) roleInput.value = admin.rol || 'admin';
    if (activeInput) activeInput.value = admin.activo ? 'true' : 'false';
    if (passInput) {
      passInput.value = '';
      passInput.required = false;
    }
    if (confirmInput) confirmInput.value = '';
    if (passHint) passHint.textContent = 'Opcional: déjala vacía si deseas conservar la contraseña actual.';
  } else {
    if (title) title.textContent = 'Nuevo Administrador';
    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (roleInput) roleInput.value = 'admin';
    if (activeInput) activeInput.value = 'true';
    if (passInput) {
      passInput.value = '';
      passInput.required = true;
    }
    if (confirmInput) confirmInput.value = '';
    if (passHint) passHint.textContent = 'Requerida: mínimo 6 caracteres.';
  }

  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  nameInput?.focus();
}

async function handleSaveAdmin(event) {
  event.preventDefault();
  if (!isSuperAdmin()) {
    alert('Acceso restringido: Solo los administradores pueden registrar o editar usuarios.');
    return;
  }
  const submitBtn = $('saveAdminBtn');
  const msgDiv = $('adminFormMsg');
  const isEdit = Boolean($('adminUserId').value);
  const id = $('adminUserId').value;
  const name = $('adminUserName').value.trim();
  const email = $('adminUserEmail').value.trim().toLowerCase();
  const role = $('adminUserRole').value;
  const active = $('adminUserActive').value === 'true';
  const pass = $('adminUserPassword').value;
  const confirmPass = $('adminUserConfirmPassword').value;

  if (msgDiv) msgDiv.hidden = true;

  if (!isEdit && (!pass || pass.length < 6)) {
    if (msgDiv) {
      msgDiv.textContent = 'La contraseña es requerida y debe tener al menos 6 caracteres.';
      msgDiv.className = 'admin-login-error admin-wide';
      msgDiv.hidden = false;
    }
    return;
  }

  if (pass && pass.length < 6) {
    if (msgDiv) {
      msgDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      msgDiv.className = 'admin-login-error admin-wide';
      msgDiv.hidden = false;
    }
    return;
  }

  if (pass && pass !== confirmPass) {
    if (msgDiv) {
      msgDiv.textContent = 'Las contraseñas no coinciden.';
      msgDiv.className = 'admin-login-error admin-wide';
      msgDiv.hidden = false;
    }
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando en Supabase...';

  try {
    if (!window.supabaseClient) throw new Error('No se pudo conectar con Supabase');

    if (isEdit) {
      const { data, error } = await window.supabaseClient.rpc('actualizar_admin', {
        p_id: id,
        p_nombre: name,
        p_email: email,
        p_rol: role,
        p_activo: active,
        p_password: pass || null
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.message || 'Error al actualizar administrador');

      const currentUser = getCurrentAdminUser();
      if (currentUser.id === id || currentUser.email === email) {
        currentUser.nombre = name;
        currentUser.email = email;
        currentUser.rol = role;
        sessionStorage.setItem('adminUser', JSON.stringify(currentUser));
      }
    } else {
      const { data, error } = await window.supabaseClient.rpc('registrar_admin', {
        p_nombre: name,
        p_email: email,
        p_password: pass,
        p_rol: role
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.message || 'Error al registrar administrador');

      // Si se configuró inactivo de entrada, actualizarlo
      if (!active && data.id) {
        await window.supabaseClient.rpc('actualizar_admin', {
          p_id: data.id,
          p_nombre: name,
          p_email: email,
          p_rol: role,
          p_activo: false,
          p_password: null
        });
      }
    }

    $('adminUserForm').hidden = true;
    await fetchAdmins();
  } catch (err) {
    if (msgDiv) {
      msgDiv.textContent = err.message || 'Error al guardar el administrador';
      msgDiv.className = 'admin-login-error admin-wide';
      msgDiv.hidden = false;
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar Administrador';
  }
}

async function handleDeleteAdmin(adminId) {
  if (!isSuperAdmin()) {
    alert('Acceso restringido: Solo los administradores pueden eliminar usuarios.');
    return;
  }
  const admin = adminUsers.find(u => u.id === adminId);
  if (!admin) return;

  if (adminUsers.length <= 1) {
    alert('Operación no permitida: No puedes eliminar la única cuenta administradora restante.');
    return;
  }

  const currentUser = getCurrentAdminUser();
  const isMe = (currentUser.id && currentUser.id === admin.id) ||
    (currentUser.email && currentUser.email.toLowerCase() === admin.email.toLowerCase());

  let confirmMsg = `¿Estás seguro de que deseas eliminar permanentemente al administrador "${admin.nombre}" (${admin.email}) de Supabase?`;
  if (isMe) {
    confirmMsg = `⚠️ ¡ATENCIÓN! Estás a punto de eliminar tu propia cuenta en sesión.\n\nSi continúas, tu cuenta será borrada y tu sesión se cerrará de inmediato.\n¿Deseas continuar?`;
  }

  if (!confirm(confirmMsg)) return;

  try {
    if (!window.supabaseClient) throw new Error('No se pudo conectar con Supabase');

    const { data, error } = await window.supabaseClient.rpc('eliminar_admin', {
      p_id: adminId
    });

    if (error) throw error;
    if (data && !data.success) throw new Error(data.message || 'No se pudo eliminar el usuario');

    if (isMe) {
      alert('Tu cuenta ha sido eliminada. La sesión se cerrará.');
      handleLogout();
      return;
    }

    await fetchAdmins();
  } catch (err) {
    alert('Error al eliminar administrador: ' + (err.message || err));
  }
}

// ==========================================
// FUNCIONES PARA PERSONALIZAR FOTOS DE PRESENTACIÓN
// ==========================================

const DEFAULT_SHOWCASE = {
  foto1: 'images/articulo/articulo5.png',
  foto2: 'images/articulo/articulo13.png',
  foto3: 'images/articulo/articulo18.png',
  etiqueta: 'Tejido Artesanal'
};

let currentShowcase = { ...DEFAULT_SHOWCASE };

function getShowcaseImageUrl(val) {
  if (!val) return 'images/logo/logo colectivo.png';
  if (val.startsWith('http') || val.startsWith('data:') || val.startsWith('images/') || val.startsWith('blob:')) return val;
  return `images/${val}`;
}

async function loadShowcaseSettings() {
  populateShowcaseProductSelects();

  try {
    const cached = localStorage.getItem('presentacion_ajustes');
    if (cached) {
      currentShowcase = { ...DEFAULT_SHOWCASE, ...JSON.parse(cached) };
    }
  } catch (e) {}

  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('ajustes_tienda')
        .select('*')
        .eq('clave', 'presentacion')
        .single();

      if (!error && data?.valor) {
        currentShowcase = { ...DEFAULT_SHOWCASE, ...data.valor };
        localStorage.setItem('presentacion_ajustes', JSON.stringify(currentShowcase));
      }
    } catch (err) {
      console.warn('Aviso: tabla ajustes_tienda aún no creada o vacía en Supabase:', err);
    }
  }

  applyShowcaseToAdminUI(currentShowcase);
}

function populateShowcaseProductSelects() {
  const selects = [$('selectProduct1'), $('selectProduct2'), $('selectProduct3')];
  selects.forEach(sel => {
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">-- Elige un producto para usar su foto --</option>' +
      products.map(p => {
        const img = p.imagen || p.image || '';
        const name = p.nombre || p.name || p.id;
        return `<option value="${img}" data-name="${name}">${p.id} · ${name}</option>`;
      }).join('');
    if (currentVal) sel.value = currentVal;
  });
}

function applyShowcaseToAdminUI(cfg) {
  if (!cfg) return;

  if ($('valImg1')) $('valImg1').value = cfg.foto1 || DEFAULT_SHOWCASE.foto1;
  if ($('valImg2')) $('valImg2').value = cfg.foto2 || DEFAULT_SHOWCASE.foto2;
  if ($('valImg3')) $('valImg3').value = cfg.foto3 || DEFAULT_SHOWCASE.foto3;

  if ($('thumbMini1')) $('thumbMini1').src = getShowcaseImageUrl(cfg.foto1 || DEFAULT_SHOWCASE.foto1);
  if ($('thumbMini2')) $('thumbMini2').src = getShowcaseImageUrl(cfg.foto2 || DEFAULT_SHOWCASE.foto2);
  if ($('thumbMini3')) $('thumbMini3').src = getShowcaseImageUrl(cfg.foto3 || DEFAULT_SHOWCASE.foto3);

  if ($('adminPreviewImg1')) $('adminPreviewImg1').src = getShowcaseImageUrl(cfg.foto1 || DEFAULT_SHOWCASE.foto1);
  if ($('adminPreviewImg2')) $('adminPreviewImg2').src = getShowcaseImageUrl(cfg.foto2 || DEFAULT_SHOWCASE.foto2);
  if ($('adminPreviewImg3')) $('adminPreviewImg3').src = getShowcaseImageUrl(cfg.foto3 || DEFAULT_SHOWCASE.foto3);

  const labelText = cfg.etiqueta || DEFAULT_SHOWCASE.etiqueta;
  if ($('inputShowcaseLabel')) $('inputShowcaseLabel').value = labelText;
  if ($('adminPreviewLabel')) $('adminPreviewLabel').textContent = labelText;
}

function setupShowcaseEventListeners() {
  [1, 2, 3].forEach(num => {
    const sel = $(`selectProduct${num}`);
    const file = $(`fileUpload${num}`);

    sel?.addEventListener('change', () => {
      if (sel.value) {
        $(`valImg${num}`).value = sel.value;
        const url = getShowcaseImageUrl(sel.value);
        $(`thumbMini${num}`).src = url;
        $(`adminPreviewImg${num}`).src = url;
        if (file) file.value = '';
      }
    });

    file?.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) {
        const objUrl = URL.createObjectURL(f);
        $(`thumbMini${num}`).src = objUrl;
        $(`adminPreviewImg${num}`).src = objUrl;
        if (sel) sel.value = '';
      }
    });
  });

  $('inputShowcaseLabel')?.addEventListener('input', (e) => {
    const previewLabel = $('adminPreviewLabel');
    if (previewLabel) previewLabel.textContent = e.target.value.trim() || 'Tejido Artesanal';
  });

  $('showcaseForm')?.addEventListener('submit', handleSaveShowcase);

  $('btnResetShowcase')?.addEventListener('click', () => {
    if (confirm('¿Deseas restablecer las 3 fotos y la etiqueta a sus valores por defecto?')) {
      [1, 2, 3].forEach(n => {
        const sel = $(`selectProduct${n}`);
        const file = $(`fileUpload${n}`);
        if (sel) sel.value = '';
        if (file) file.value = '';
      });
      applyShowcaseToAdminUI(DEFAULT_SHOWCASE);
    }
  });
}

async function handleSaveShowcase(event) {
  event.preventDefault();
  if (!isSuperAdmin()) {
    alert('Acceso restringido: Solo los administradores con acceso total pueden modificar las fotos de presentación.');
    return;
  }
  const submitBtn = $('btnSaveShowcase');
  const alertDiv = $('showcaseAlert');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando cambios...';
  if (alertDiv) {
    alertDiv.hidden = true;
    alertDiv.textContent = '';
  }

  try {
    let foto1 = $('valImg1').value;
    let foto2 = $('valImg2').value;
    let foto3 = $('valImg3').value;
    const etiqueta = $('inputShowcaseLabel').value.trim() || 'Tejido Artesanal';

    const filesToUpload = [
      { num: 1, file: $('fileUpload1')?.files[0] },
      { num: 2, file: $('fileUpload2')?.files[0] },
      { num: 3, file: $('fileUpload3')?.files[0] }
    ];

    for (const item of filesToUpload) {
      if (item.file && window.supabaseClient) {
        submitBtn.textContent = `Subiendo foto ${item.num}...`;
        const ext = item.file.name.split('.').pop();
        const fileName = `showcase_foto${item.num}_${Date.now()}.${ext}`;

        const { error: uploadError } = await window.supabaseClient.storage
          .from('productos_fotos')
          .upload(fileName, item.file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = window.supabaseClient.storage
          .from('productos_fotos')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          if (item.num === 1) foto1 = publicUrlData.publicUrl;
          if (item.num === 2) foto2 = publicUrlData.publicUrl;
          if (item.num === 3) foto3 = publicUrlData.publicUrl;
        }
      }
    }

    const payload = { foto1, foto2, foto3, etiqueta };

    if (window.supabaseClient) {
      submitBtn.textContent = 'Guardando en base de datos...';
      const { error: upsertError } = await window.supabaseClient
        .from('ajustes_tienda')
        .upsert({
          clave: 'presentacion',
          valor: payload,
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        console.warn('Error en Supabase al guardar ajustes:', upsertError);
        throw new Error(`Aviso de Supabase: ${upsertError.message}. Recuerda ejecutar la sección 7 de supabase_schema.sql en tu SQL Editor.`);
      }
    }

    localStorage.setItem('presentacion_ajustes', JSON.stringify(payload));
    currentShowcase = payload;
    applyShowcaseToAdminUI(payload);

    if (alertDiv) {
      alertDiv.textContent = '¡Fotos de presentación actualizadas con éxito! Ya se muestran en la tienda.';
      alertDiv.className = 'admin-login-error success';
      alertDiv.hidden = false;
      setTimeout(() => { alertDiv.hidden = true; }, 4000);
    }
  } catch (err) {
    if (alertDiv) {
      alertDiv.textContent = err.message || 'Error al guardar las fotos de presentación';
      alertDiv.className = 'admin-login-error';
      alertDiv.hidden = false;
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar cambios en la tienda';
  }
}

function initAdmin() {
  // Formulario de autenticación
  $('loginForm')?.addEventListener('submit', handleLogin);

  // Botón de logout
  $('adminLogoutBtn')?.addEventListener('click', handleLogout);

  // Vista previa de imagen seleccionada
  $('imageFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = $('imagePreview');
    const container = $('imagePreviewContainer');
    if (file) {
      preview.src = URL.createObjectURL(file);
      container.style.display = 'flex';
    }
  });

  // Formulario CRUD de productos
  const form = $('productForm');
  $('newProduct')?.addEventListener('click', () => openForm());
  $('cancelForm')?.addEventListener('click', () => {
    form.hidden = true;
  });

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const saveBtn = $('saveProductBtn');
    const isEdit = Boolean($('editId').value);
    const id = $('editId').value || $('code').value.trim();

    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando...';

    let imageUrl = $('image').value.trim();
    const file = $('imageFile').files[0];

    // Subir imagen a Supabase Storage si se seleccionó un archivo nuevo
    if (file && window.supabaseClient) {
      try {
        saveBtn.textContent = 'Subiendo foto...';
        const fileExt = file.name.split('.').pop();
        const cleanCode = ($('code').value.trim() || 'prod').replace(/[^a-zA-Z0-9_-]/g, '');
        const fileName = `${cleanCode}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await window.supabaseClient.storage
          .from('productos_fotos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = window.supabaseClient.storage
          .from('productos_fotos')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          imageUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.error('Error al subir imagen:', err);
        alert('Aviso al subir imagen a Supabase Storage: ' + (err.message || err));
      }
    }

    const productData = {
      id: id,
      codigo: $('code').value.trim(),
      nombre: $('name').value.trim(),
      precio: Number($('price').value),
      stock: Number($('stock').value),
      categoria: $('category').value,
      descripcion: $('description').value.trim(),
      imagen: imageUrl
    };

    if (window.supabaseClient) {
      try {
        saveBtn.textContent = 'Guardando en base de datos...';
        if (isEdit) {
          const { error } = await window.supabaseClient
            .from('productos')
            .update(productData)
            .eq('id', id);
          if (error) throw error;
        } else {
          const { error } = await window.supabaseClient
            .from('productos')
            .insert([productData]);
          if (error) throw error;
        }
      } catch (err) {
        alert('Error al guardar en Supabase: ' + (err.message || err));
        saveBtn.disabled = false;
        saveBtn.textContent = 'Guardar producto';
        return;
      }
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Guardar producto';
    form.hidden = true;
    await fetchProducts();
  });

  $('productSearch')?.addEventListener('input', render);
  $('categoryFilter')?.addEventListener('change', render);

  $('productRows')?.addEventListener('click', async event => {
    const stockButton = event.target.closest('[data-stock]');
    const editButton = event.target.closest('[data-edit]');
    const deleteButton = event.target.closest('[data-delete]');

    if (stockButton) {
      const product = products.find(item => item.id === stockButton.dataset.id);
      if (product) {
        const newStock = Math.max(0, Number(product.stock) + Number(stockButton.dataset.stock));
        product.stock = newStock;
        render();

        if (window.supabaseClient) {
          try {
            await window.supabaseClient
              .from('productos')
              .update({ stock: newStock })
              .eq('id', product.id);
          } catch (e) {
            console.error('Error al actualizar stock:', e);
          }
        }
      }
    }

    if (editButton) {
      const product = products.find(item => item.id === editButton.dataset.edit);
      if (product) openForm(product);
    }

    if (deleteButton) {
      if (!isSuperAdmin()) {
        alert('Acceso restringido: Solo los administradores con acceso total pueden eliminar productos del catálogo.');
        return;
      }
      if (confirm('¿Deseas eliminar este producto de la base de datos de Supabase?')) {
        const prodId = deleteButton.dataset.delete;
        if (window.supabaseClient) {
          try {
            const { error } = await window.supabaseClient
              .from('productos')
              .delete()
              .eq('id', prodId);
            if (error) throw error;
            await fetchProducts();
          } catch (e) {
            alert('Error al eliminar producto: ' + (e.message || e));
          }
        }
      }
    }
  });

  // Navegación de pestañas principales (Productos vs Administradores)
  $('navTabProducts')?.addEventListener('click', () => switchMainTab('products'));
  $('navTabAdmins')?.addEventListener('click', () => switchMainTab('admins'));

  // Gestión de administradores
  $('newAdminBtn')?.addEventListener('click', () => openAdminForm());
  $('cancelAdminForm')?.addEventListener('click', () => {
    const f = $('adminUserForm');
    if (f) f.hidden = true;
  });
  $('adminUserForm')?.addEventListener('submit', handleSaveAdmin);

  $('adminSearch')?.addEventListener('input', renderAdmins);
  $('adminRoleFilter')?.addEventListener('change', renderAdmins);

  $('adminUserRows')?.addEventListener('click', async event => {
    const editBtn = event.target.closest('[data-admin-edit]');
    const deleteBtn = event.target.closest('[data-admin-delete]');

    if (editBtn) {
      const admin = adminUsers.find(u => u.id === editBtn.dataset.adminEdit);
      if (admin) openAdminForm(admin);
    }

    if (deleteBtn) {
      await handleDeleteAdmin(deleteBtn.dataset.adminDelete);
    }
  });

  // Pestaña Fotos de Presentación
  $('navTabShowcase')?.addEventListener('click', () => switchMainTab('showcase'));
  setupShowcaseEventListeners();

  updateAuthUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
