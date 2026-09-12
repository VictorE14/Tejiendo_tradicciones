const authKey = 'adminAuthSession';
let products = [];

const $ = id => document.getElementById(id);

function isAuthenticated() {
  return sessionStorage.getItem(authKey) === 'true';
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
    fetchProducts();
  } else {
    if (loginScreen) {
      loginScreen.hidden = false;
      loginScreen.style.setProperty('display', 'flex', 'important');
    }
    if (dashboard) {
      dashboard.hidden = true;
      dashboard.style.setProperty('display', 'none', 'important');
    }
    switchAuthTab('login');
  }
}

function switchAuthTab(tab) {
  const tabLoginBtn = $('tabLoginBtn');
  const tabRegisterBtn = $('tabRegisterBtn');
  const loginForm = $('loginForm');
  const registerForm = $('registerForm');
  const loginError = $('loginError');
  const registerMsg = $('registerMsg');

  if (loginError) {
    loginError.hidden = true;
    loginError.style.display = 'none';
  }
  if (registerMsg) {
    registerMsg.hidden = true;
    registerMsg.style.display = 'none';
  }

  if (tab === 'login') {
    tabLoginBtn?.classList.add('active');
    tabRegisterBtn?.classList.remove('active');
    if (loginForm) {
      loginForm.hidden = false;
      loginForm.style.setProperty('display', 'flex', 'important');
    }
    if (registerForm) {
      registerForm.hidden = true;
      registerForm.style.setProperty('display', 'none', 'important');
    }
  } else {
    tabRegisterBtn?.classList.add('active');
    tabLoginBtn?.classList.remove('active');
    if (registerForm) {
      registerForm.hidden = false;
      registerForm.style.setProperty('display', 'flex', 'important');
    }
    if (loginForm) {
      loginForm.hidden = true;
      loginForm.style.setProperty('display', 'none', 'important');
    }
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

async function handleRegister(event) {
  event.preventDefault();
  const name = $('regName').value.trim();
  const email = $('regEmail').value.trim().toLowerCase();
  const pass = $('regPassword').value;
  const confirmPass = $('regConfirmPassword').value;
  const msgDiv = $('registerMsg');
  const submitBtn = $('registerSubmitBtn');

  if (pass !== confirmPass) {
    msgDiv.textContent = 'Las contraseñas no coinciden.';
    msgDiv.className = 'admin-login-error';
    msgDiv.hidden = false;
    return;
  }

  if (pass.length < 6) {
    msgDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    msgDiv.className = 'admin-login-error';
    msgDiv.hidden = false;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Registrando en Supabase...';
  msgDiv.hidden = true;

  try {
    if (window.supabaseClient) {
      const { data, error } = await window.supabaseClient.rpc('registrar_admin', {
        p_nombre: name,
        p_email: email,
        p_password: pass
      });

      if (error) throw error;

      if (data && data.success) {
        $('regName').value = '';
        $('regEmail').value = '';
        $('regPassword').value = '';
        $('regConfirmPassword').value = '';

        msgDiv.textContent = '¡Cuenta registrada con éxito en Supabase! Ya puedes iniciar sesión.';
        msgDiv.className = 'admin-login-error success';
        msgDiv.hidden = false;

        setTimeout(() => {
          switchAuthTab('login');
          $('loginEmail').value = email;
          $('loginPassword').focus();
        }, 1400);
      } else {
        throw new Error(data?.message || 'No se pudo completar el registro');
      }
    } else {
      throw new Error('No se pudo conectar con Supabase');
    }
  } catch (err) {
    msgDiv.textContent = err.message || 'Error al registrar el administrador';
    msgDiv.className = 'admin-login-error';
    msgDiv.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Crear cuenta de admin';
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
            <button class="admin-icon" data-delete="${product.id}" type="button">Eliminar</button>
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

function initAdmin() {
  // Pestañas de Login / Registro
  $('tabLoginBtn')?.addEventListener('click', () => switchAuthTab('login'));
  $('tabRegisterBtn')?.addEventListener('click', () => switchAuthTab('register'));

  // Formularios de autenticación
  $('loginForm')?.addEventListener('submit', handleLogin);
  $('registerForm')?.addEventListener('submit', handleRegister);

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

    if (deleteButton && confirm('¿Deseas eliminar este producto de la base de datos de Supabase?')) {
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
  });

  updateAuthUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
