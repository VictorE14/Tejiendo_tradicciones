function getGoogleDriveImageUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function getImageUrl(value) {
  if (!value) return '';
  if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('images/')) return value;
  return `images/${value}`;
}

const logoUrl = 'images/logo/logo colectivo.png';

window.addEventListener('load', () => {
  const logoElement = document.getElementById('navLogo');
  if (logoElement) {
    logoElement.innerHTML = `<img src="${logoUrl}" alt="Tejiendo Tradiciones"><span>Tejiendo Tradiciones</span>`;
  }
});

let productos = [
  { id: 'AR-001', nombre: 'Flores del Alma', precio: 80, categoria: 'Aretes', desc: 'Aretes tejidos a crochet con delicado diseño floral en azul.', medidas: '', color: '#8cb3d4', imagen: 'images/articulo/articulo1.png' },
  { id: 'AR-002', nombre: 'Selva Mística', precio: 80, categoria: 'Aretes', desc: 'Aretes tejidos a crochet con delicado diseño de hojas.', medidas: '', color: '#7b9e6b', imagen: 'images/articulo/articulo2.png' },
  { id: 'AR-003', nombre: 'Uva Bomba', precio: 70, categoria: 'Aretes', desc: 'Aretes tejidos a crochet con forma de racimos de uva en tonos morado y verde.', medidas: '', color: '#8b5a7a', imagen: 'images/articulo/articulo3.png' },
  { id: 'AR-004', nombre: 'Lila pop', precio: 80, categoria: 'Aretes', desc: 'Aretes tejidos a crochet con delicado diseño floral en tono morado.', medidas: '', color: '#b28bc9', imagen: 'images/articulo/articulo4.png' },
  { id: 'AR-005', nombre: 'Alas de Hilo', precio: 80, categoria: 'Aretes', desc: 'Aretes tejidos a crochet con delicado diseño de mariposa.', medidas: '', color: '#d9b3a7', imagen: 'images/articulo/articulo5.png' },
  { id: 'AR-006', nombre: 'Flor Roja', precio: 60, categoria: 'Aretes', desc: 'Aretes tejidos a crochet con delicado diseño floral en rojo.', medidas: '', color: '#c45a5a', imagen: 'images/articulo/articulo6.png' },
  { id: 'AR-007', nombre: 'Flor de Sol', precio: 50, categoria: 'Aretes', desc: 'Aretes tejidos a crochet con diseño floral en amarillo y verde.', medidas: '', color: '#e3b358', imagen: 'images/articulo/articulo7.png' },
  { id: 'AR-008', nombre: 'Flor de Fuego', precio: 50, categoria: 'Aretes', desc: 'Aretes tejidos a crochet en rojo, con un delicado diseño floral lleno de carácter.', medidas: '', color: '#c45a3a', imagen: 'images/articulo/articulo8.png' },
  { id: 'AR-009', nombre: 'Danza de Sol', precio: 50, categoria: 'Aretes', desc: 'Aretes tejidos a crochet con delicadas flores en amarillo y centro oscuro.', medidas: '', color: '#e8c65a', imagen: 'images/articulo/articulo9.png' },
  { id: 'AR-010', nombre: 'Rubí', precio: 50, categoria: 'Aretes', desc: 'Aretes de crochet en rojo con diseño delicado.', medidas: '', color: '#ba3b3b', imagen: 'images/articulo/articulo10.png' },
  { id: 'AR-011', nombre: 'Llama', precio: 70, categoria: 'Aretes', desc: 'Aretes de crochet con diseño floral en tonos vibrantes.', medidas: '', color: '#d97a4a', imagen: 'images/articulo/articulo11.png' },
  { id: 'AR-012', nombre: 'Pétalo Carmesí', precio: 50, categoria: 'Aretes', desc: 'Aretes de crochet con delicado diseño floral.', medidas: '', color: '#b34b4b', imagen: null },
  { id: 'BL-001', nombre: 'Azul Encanto', precio: 550, categoria: 'Blusa', desc: 'Blusa tejida a crochet con diseño calado y cuello amplio.', medidas: '51x52 cm', color: '#4a7f9c', imagen: 'images/articulo/articulo13.png' },
  { id: 'BL-002', nombre: 'Suspiro de Rosa', precio: 400, categoria: 'Blusa', desc: 'Top tejido a crochet con flor central y delicados detalles calados.', medidas: '42x45 cm', color: '#d998a3', imagen: 'images/articulo/articulo14.png' },
  { id: 'BL-003', nombre: 'Tierra Tejida', precio: 500, categoria: 'Blusa', desc: 'Prenda tejida a crochet en tono café con delicado diseño calado.', medidas: '51x35 cm', color: '#8f7256', imagen: 'images/articulo/articulo15.png' },
  { id: 'BL-004', nombre: 'Arena Natural', precio: 500, categoria: 'Blusa', desc: 'Top tejido a crochet en tono beige con diseño sencillo y artesanal.', medidas: '46x37 cm', color: '#d9c5a3', imagen: null },
  { id: 'BL-005', nombre: 'Flor Azul', precio: 500, categoria: 'Blusa', desc: 'Top tejido a crochet con flor central y delicado acabado calado.', medidas: '31x39 cm', color: '#6b8bb0', imagen: 'images/articulo/articulo17.png' },
  { id: 'BL-006', nombre: 'Azul Profundo', precio: 500, categoria: 'Blusa', desc: 'Prenda tejida a crochet en tono azul con diseño calado y vuelo.', medidas: '50x32 cm', color: '#275b7a', imagen: 'images/articulo/articulo18.png' },
  { id: 'BL-007', nombre: 'Esencia', precio: 400, categoria: 'Blusa', desc: 'Blusa tejida a crochet en tono beige con delicados detalles calados.', medidas: '46x34 cm', color: '#dac2a0', imagen: null },
  { id: 'BL-008', nombre: 'Noche Tejida', precio: 500, categoria: 'Blusa', desc: 'Prenda tejida a crochet en azul profundo, con un delicado juego de calados.', medidas: '50x36 cm', color: '#1f4663', imagen: null },
  { id: 'BL-009', nombre: 'Rojo Encanto', precio: 450, categoria: 'Blusa', desc: 'Prenda tejida a crochet con diseño calado y detalles que resaltan su trabajo artesanal.', medidas: '46x51 cm', color: '#b54a4a', imagen: null },
  { id: 'BL-010', nombre: 'Blanca Aurora', precio: 450, categoria: 'Blusa', desc: 'Top de crochet blanco con textura calada y acabado ondulado.', medidas: '39x45 cm', color: '#eae3d8', imagen: null },
  { id: 'CC-01', nombre: 'Café Bohemio', precio: 500, categoria: 'Blusa', desc: 'Chaleco de crochet con flecos y detalle central.', medidas: '50x55 cm', color: '#7d6248', imagen: null },
  { id: 'BL-011', nombre: 'Brisa Turquesa', precio: 400, categoria: 'Blusa', desc: 'Top de crochet en tono turquesa con tejido calado.', medidas: '41x42 cm', color: '#5e9e9e', imagen: null },
  { id: 'CE-001', nombre: 'Jardín Romántico', precio: 350, categoria: 'Cenefa', desc: 'Cenefa tejida a crochet con delicados motivos florales.', medidas: '13x53 cm', color: '#bba88c', imagen: null },
  { id: 'CE-002', nombre: 'Dulce Abanico', precio: 250, categoria: 'Cenefa', desc: 'Cenefa de justán tejida a crochet con diseño de abanicos.', medidas: '10x51 cm', color: '#cbb59b', imagen: null },
  { id: 'CE-003', nombre: 'Jardín Romántico', precio: 250, categoria: 'Cenefa', desc: 'Cenefa tejida a crochet con diseño de hojas y detalles calados.', medidas: '13x56 cm', color: '#b2a084', imagen: null },
  { id: 'CE-004', nombre: 'Primavera', precio: 300, categoria: 'Cenefa', desc: 'Cenefa tejida a crochet con delicados motivos florales.', medidas: '15x62 cm', color: '#b8a67e', imagen: null },
  { id: 'CE-005', nombre: 'Lazos Tejidos', precio: 350, categoria: 'Cenefa', desc: 'Cenefa tejida a crochet con delicado diseño de moños.', medidas: '20x96 cm', color: '#b7a287', imagen: null },
  { id: 'CE-006', nombre: 'Encanto Floral', precio: 300, categoria: 'Cenefa', desc: 'Cenefa tejida a crochet con delicados motivos florales y acabado festoneado.', medidas: '18x60 cm', color: '#c6af93', imagen: null },
  { id: 'CE-007', nombre: 'Rosal', precio: 350, categoria: 'Cenefa', desc: 'Cenefa tejida a crochet con flores entrelazadas que evocan tradición.', medidas: '21x66 cm', color: '#b5937a', imagen: null },
  { id: 'CE-008', nombre: 'Flor Encantada', precio: 350, categoria: 'Cenefa', desc: 'Cenefa tejida a crochet con delicados motivos florales que realzan cada puntada.', medidas: '22x54 cm', color: '#c6a88b', imagen: null },
  { id: 'CE-009', nombre: 'Ronda Floral', precio: 300, categoria: 'Cenefa', desc: 'Cenefa de crochet con delicados motivos florales.', medidas: '22x55 cm', color: '#b8a086', imagen: null },
  { id: 'CE-010', nombre: 'Encaje de Gardenias', precio: 350, categoria: 'Cenefa', desc: 'Cenefa de crochet con flores entrelazadas y delicados detalles.', medidas: '15x55 cm', color: '#d6c0a8', imagen: null },
  { id: 'CE-011', nombre: 'Encaje de Flores', precio: 350, categoria: 'Cenefa', desc: 'Cenefa de crochet con delicados motivos florales.', medidas: '20x60 cm', color: '#cbb293', imagen: null },
  { id: 'CE-012', nombre: 'Trama Floral', precio: 300, categoria: 'Cenefa', desc: 'Cenefa de crochet con motivos florales y geométricos.', medidas: '15x48 cm', color: '#ad9a82', imagen: null }
];

