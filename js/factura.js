// factura.js - Lógica para la página de factura y pago
document.addEventListener('DOMContentLoaded', function() {
    console.log("=== FACTURA.JS CARGADO ===");
    
    // ===================================================================
    // ELEMENTOS DEL DOM
    // ===================================================================
    const numeroPedidoElement = document.getElementById('numeroPedido');
    const fechaPedidoElement = document.getElementById('fechaPedido');
    const clienteNombreElement = document.getElementById('clienteNombre');
    const clienteEmailElement = document.getElementById('clienteEmail');
    const clienteTelefonoElement = document.getElementById('clienteTelefono');
    const clienteDireccionElement = document.getElementById('clienteDireccion');
    const productosListaElement = document.getElementById('productosLista');
    const facturaSubtotalElement = document.getElementById('facturaSubtotal');
    const facturaDescuentoElement = document.getElementById('facturaDescuento');
    const facturaTotalElement = document.getElementById('facturaTotal');
    const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');
    const modalProcesando = document.getElementById('modalProcesando');
    const motoAnimada = document.getElementById('motoAnimada');
    const progresoBar = document.getElementById('progresoBar');
    const progresoTexto = document.getElementById('progresoTexto');
    
    // Elementos de métodos de pago
    const metodoTarjeta = document.getElementById('tarjetaMetodo');
    const metodoQR = document.getElementById('qrMetodo');
    const contenidoTarjeta = metodoTarjeta.querySelector('.metodo-contenido');
    const contenidoQR = metodoQR.querySelector('.metodo-contenido');
    
    // ===================================================================
    // VARIABLES GLOBALES
    // ===================================================================
    let pedidoData = {};
    let carritoData = [];
    let userData = {};
    let metodoPagoSeleccionado = 'tarjeta';
    
    // ===================================================================
    // INICIALIZACIÓN
    // ===================================================================
    function init() {
        // Cargar datos del pedido desde localStorage
        cargarDatosPedido();
        
        // Generar número de pedido
        generarNumeroPedido();
        
        // Cargar información del usuario
        cargarUsuario();
        
        // Cargar productos del carrito
        cargarProductos();
        
        // Calcular totales
        calcularTotales();
        
        // Configurar eventos
        configurarEventos();
        
        // Configurar métodos de pago
        configurarMetodosPago();
        
        // Generar QR si está seleccionado
        setTimeout(() => generarQR(), 500);
        
        console.log("Factura inicializada:", pedidoData);
    }
    
    // ===================================================================
    // FUNCIONES DE CARGA DE DATOS
    // ===================================================================
    function cargarDatosPedido() {
        // Intentar obtener datos del pedido
        const pendingPurchase = JSON.parse(localStorage.getItem('pendingPurchase') || '{}');
        
        if (Object.keys(pendingPurchase).length > 0) {
            pedidoData = pendingPurchase;
            console.log("Usando datos de compra pendiente");
        } else {
            // Si no hay datos, redirigir al carrito
            console.log("No hay datos de pedido, redirigiendo...");
            setTimeout(() => window.location.href = 'carrito.html', 1000);
            return;
        }
    }
    
    function generarNumeroPedido() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const numero = `PED-${timestamp.toString().slice(-8)}${random.toString().padStart(3, '0')}`;
        
        pedidoData.numeroPedido = numero;
        numeroPedidoElement.textContent = numero;
        
        // Mostrar fecha actual
        const fecha = new Date();
        fechaPedidoElement.textContent = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function cargarUsuario() {
        // Intentar obtener usuario
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
            
            if (user && user.loggedIn) {
                userData = user;
            } else if (currentUser) {
                userData = currentUser;
            } else if (allUsers.length > 0) {
                // Usar el último usuario registrado
                userData = allUsers[allUsers.length - 1];
            } else {
                // Usuario anónimo
                userData = {
                    name: 'Cliente',
                    email: 'No registrado',
                    phone: 'No proporcionado',
                    address: 'No proporcionada'
                };
            }
            
            // Actualizar elementos del DOM
            clienteNombreElement.textContent = userData.name || 'No proporcionado';
            clienteEmailElement.textContent = userData.email || 'No proporcionado';
            clienteTelefonoElement.textContent = userData.phone || 'No proporcionado';
            clienteDireccionElement.textContent = userData.address || 'No proporcionada';
            
        } catch (error) {
            console.error("Error cargando usuario:", error);
            userData = {
                name: 'Cliente',
                email: 'Error cargando datos',
                phone: '--',
                address: '--'
            };
        }
    }
    
    function cargarProductos() {
        // Obtener productos del pedido
        carritoData = pedidoData.carrito || JSON.parse(localStorage.getItem('carrito') || '[]');
        
        if (carritoData.length === 0) {
            productosListaElement.innerHTML = `
                <div class="carrito-vacio-factura">
                    <i class="fas fa-shopping-cart"></i>
                    <p>No hay productos en el pedido</p>
                </div>
            `;
            return;
        }
        
        // Limpiar lista
        productosListaElement.innerHTML = '';
        
        // Agregar cada producto
        carritoData.forEach((producto, index) => {
            const subtotal = producto.precio * (producto.cantidad || 1);
            
            const productoElement = document.createElement('div');
            productoElement.className = 'producto-factura-item';
            productoElement.innerHTML = `
                <div class="producto-factura-info">
                    <div class="producto-factura-imagen">
                        <img src="${producto.imagen || 'https://via.placeholder.com/300x200?text=Producto'}" 
                             alt="${producto.nombre}"
                             onerror="this.src='https://via.placeholder.com/60x60?text=Prod'">
                    </div>
                    <div class="producto-factura-nombre">${producto.nombre}</div>
                </div>
                <div class="producto-factura-detalle">
                    <div class="producto-factura-cantidad">${producto.cantidad || 1} unidad${producto.cantidad > 1 ? 'es' : ''}</div>
                    <div class="producto-factura-subtotal">$${subtotal.toFixed(2)}</div>
                </div>
            `;
            
            productosListaElement.appendChild(productoElement);
        });
    }
    
    function calcularTotales() {
        const carrito = carritoData;
        let subtotal = 0;
        let cantidadTotal = 0;
        
        carrito.forEach(item => {
            const itemCantidad = item.cantidad || 1;
            subtotal += item.precio * itemCantidad;
            cantidadTotal += itemCantidad;
        });
        
        // Calcular descuento (10% si más de 3 productos)
        let descuento = 0;
        const filaDescuento = document.querySelector('.descuento-fila');
        
        if (cantidadTotal > 3) {
            descuento = subtotal * 0.10;
            filaDescuento.style.display = 'flex';
            facturaDescuentoElement.textContent = `-$${descuento.toFixed(2)}`;
        } else {
            filaDescuento.style.display = 'none';
        }
        
        // Calcular total (subtotal - descuento)
        const total = subtotal - descuento;
        
        // Actualizar elementos del DOM
        facturaSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        facturaTotalElement.textContent = `$${total.toFixed(2)}`;
        
        // Guardar en datos del pedido
        pedidoData.subtotal = subtotal;
        pedidoData.descuento = descuento;
        pedidoData.total = total;
        pedidoData.cantidadTotal = cantidadTotal;
    }
    
    // ===================================================================
    // MÉTODOS DE PAGO
    // ===================================================================
    function configurarMetodosPago() {
        // Configurar switch de tarjeta
        const switchTarjeta = metodoTarjeta.querySelector('input[type="radio"]');
        switchTarjeta.addEventListener('change', function() {
            if (this.checked) {
                metodoPagoSeleccionado = 'tarjeta';
                contenidoTarjeta.classList.add('active');
                contenidoQR.classList.remove('active');
            }
        });
        
        // Configurar switch de QR
        const switchQR = metodoQR.querySelector('input[type="radio"]');
        switchQR.addEventListener('change', function() {
            if (this.checked) {
                metodoPagoSeleccionado = 'qr';
                contenidoQR.classList.add('active');
                contenidoTarjeta.classList.remove('active');
                generarQR();
            }
        });
        
        // Hacer clic en el header para cambiar método
        metodoTarjeta.querySelector('.metodo-header').addEventListener('click', function() {
            switchTarjeta.checked = true;
            switchTarjeta.dispatchEvent(new Event('change'));
        });
        
        metodoQR.querySelector('.metodo-header').addEventListener('click', function() {
            switchQR.checked = true;
            switchQR.dispatchEvent(new Event('change'));
        });
        
        // Validación de tarjeta en tiempo real
        const tarjetaNumero = document.getElementById('tarjetaNumero');
        const tarjetaVencimiento = document.getElementById('tarjetaVencimiento');
        const tarjetaCVV = document.getElementById('tarjetaCVV');
        const tarjetaNombre = document.getElementById('tarjetaNombre');
        
        tarjetaNumero.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value.substring(0, 19);
        });
        
        tarjetaVencimiento.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value.substring(0, 5);
        });
        
        tarjetaCVV.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
    
    function generarQR() {
        if (!window.QRCode) {
            console.error("QRCode library not loaded");
            return;
        }
        
        // Datos para el QR
        const qrData = JSON.stringify({
            merchant: "RespuestosWeb",
            amount: pedidoData.total,
            currency: "USD",
            orderId: pedidoData.numeroPedido,
            timestamp: new Date().toISOString()
        });
        
        // Generar QR
        const qrCodeElement = document.getElementById('qrCode');
        if (qrCodeElement) {
            qrCodeElement.innerHTML = ''; // Limpiar
            new QRCode(qrCodeElement, {
                text: qrData,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
    
    // ===================================================================
    // VALIDACIÓN Y PROCESAMIENTO
    // ===================================================================
    function validarFormularioPago() {
        if (metodoPagoSeleccionado === 'tarjeta') {
            return validarTarjeta();
        } else if (metodoPagoSeleccionado === 'qr') {
            return true; // QR no necesita validación de formulario
        }
        return false;
    }
    
    function validarTarjeta() {
        const tarjetaNumero = document.getElementById('tarjetaNumero').value.replace(/\s/g, '');
        const tarjetaVencimiento = document.getElementById('tarjetaVencimiento').value;
        const tarjetaCVV = document.getElementById('tarjetaCVV').value;
        const tarjetaNombre = document.getElementById('tarjetaNombre').value;
        
        // Validar número de tarjeta
        if (tarjetaNumero.length < 16) {
            mostrarAlerta('Por favor ingresa un número de tarjeta válido (16 dígitos)');
            return false;
        }
        
        // Validar fecha de vencimiento
        if (!/^\d{2}\/\d{2}$/.test(tarjetaVencimiento)) {
            mostrarAlerta('Por favor ingresa una fecha de vencimiento válida (MM/AA)');
            return false;
        }
        
        // Validar CVV
        if (tarjetaCVV.length < 3 || tarjetaCVV.length > 4) {
            mostrarAlerta('Por favor ingresa un CVV válido (3-4 dígitos)');
            return false;
        }
        
        // Validar nombre
        if (tarjetaNombre.trim().length < 3) {
            mostrarAlerta('Por favor ingresa el nombre como aparece en la tarjeta');
            return false;
        }
        
        return true;
    }
    
    function mostrarAlerta(mensaje) {
        const alerta = document.createElement('div');
        alerta.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(231, 76, 60, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        alerta.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
        document.body.appendChild(alerta);
        
        setTimeout(() => {
            alerta.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (alerta.parentNode) {
                    alerta.parentNode.removeChild(alerta);
                }
            }, 300);
        }, 3000);
    }
    
    // ===================================================================
    // PROCESAMIENTO DEL PEDIDO
    // ===================================================================
    async function procesarPedido() {
        // Validar formulario
        if (!validarFormularioPago()) {
            return;
        }
        
        // Mostrar modal de procesamiento
        modalProcesando.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Actualizar progreso
        actualizarProgreso(10, "Validando información del pago...");
        await esperar(1000);
        
        actualizarProgreso(30, "Procesando el pago...");
        await esperar(1500);
        
        actualizarProgreso(50, "Confirmando transacción...");
        await esperar(1200);
        
        actualizarProgreso(70, "Generando factura...");
        await esperar(1000);
        
        actualizarProgreso(90, "Preparando confirmación...");
        await esperar(800);
        
        actualizarProgreso(100, "¡Pedido completado!");
        await esperar(500);
        
        // Esperar a que termine la animación de la moto
        await esperar(3500);
        
        // Generar y descargar factura
        await generarFacturaPDF();
        
        // Mostrar confirmación final
        mostrarConfirmacionFinal();
    }
    
    function actualizarProgreso(porcentaje, texto) {
        if (progresoBar) progresoBar.style.width = `${porcentaje}%`;
        if (progresoTexto) progresoTexto.textContent = texto;
    }
    
    function esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function generarFacturaPDF() {
        // Crear contenido de la factura en formato texto
        const facturaTxt = generarFacturaTexto();
        
        // Guardar en localStorage para acceso posterior
        localStorage.setItem('ultimaFactura', facturaTxt);
        
        // Crear y descargar archivo .txt
        const blob = new Blob([facturaTxt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${pedidoData.numeroPedido}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function generarFacturaTexto() {
        const fecha = new Date().toLocaleString('es-ES');
        
        let factura = `========================================\n`;
        factura += `           RESPUESTOSWEB\n`;
        factura += `    Tu tienda de repuestos para motos\n`;
        factura += `========================================\n\n`;
        factura += `FACTURA #: ${pedidoData.numeroPedido}\n`;
        factura += `FECHA: ${fecha}\n`;
        factura += `========================================\n\n`;
        factura += `INFORMACIÓN DEL CLIENTE:\n`;
        factura += `------------------------\n`;
        factura += `Nombre: ${userData.name || 'No proporcionado'}\n`;
        factura += `Email: ${userData.email || 'No proporcionado'}\n`;
        factura += `Teléfono: ${userData.phone || 'No proporcionado'}\n`;
        factura += `Dirección: ${userData.address || 'No proporcionada'}\n\n`;
        factura += `========================================\n`;
        factura += `DETALLE DEL PEDIDO:\n`;
        factura += `------------------------\n`;
        
        carritoData.forEach((producto, index) => {
            const subtotal = producto.precio * (producto.cantidad || 1);
            factura += `${index + 1}. ${producto.nombre}\n`;
            factura += `   Cantidad: ${producto.cantidad || 1}\n`;
            factura += `   Precio unitario: $${producto.precio.toFixed(2)}\n`;
            factura += `   Subtotal: $${subtotal.toFixed(2)}\n\n`;
        });
        
        factura += `========================================\n`;
        factura += `RESUMEN DE COMPRA:\n`;
        factura += `------------------------\n`;
        factura += `Subtotal productos: $${pedidoData.subtotal.toFixed(2)}\n`;
        
        if (pedidoData.descuento > 0) {
            factura += `Descuento (10%): -$${pedidoData.descuento.toFixed(2)}\n`;
        }
        
        factura += `Envío: GRATIS\n`;
        factura += `----------------------------------------\n`;
        factura += `TOTAL A PAGAR: $${pedidoData.total.toFixed(2)}\n\n`;
        factura += `========================================\n`;
        factura += `INFORMACIÓN DE PAGO:\n`;
        factura += `------------------------\n`;
        factura += `Método: ${metodoPagoSeleccionado === 'tarjeta' ? 'Tarjeta de crédito/débito' : 'Pago QR'}\n`;
        factura += `Estado: PAGADO\n`;
        factura += `Fecha de pago: ${fecha}\n\n`;
        factura += `========================================\n`;
        factura += `NOTAS:\n`;
        factura += `------------------------\n`;
        factura += `• El envío se realizará en 24-48 horas hábiles\n`;
        factura += `• Puedes rastrear tu pedido con el número: ${pedidoData.numeroPedido}\n`;
        factura += `• Para consultas: wgarridomontano@gmail.com\n`;
        factura += `• Teléfono: +591 78570322\n`;
        factura += `========================================\n\n`;
        factura += `¡Gracias por tu compra!\n`;
        factura += `RespuestosWeb - Confianza sobre ruedas\n`;
        
        return factura;
    }
    
    function mostrarConfirmacionFinal() {
        // Ocultar modal de procesamiento
        modalProcesando.classList.remove('active');
        
        // Mostrar modal de confirmación
        const confirmacionHTML = `
            <div class="confirmacion-final" id="confirmacionFinal">
                <div class="confirmacion-contenido">
                    <div class="confirmacion-icono">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>¡Gracias por tu compra!</h2>
                    <p>Tu pedido ha sido procesado exitosamente.</p>
                    
                    <div class="confirmacion-datos">
                        <p><strong>Número de pedido:</strong> ${pedidoData.numeroPedido}</p>
                        <p><strong>Total pagado:</strong> $${pedidoData.total.toFixed(2)}</p>
                        <p><strong>Método de pago:</strong> ${metodoPagoSeleccionado === 'tarjeta' ? 'Tarjeta' : 'QR'}</p>
                    </div>
                    
                    <div class="confirmacion-info">
                        <p><i class="fas fa-envelope"></i> Los detalles de tu pedido han sido enviados a: <strong>${userData.email}</strong></p>
                        <p><i class="fas fa-download"></i> Se ha descargado una copia de tu factura</p>
                    </div>
                    
                    <div class="confirmacion-acciones">
                        <button class="btn-confirmacion" onclick="window.location.href='index.html'">
                            <i class="fas fa-home"></i> Volver al inicio
                        </button>
                        <button class="btn-confirmacion secundario" onclick="window.location.href='repuestos.html'">
                            <i class="fas fa-shopping-cart"></i> Seguir comprando
                        </button>
                    </div>
                    
                    <div class="confirmacion-extra">
                        <p><i class="fas fa-clock"></i> Tu pedido será enviado en 24-48 horas</p>
                        <p><i class="fas fa-phone"></i> ¿Preguntas? +591 78570322</p>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar al body
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = confirmacionHTML;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // Limpiar carrito después de la compra
        localStorage.removeItem('carrito');
        localStorage.removeItem('pendingPurchase');
        window.dispatchEvent(new Event('carritoActualizado'));
    }
    
    // ===================================================================
    // CONFIGURACIÓN DE EVENTOS
    // ===================================================================
    function configurarEventos() {
        // Botón finalizar compra
        if (btnFinalizarCompra) {
            btnFinalizarCompra.addEventListener('click', procesarPedido);
        }
        
        // Validar campos de tarjeta en tiempo real
        const tarjetaCampos = ['tarjetaNumero', 'tarjetaVencimiento', 'tarjetaCVV', 'tarjetaNombre'];
        tarjetaCampos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.addEventListener('blur', validarCampoTarjeta);
            }
        });
        
        // Permitir atrás con tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                window.history.back();
            }
        });
    }
    
    function validarCampoTarjeta(e) {
        const campo = e.target;
        const valor = campo.value.trim();
        
        if (!valor && campo.id !== 'tarjetaNombre') {
            campo.style.borderColor = '#e74c3c';
        } else {
            campo.style.borderColor = '';
        }
    }
    
    // ===================================================================
    // INICIALIZAR
    // ===================================================================
    init();
    
    // ===================================================================
    // FUNCIONES GLOBALES
    // ===================================================================
    window.descargarFactura = function() {
        generarFacturaPDF();
    };
    
    window.verificarPagoQR = function() {
        alert('Para verificar tu pago QR, por favor envía el comprobante a: wgarridomontano@gmail.com');
    };
});