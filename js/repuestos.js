// repuestos.js - Funcionalidad para la página de repuestos
document.addEventListener('DOMContentLoaded', function () {
    // Filtrado por marca
    const filterButtons = document.querySelectorAll('.filter-btn');
    const marcaSections = document.querySelectorAll('.marca-section');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const marca = this.getAttribute('data-marca');

            // Actualizar botón activo
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Scroll suave al principio
            window.scrollTo({
                top: 300,
                behavior: 'smooth'
            });

            // Mostrar/ocultar secciones
            if (marca === 'all') {
                marcaSections.forEach(section => {
                    section.style.display = 'block';
                    setTimeout(() => section.classList.add('active'), 10);
                });
            } else {
                marcaSections.forEach(section => {
                    if (section.id === marca) {
                        section.style.display = 'block';
                        setTimeout(() => section.classList.add('active'), 10);
                    } else {
                        section.classList.remove('active');
                        setTimeout(() => section.style.display = 'none', 300);
                    }
                });
            }
        });
    });

    // Botones agregar al carrito
    document.querySelectorAll('.btn-agregar-carrito').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            const productCard = this.closest('.producto-card');
            const productName = productCard.querySelector('.producto-nombre').textContent;
            const productPrice = productCard.querySelector('.producto-precio').textContent;
            const productImage = productCard.querySelector('.producto-imagen').src;

            const producto = {
                id: productId,
                nombre: productName,
                precio: parseFloat(productPrice.replace('$', '').replace(',', '')),
                imagen: productImage,
                cantidad: 1
            };

            // Usar la función global del carrito
            if (window.Carrito && window.Carrito.agregarProducto) {
                window.Carrito.agregarProducto(producto);
            } else {
                // Fallback si no existe la función global
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                const productoExistente = carrito.find(item => item.id === productId);

                if (productoExistente) {
                    productoExistente.cantidad++;
                } else {
                    carrito.push(producto);
                }

                localStorage.setItem('carrito', JSON.stringify(carrito));
                window.dispatchEvent(new Event('carritoActualizado'));
            }

            // Efecto de animación en el botón
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
            this.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

            // Mostrar notificación
            mostrarNotificacion('Producto agregado al carrito');

            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 1500);
        });
    });

    // Vista rápida de productos
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalContent = document.querySelector('.modal-content');

    document.querySelectorAll('.quick-view').forEach(button => {
        button.addEventListener('click', function () {
            const productCard = this.closest('.producto-card');
            const productName = productCard.querySelector('.producto-nombre').textContent;
            const productDesc = productCard.querySelector('.producto-descripcion').textContent;
            const productPrice = productCard.querySelector('.producto-precio').textContent;
            const productImage = productCard.querySelector('.producto-imagen').src;
            const productId = productCard.querySelector('.btn-agregar-carrito').getAttribute('data-id');

            // Crear contenido del modal
            modalContent.innerHTML = `
                <div class="modal-producto-imagen">
                    <img src="${productImage}" alt="${productName}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
                </div>
                <div class="modal-producto-info">
                    <h2>${productName}</h2>
                    <p class="modal-descripcion">${productDesc}</p>
                    <div class="modal-precio">${productPrice}</div>
                    <button class="modal-agregar-carrito" data-id="${productId}">
                        <i class="fas fa-cart-plus"></i> Agregar al Carrito
                    </button>
                    <p class="modal-envio">🚚 Envío gratuito a todo el país</p>
                    <p class="modal-garantia">✅ 1 año de garantía</p>
                </div>
            `;

            // Mostrar modal
            modalOverlay.classList.add('active');

            // Agregar funcionalidad al botón dentro del modal
            const modalAddButton = modalContent.querySelector('.modal-agregar-carrito');
            modalAddButton.addEventListener('click', function () {
                const modalProductId = this.getAttribute('data-id');

                const producto = {
                    id: modalProductId,
                    nombre: productName,
                    precio: parseFloat(productPrice.replace('$', '').replace(',', '')),
                    imagen: productImage,
                    cantidad: 1
                };

                // Usar la función global del carrito
                if (window.Carrito && window.Carrito.agregarProducto) {
                    window.Carrito.agregarProducto(producto);
                } else {
                    // Fallback si no existe la función global
                    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                    const productoExistente = carrito.find(item => item.id === modalProductId);

                    if (productoExistente) {
                        productoExistente.cantidad++;
                    } else {
                        carrito.push(producto);
                    }

                    localStorage.setItem('carrito', JSON.stringify(carrito));
                    window.dispatchEvent(new Event('carritoActualizado'));
                }

                mostrarNotificacion('Producto agregado al carrito');

                // Cerrar modal después de agregar
                setTimeout(() => {
                    modalOverlay.classList.remove('active');
                }, 500);
            });
        });
    });

    // Cerrar modal
    modalClose.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });

    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje) {
        // Eliminar notificaciones anteriores
        const notificacionesAnteriores = document.querySelectorAll('.notificacion-carrito');
        notificacionesAnteriores.forEach(notif => notif.remove());

        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion-carrito';
        notificacion.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${mensaje}</span>
        `;

        document.body.appendChild(notificacion);

        // Mostrar notificación con animación
        setTimeout(() => {
            notificacion.classList.add('show');
        }, 10);

        // Ocultar y remover después de 3 segundos
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.remove();
                }
            }, 300);
        }, 3000);
    }

    // Ajustar altura de tarjetas
    function ajustarAlturasTarjetas() {
        const tarjetas = document.querySelectorAll('.producto-card');

        // Encontrar la altura máxima
        let alturaMaxima = 0;
        tarjetas.forEach(tarjeta => {
            const altura = tarjeta.offsetHeight;
            if (altura > alturaMaxima) alturaMaxima = altura;
        });

        // Aplicar altura uniforme
        tarjetas.forEach(tarjeta => {
            tarjeta.style.minHeight = '520px';
        });
    }

    // Ajustar alturas después de cargar
    setTimeout(ajustarAlturasTarjetas, 100);

    // Ajustar alturas al cambiar de filtro
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(ajustarAlturasTarjetas, 300);
        });
    });

    // Ajustar alturas al redimensionar
    window.addEventListener('resize', ajustarAlturasTarjetas);

    // Inicializar contador del carrito si no hay cart-global.js
    function inicializarContadorCarrito() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount && !window.Carrito) {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
            cartCount.textContent = totalItems;
        }
    }

    inicializarContadorCarrito();
});

// Validar imágenes rotas
function validarImagenes() {
    const images = document.querySelectorAll('.producto-imagen');
    const placeholder = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';

    images.forEach(img => {
        img.onerror = function () {
            this.src = placeholder;
            this.alt = 'Imagen no disponible';
        };
    });
}

// Ejecutar validación de imágenes cuando el DOM esté cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validarImagenes);
} else {
    validarImagenes();
}

// Al final de repuestos.js, agrega:
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar Session Manager
    if (!window.sessionManager) {
        window.sessionManager = new SessionManager();
    }

    // Agregar validación de imágenes
    const images = document.querySelectorAll('.producto-imagen');
    const placeholder = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

    images.forEach(img => {
        img.onerror = function () {
            this.src = placeholder;
            this.alt = 'Imagen no disponible';
        };
    });

    // Efecto de aparición para productos
    const productoCards = document.querySelectorAll('.producto-card');
    productoCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
    });
});