const grid = document.getElementById('productosGrid');
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let favoritos = new Set(JSON.parse(localStorage.getItem('favoritos')) || []);

// Badges - marcar productos populares y nuevos
const productosPopulares = ['BL-001', 'AR-001', 'CE-001'];
const productosNuevos = ['AR-003', 'BL-005', 'CE-008'];

let productoActual = null;

function renderProductos(filtroCat = 'Todos', termoBusqueda = '', ordenamiento = 'nombre') {
  let filtrados = productos;

  if (filtroCat !== 'Todos') {
    filtrados = filtrados.filter(p => p.categoria === filtroCat);
  }

  if (termoBusqueda) {
    const termLower = termoBusqueda.toLowerCase();
    filtrados = filtrados.filter(p =>
      p.id.toLowerCase().includes(termLower) ||
      p.nombre.toLowerCase().includes(termLower) ||
      p.desc.toLowerCase().includes(termLower) ||
      p.categoria.toLowerCase().includes(termLower)
    );
  }

  // Ordenamiento
  if (ordenamiento === 'precio-asc') {
    filtrados.sort((a, b) => a.precio - b.precio);
  } else if (ordenamiento === 'precio-desc') {
    filtrados.sort((a, b) => b.precio - a.precio);
  } else {
    filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  grid.innerHTML = '';

  const sinResultados = document.getElementById('sinResultados');
  if (filtrados.length === 0) {
    if (sinResultados) sinResultados.style.display = 'block';
    return;
  }
  if (sinResultados) sinResultados.style.display = 'none';

  filtrados.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    const colorFondo = p.color || '#d9cdbc';
    const icono = p.categoria === 'Aretes' ? '◯' : p.categoria === 'Blusa' ? '⊹' : '◈';

    let badge = '';
    if (productosPopulares.includes(p.id)) {
      badge = '<div class="badge-producto popular">⭐ POPULAR</div>';
    } else if (productosNuevos.includes(p.id)) {
      badge = '<div class="badge-producto nuevo">✨ NUEVO</div>';
    }

    // Generar elemento de imagen: real o placeholder
    let imagenHTML = `<div class="img-placeholder" style="background-color:${colorFondo}; color:#423a30; font-size:2.5rem;">${icono}</div>`;
    if (p.imagen) {
      const localImage = getImageUrl(p.imagen);
      imagenHTML = `<img class="img-producto" src="${localImage}" alt="${p.nombre}" onerror="this.parentElement.innerHTML='<div class=\\'img-placeholder\\' style=\\'background-color:${colorFondo}; color:#423a30; font-size:2.5rem;\\'>${icono}</div>'">`;
    }

    const agotado = p.stock !== undefined && Number(p.stock) <= 0;
    card.innerHTML = `
      <button class="favorite-btn ${favoritos.has(p.id) ? 'active' : ''}" data-id="${p.id}" aria-label="${favoritos.has(p.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}">${favoritos.has(p.id) ? '♥' : '♡'}</button>
      ${badge}
      <div class="img-container" onclick="abrirDetalle('${p.id}')" style="cursor:pointer;">
        ${imagenHTML}
      </div>
      <div class="nombre">${p.nombre}</div>
      <div class="codigo-precio">${p.id} · $${p.precio} MXN ${agotado ? '<span style="font-size:0.75rem; color:#b7652b; font-weight:600;">(Agotado)</span>' : ''}</div>
      <div class="categoria">${p.categoria}</div>
      <div class="desc">${p.desc}</div>
      ${p.medidas ? `<div class="medidas">📏 ${p.medidas}</div>` : ''}
      <button class="btn-agregar" data-id="${p.id}" ${agotado ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}>${agotado ? 'Agotado' : '➕ Agregar'}</button>
      <button class="btn-ver-detalle" onclick="abrirDetalle('${p.id}')">👁 Ver Detalle</button>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.btn-agregar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const prod = productos.find(p => p.id === id);
      if (prod) {
        agregarAlCarrito(prod);
        btn.textContent = '✓ Agregado';
        setTimeout(() => btn.textContent = '➕ Agregar', 1500);
      }
    });
  });

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      alternarFavorito(btn.dataset.id);
    });
  });
}

function alternarFavorito(id) {
  if (favoritos.has(id)) {
    favoritos.delete(id);
  } else {
    favoritos.add(id);
  }
  localStorage.setItem('favoritos', JSON.stringify([...favoritos]));
  const btn = document.querySelector(`.favorite-btn[data-id="${id}"]`);
  if (btn) {
    const activo = favoritos.has(id);
    btn.classList.toggle('active', activo);
    btn.textContent = activo ? '♥' : '♡';
    btn.setAttribute('aria-label', activo ? 'Quitar de favoritos' : 'Agregar a favoritos');
  }
}

function abrirDetalle(productoId) {
  productoActual = productos.find(p => p.id === productoId);
  if (!productoActual) return;

  const modalImgDiv = document.getElementById('modalImg');
  const icono = productoActual.categoria === 'Aretes' ? '◯' : productoActual.categoria === 'Blusa' ? '⊹' : '◈';

  if (productoActual.imagen) {
    const localImage = getImageUrl(productoActual.imagen);
    modalImgDiv.innerHTML = `<img src="${localImage}" alt="${productoActual.nombre}" style="width:100%; height:100%; object-fit:cover; border-radius:20px;" onerror="this.parentElement.textContent='${icono}'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center'; this.parentElement.style.fontSize='3rem'; this.parentElement.style.backgroundColor='${productoActual.color || '#d9cdbc'}';">`;
  } else {
    modalImgDiv.textContent = icono;
    modalImgDiv.style.backgroundColor = productoActual.color || '#d9cdbc';
  }

  document.getElementById('modalNombre').textContent = productoActual.nombre;
  document.getElementById('modalPrecio').textContent = `${productoActual.id} · $${productoActual.precio} MXN`;
  document.getElementById('modalCategoria').textContent = `Categoría: ${productoActual.categoria}`;
  document.getElementById('modalDesc').textContent = productoActual.desc;
  document.getElementById('modalMedidas').textContent = productoActual.medidas ? `📏 Medidas: ${productoActual.medidas}` : '';

  document.getElementById('modalDetalle').classList.add('open');
}

function cerrarModal() {
  document.getElementById('modalDetalle').classList.remove('open');
  productoActual = null;
}

function agregarDelModal() {
  if (productoActual) {
    agregarAlCarrito(productoActual);
    cerrarModal();
  }
}

function compartirProducto() {
  if (!productoActual) return;
  const texto = `Mira esta artesanía en Tejiendo Tradiciones: ${productoActual.nombre} - $${productoActual.precio} MXN (${productoActual.categoria})`;
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
}

function buscarProductos(ocultarSugerencias = true) {
  const termino = document.getElementById('searchInput').value;
  const cat = document.querySelector('#filtroCategoria .active')?.dataset.cat || 'Todos';
  const orden = document.getElementById('filtroOrdenamiento').value;
  renderProductos(cat, termino, orden);
  if (ocultarSugerencias) {
    document.getElementById('searchSuggestions').classList.remove('open');
  }
}

function mostrarSugerencias() {
  const input = document.getElementById('searchInput');
  const panel = document.getElementById('searchSuggestions');
  const termino = input.value.trim().toLowerCase();
  if (!termino) {
    panel.innerHTML = '';
    panel.classList.remove('open');
    return;
  }

  const sugerencias = productos.filter(p => [p.id, p.nombre, p.categoria]
    .some(valor => valor.toLowerCase().includes(termino))).slice(0, 6);

  panel.innerHTML = sugerencias.map(p => `
    <button class="search-suggestion" type="button" data-search-value="${p.nombre}">
      <span>${p.nombre}</span><small>${p.id} · ${p.categoria}</small>
    </button>
  `).join('');
  panel.classList.toggle('open', sugerencias.length > 0);
  panel.querySelectorAll('.search-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.searchValue;
      buscarProductos();
    });
  });
}

function limpiarFiltros() {
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('#filtroCategoria button').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-cat="Todos"]').classList.add('active');
  document.getElementById('filtroOrdenamiento').value = 'nombre';
  renderProductos('Todos', '', 'nombre');
}

function agregarAlCarrito(prod) {
  const existente = carrito.find(item => item.id === prod.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...prod, cantidad: 1 });
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarCarritoUI();
}

function actualizarCarritoUI() {
  const container = document.getElementById('cartItems');
  const totalSpan = document.getElementById('cartTotal');
  const navCountSpan = document.getElementById('navCartCount');
  const emptyMsg = document.getElementById('cartEmpty');
  const finalizarBtn = document.getElementById('finalizarBtn');
  const vaciarBtn = document.getElementById('vaciarBtn');

  let total = 0;
  let count = 0;
  container.innerHTML = '';

  if (carrito.length === 0) {
    emptyMsg.style.display = 'block';
    totalSpan.style.display = 'none';
    finalizarBtn.style.display = 'none';
    vaciarBtn.style.display = 'none';
    document.getElementById('clienteForm').style.display = 'none';
    navCountSpan.textContent = '0';
    return;
  }

  emptyMsg.style.display = 'none';
  totalSpan.style.display = 'block';
  finalizarBtn.style.display = 'block';
  vaciarBtn.style.display = 'block';
  document.getElementById('clienteForm').style.display = 'block';

  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    count += item.cantidad;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img class="cart-item-image" src="${getImageUrl(item.imagen)}" alt="${item.nombre}" onerror="this.style.visibility='hidden'">
      <div class="cart-item-info">
        <strong>${item.nombre}</strong><br>
        <span style="font-size:0.85rem; color:#666;">$${(item.precio * item.cantidad)} MXN</span>
      </div>
      <div class="cart-item-controls">
        <button onclick="cambiarCantidad('${item.id}', -1)">−</button>
        <span class="cart-item-cantidad">${item.cantidad}</span>
        <button onclick="cambiarCantidad('${item.id}', 1)">+</button>
        <button class="cart-item-remove" onclick="eliminarDelCarrito('${item.id}')">✕</button>
      </div>
    `;
    container.appendChild(div);
  });

  totalSpan.textContent = `Total: $${total} MXN`;
  navCountSpan.textContent = count;
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(p => p.id === id);
  if (item) {
    item.cantidad += cambio;
    if (item.cantidad <= 0) {
      carrito = carrito.filter(p => p.id !== id);
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarritoUI();
  }
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(p => p.id !== id);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarCarritoUI();
}

