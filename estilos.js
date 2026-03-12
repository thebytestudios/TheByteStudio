// Variable global para evitar duplicados
let googleSignInInitialized = false;

// Esperar a que Google API esté lista
function initGoogleSignIn() {
  // Si ya se inicializó, no hacer nada
  if (googleSignInInitialized) {
    console.log('⚠️ Google Sign-In ya fue inicializado');
    return;
  }

  const clientId = '360083108712-av27a1kogf99cl1f67nivm5q82vb4cej.apps.googleusercontent.com';
  
  // Verificar que Google API esté disponible
  if (!window.google || !window.google.accounts) {
    console.error('❌ Google API aún no está lista');
    setTimeout(initGoogleSignIn, 500); // Reintentar en 500ms
    return;
  }

  console.log('✅ Google API está lista');

  try {
    // Inicializar Google Accounts
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      ux_mode: 'popup'
    });
    
    // Obtener el contenedor del botón
    const googleSignInDiv = document.getElementById('googleSignIn');
    
    if (!googleSignInDiv) {
      console.error('❌ No encontré el div #googleSignIn en el HTML');
      return;
    }

    // Limpiar el div
    googleSignInDiv.innerHTML = '';
    
    // Renderizar el botón
    google.accounts.id.renderButton(
      googleSignInDiv,
      { 
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: '280'
      }
    );

    googleSignInInitialized = true;
    console.log('✅ Botón de Google Sign-In renderizado exitosamente');
    
  } catch (error) {
    console.error('❌ Error inicializando Google Sign-In:', error);
  }
}

// Manejar la respuesta de Google
function handleCredentialResponse(response) {
  console.log('✅ Usuario autenticado con Google');
  
  try {
    // Decodificar el JWT
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    
    const userData = JSON.parse(jsonPayload);
    console.log('👤 Usuario:', userData.name);
    
    // Guardar en localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Actualizar UI
    updateUI(userData);
  } catch (error) {
    console.error('❌ Error decodificando JWT:', error);
  }
}

// Actualizar la interfaz
function updateUI(userData) {
  console.log('🎨 Actualizando UI...');
  
  const googleSignInDiv = document.getElementById('googleSignIn');
  const profileDiv = document.getElementById('profile');
  const profilePic = document.getElementById('profilePic');
  const userName = document.getElementById('userName');

  // Ocultar botón de Google
  if (googleSignInDiv) {
    googleSignInDiv.style.display = 'none';
  }

  // Mostrar perfil
  if (profileDiv) {
    profileDiv.classList.remove('hidden');
  }

  // Cargar foto
  if (profilePic) {
    profilePic.src = userData.picture;
  }

  // Mostrar nombre
  if (userName) {
    userName.textContent = userData.name || userData.email;
  }

  console.log('✅ UI actualizada');
}

// Cerrar sesión
function logout() {
  console.log('🚪 Cerrando sesión...');
  
  try {
    google.accounts.id.disableAutoSelect();
  } catch (error) {
    console.log('⚠️', error);
  }
  
  localStorage.removeItem('user');
  
  const profileDiv = document.getElementById('profile');
  const googleSignInDiv = document.getElementById('googleSignIn');
  
  if (profileDiv) {
    profileDiv.classList.add('hidden');
  }

  if (googleSignInDiv) {
    googleSignInDiv.style.display = 'block';
  }
  
  console.log('✅ Sesión cerrada');
}

// ===== CARRUSEL =====
function setupCarousel() {
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  
  if (!prevBtn || !nextBtn) {
    console.log('⚠️ No hay botones de carrusel');
    return;
  }

  let currentIndex = 0;
  const cards = document.querySelectorAll('.card');
  const totalCards = cards.length;

  console.log(`✅ Carrusel: ${totalCards} tarjetas`);

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateCarousel(currentIndex);
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel(currentIndex);
  });
}

function updateCarousel(index) {
  const carousel = document.getElementById('carousel');
  if (carousel) {
    carousel.style.transform = `translateX(${-index * 100}%)`;
  }
}

// ===== BOTONES DE COMPRA Y DEMO =====
function setupButtonListeners() {
  // Botones de compra
  const buyButtons = document.querySelectorAll('.btn-buy');
  buyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('Por favor, inicia sesión para comprar');
        return;
      }
      alert('¡Excelente! Procesando compra para: ' + user.name);
    });
  });

  // Botones de demo
  const demoButtons = document.querySelectorAll('.demo-btn');
  demoButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Abriendo demo de la plantilla...');
    });
  });
}

// ===== ANIMACIÓN DE TARJETAS =====
function setupCardObserver() {
  const cards = document.querySelectorAll('.card');
  if (cards.length === 0) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  });

  cards.forEach(card => observer.observe(card));
}

// ===== MODAL =====
function closeModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function login() {
  const emailInput = document.getElementById('emailInput');
  if (!emailInput) return;
  
  const email = emailInput.value;
  if (email === "") {
    alert("Ingresa tu correo");
    return;
  }

  localStorage.setItem("userEmail", email);
  closeModal();
}

window.onclick = function(event) {
  const modal = document.getElementById('loginModal');
  if (modal && event.target === modal) {
    modal.style.display = 'none';
  }
};

// ===== INICIAR TODO CUANDO EL DOM ESTÁ LISTO =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM cargado');
  
  // Inicializar Google Sign-In
  initGoogleSignIn();
  
  // Verificar si hay sesión guardada
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    console.log('🔄 Restaurando sesión...');
    updateUI(user);
  }

  // Configurar carrusel y botones
  setupCarousel();
  setupButtonListeners();
  setupCardObserver();
  
  console.log('✅ Todo inicializado');
});

console.log('📦 estilos.js cargado');

// Función para abrir/cerrar el menú al hacer clic
function toggleProfileMenu(event) {
    event.stopPropagation(); // Evita que el clic se cierre inmediatamente
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show'); // Añade o quita la visibilidad
    }
}

// Cerrar el menú automáticamente si haces clic en cualquier otra parte de la pantalla
window.onclick = function(event) {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
}