function vaciarCarrito() {
  if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarritoUI();
  }
}

function finalizarWhatsApp() {
  if (carrito.length === 0) return;

  const nombre = document.getElementById('clienteNombre').value.trim();
  const telefono = document.getElementById('clienteTelefono').value.trim();
  const direccion = document.getElementById('clienteDireccion').value.trim();
  if (!nombre || !telefono || !direccion) {
    alert('Completa tu nombre, teléfono y dirección antes de finalizar el pedido.');
    return;
  }

  let mensaje = `¡Hola! Me interesa hacer un pedido en Tejiendo Tradiciones.\n\nCliente: ${nombre}\nTeléfono: ${telefono}\nDirección: ${direccion}\n\nProductos:\n`;
  let total = 0;

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    mensaje += `• ${item.nombre} (x${item.cantidad}) - $${subtotal} MXN\n`;
  });

  mensaje += `\nTotal: $${total} MXN\n\nPor favor, confirma disponibilidad y forma de pago.`;

  const url = `https://wa.me/529831066117?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

// Eventos filtros de categoría
document.querySelectorAll('#filtroCategoria button').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#filtroCategoria button').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    buscarProductos();
  });
});

document.getElementById('filtroOrdenamiento').addEventListener('change', buscarProductos);

document.getElementById('searchInput').addEventListener('input', () => {
  mostrarSugerencias();
  buscarProductos(false);
});

// Carrito sidebar
document.getElementById('openCartBtn').addEventListener('click', () => {
  document.getElementById('cartSidebar').classList.add('open');
});
document.getElementById('closeCart').addEventListener('click', () => {
  document.getElementById('cartSidebar').classList.remove('open');
});

// Cerrar modal al hacer click fuera
document.getElementById('modalDetalle').addEventListener('click', (e) => {
  if (e.target.id === 'modalDetalle') cerrarModal();
});

// Cargar productos en vivo desde Supabase
async function cargarProductosDesdeSupabase() {
  if (!window.supabaseClient) return;
  try {
    const { data, error } = await window.supabaseClient
      .from('productos')
      .select('*')
      .order('nombre');

    if (!error && data && data.length > 0) {
      productos = data.map(item => ({
        id: item.codigo || item.id,
        nombre: item.nombre,
        precio: Number(item.precio),
        categoria: item.categoria,
        desc: item.descripcion || '',
        medidas: item.medidas || '',
        color: item.color || '#d9cdbc',
        imagen: item.imagen || '',
        stock: Number(item.stock ?? 0)
      }));
      renderProductos();
    }
  } catch (e) {
    console.warn('Usando catálogo local:', e);
  }
}

// Inicialización
renderProductos('Todos', '', 'nombre');
actualizarCarritoUI();
cargarProductosDesdeSupabase();
