// registro.js - VERSIÓN CORREGIDA Y COMPLETA
document.addEventListener('DOMContentLoaded', function () {
    console.log("=== FORMULARIO DE REGISTRO INICIADO ===");

    // Elementos del DOM
    const registrationForm = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    // Elementos de entrada
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    const newsletterCheckbox = document.getElementById('newsletter');

    // Elementos de contraseña
    const showPasswordBtn = document.getElementById('showPassword');
    const showConfirmPasswordBtn = document.getElementById('showConfirmPassword');
    const strengthBars = [
        document.getElementById('strengthBar1'),
        document.getElementById('strengthBar2'),
        document.getElementById('strengthBar3'),
        document.getElementById('strengthBar4')
    ];
    const strengthText = document.getElementById('strengthText');

    // Elementos de requisitos
    const reqLength = document.getElementById('reqLength');
    const reqUppercase = document.getElementById('reqUppercase');
    const reqLowercase = document.getElementById('reqLowercase');
    const reqNumber = document.getElementById('reqNumber');
    const reqSpecial = document.getElementById('reqSpecial');

    // ===================================================================
    // 1. INICIALIZACIÓN
    // ===================================================================
    
    console.log("Formulario encontrado:", !!registrationForm);
    console.log("Mensaje de éxito encontrado:", !!successMessage);
    
    // Ocultar mensaje de éxito al inicio (por si acaso está visible)
    if (successMessage) {
        successMessage.style.display = 'none';
    }
    
    // Enfocar el primer campo
    if (fullNameInput) {
        fullNameInput.focus();
    }

    // ===================================================================
    // 2. EVENT LISTENERS
    // ===================================================================
    
    // Validación en tiempo real
    if (fullNameInput) fullNameInput.addEventListener('input', validateFullName);
    if (emailInput) emailInput.addEventListener('input', validateEmail);
    if (phoneInput) phoneInput.addEventListener('input', validatePhone);
    if (passwordInput) passwordInput.addEventListener('input', validatePassword);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', validateConfirmPassword);

    // Mostrar/ocultar contraseña
    if (showPasswordBtn) {
        showPasswordBtn.addEventListener('click', function () {
            togglePasswordVisibility(passwordInput, this);
        });
    }

    if (showConfirmPasswordBtn) {
        showConfirmPasswordBtn.addEventListener('click', function () {
            togglePasswordVisibility(confirmPasswordInput, this);
        });
    }

    // Envío del formulario - ¡ESTO ES LO MÁS IMPORTANTE!
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
        console.log("Event listener de submit configurado");
    } else {
        console.error("ERROR: No se encontró el formulario de registro");
    }

    // ===================================================================
    // 3. FUNCIONES DE VALIDACIÓN (MANTENER TUS FUNCIONES ORIGINALES)
    // ===================================================================
    
    function validateFullName() {
        const name = fullNameInput.value.trim();
        const errorElement = document.getElementById('fullNameError');

        if (name.length < 2) {
            showError(errorElement, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
            showError(errorElement, 'El nombre solo puede contener letras y espacios');
            return false;
        }

        hideError(errorElement);
        return true;
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const errorElement = document.getElementById('emailError');

        if (!email) {
            showError(errorElement, 'El correo electrónico es requerido');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError(errorElement, 'Ingresa un correo electrónico válido');
            return false;
        }

        hideError(errorElement);
        return true;
    }

    function validatePhone() {
        const phone = phoneInput.value.trim();
        const errorElement = document.getElementById('phoneError');

        if (!phone) {
            showError(errorElement, 'El teléfono es requerido');
            return false;
        }

        // Expresión regular que acepta formatos internacionales
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\(\)\-]/g, '');

        if (!phoneRegex.test(cleanPhone)) {
            showError(errorElement, 'Ingresa un número de teléfono válido');
            return false;
        }

        hideError(errorElement);
        return true;
    }

    function validatePassword() {
        const password = passwordInput.value;
        const errorElement = document.getElementById('passwordError');

        // Verificar requisitos
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);

        // Actualizar indicadores visuales de requisitos
        updateRequirement(reqLength, hasLength);
        updateRequirement(reqUppercase, hasUppercase);
        updateRequirement(reqLowercase, hasLowercase);
        updateRequirement(reqNumber, hasNumber);
        updateRequirement(reqSpecial, hasSpecial);

        // Calcular fortaleza
        let strength = 0;
        if (hasLength) strength++;
        if (hasUppercase) strength++;
        if (hasLowercase) strength++;
        if (hasNumber) strength++;
        if (hasSpecial) strength++;

        // Actualizar barras de fortaleza
        updateStrengthBars(strength);

        if (password.length === 0) {
            showError(errorElement, 'La contraseña es requerida');
            return false;
        }

        if (!hasLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            showError(errorElement, 'La contraseña no cumple con todos los requisitos');
            return false;
        }

        hideError(errorElement);
        return true;
    }

    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const errorElement = document.getElementById('confirmPasswordError');

        if (confirmPassword.length === 0) {
            showError(errorElement, 'Confirma tu contraseña');
            return false;
        }

        if (password !== confirmPassword) {
            showError(errorElement, 'Las contraseñas no coinciden');
            return false;
        }

        hideError(errorElement);
        return true;
    }

    function updateRequirement(element, isValid) {
        if (element) {
            if (isValid) {
                element.classList.add('valid');
                if (element.querySelector('i')) {
                    element.querySelector('i').style.color = '#4CAF50';
                }
            } else {
                element.classList.remove('valid');
                if (element.querySelector('i')) {
                    element.querySelector('i').style.color = '#8888aa';
                }
            }
        }
    }

    function updateStrengthBars(strength) {
        if (!strengthBars[0]) return;
        
        // Resetear todas las barras
        strengthBars.forEach((bar, index) => {
            if (bar) bar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });

        // Colores según la fortaleza
        let color;
        let text;

        switch (strength) {
            case 1:
                color = '#ff6b6b';
                text = 'Muy débil';
                break;
            case 2:
                color = '#ffa726';
                text = 'Débil';
                break;
            case 3:
                color = '#ffd54f';
                text = 'Regular';
                break;
            case 4:
                color = '#4CAF50';
                text = 'Buena';
                break;
            case 5:
                color = '#2E7D32';
                text = 'Excelente';
                break;
            default:
                color = '#8888aa';
                text = 'Seguridad: Muy débil';
        }

        // Activar barras según fortaleza
        for (let i = 0; i < strength; i++) {
            if (strengthBars[i]) {
                strengthBars[i].style.backgroundColor = color;
            }
        }

        if (strengthText) {
            strengthText.textContent = `Seguridad: ${text}`;
            strengthText.style.color = color;
        }
    }

    function togglePasswordVisibility(input, button) {
        if (!input || !button) return;
        
        const icon = button.querySelector('i');
        if (!icon) return;

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    function showError(element, message) {
        if (element) {
            element.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            element.classList.add('show');
        }
    }

    function hideError(element) {
        if (element) {
            element.classList.remove('show');
            element.textContent = '';
        }
    }

    // ===================================================================
    // 4. FUNCIÓN PRINCIPAL DE REGISTRO - ¡CORREGIDA!
    // ===================================================================
    
    async function handleRegistration(e) {
        e.preventDefault();
        console.log("Formulario enviado - Iniciando registro...");

        // 1. Validar todo el formulario
        if (!validateAll()) {
            console.log("Validación fallida");
            return;
        }

        console.log("Validación exitosa - Creando usuario...");

        // 2. Mostrar estado de carga
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';

        // 3. Pequeña pausa para feedback visual
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Crear objeto de usuario
        const user = {
            id: 'user_' + Date.now(),
            name: fullNameInput.value.trim(),
            email: emailInput.value.trim().toLowerCase(),
            phone: phoneInput.value.trim(),
            address: addressInput.value.trim(),
            password: passwordInput.value, // En una app real, esto debería estar encriptado
            createdAt: new Date().toISOString(),
            newsletter: newsletterCheckbox.checked,
            role: 'customer',
            lastLogin: null,
            loggedIn: true // IMPORTANTE: Marcamos como logueado automáticamente
        };

        console.log("Usuario creado:", { ...user, password: '***' });

        // 5. VERIFICAR SI EL EMAIL YA EXISTE
        const existingUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
        const emailExists = existingUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase());

        if (emailExists) {
            console.log("Email ya registrado");
            
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear cuenta';

            // Mostrar error
            showError(document.getElementById('emailError'), 'Este email ya está registrado');
            emailInput.focus();
            return;
        }

        // 6. GUARDAR USUARIO EN EL SISTEMA
        console.log("Guardando usuario en localStorage...");
        
        // 6.1 Guardar en lista de usuarios
        existingUsers.push(user);
        localStorage.setItem('allUsers', JSON.stringify(existingUsers));
        
        // 6.2 Guardar usuario actual (formato que usa tu navbar)
        const userForNavbar = {
            name: user.name,
            email: user.email,
            loggedIn: true,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userForNavbar));
        
        // 6.3 Para compatibilidad futura
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // 6.4 Marcar como nuevo usuario
        localStorage.setItem('isNewUser', 'true');

        console.log('Usuario registrado y guardado exitosamente');

        // 7. MOSTRAR MENSAJE DE ÉXITO - ¡ESTO ES LO QUE TE FALTABA!
        console.log("Mostrando mensaje de éxito...");
        showSuccessMessage(user);

        // 8. NO redirigir automáticamente - dejar que el usuario haga clic en "Iniciar Sesión"
        console.log("Registro completado - Esperando acción del usuario");
    }

    // ===================================================================
    // 5. FUNCIONES AUXILIARES
    // ===================================================================
    
    function validateAll() {
        const validations = [
            validateFullName(),
            validateEmail(),
            validatePhone(),
            validatePassword(),
            validateConfirmPassword()
        ];

        // Validar términos
        if (!termsCheckbox.checked) {
            alert('Debes aceptar los términos y condiciones para continuar');
            termsCheckbox.focus();
            return false;
        }

        return validations.every(v => v === true);
    }

    function showSuccessMessage(user) {
        console.log("Función showSuccessMessage ejecutada");
        
        // 1. Actualizar datos en el mensaje de éxito
        const registeredName = document.getElementById('registeredName');
        const registeredEmail = document.getElementById('registeredEmail');
        
        if (registeredName) registeredName.textContent = user.name;
        if (registeredEmail) registeredEmail.textContent = user.email;
        
        // 2. Ocultar formulario
        if (registrationForm) {
            registrationForm.style.display = 'none';
            console.log("Formulario ocultado");
        }
        
        // 3. Mostrar mensaje de éxito
        if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.style.animation = 'fadeIn 0.5s ease';
            console.log("Mensaje de éxito mostrado");
        } else {
            console.error("ERROR: Elemento successMessage no encontrado");
        }
        
        // 4. Restaurar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear cuenta';
        }
        
        // 5. Hacer scroll al mensaje de éxito
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // 6. Disparar evento de autenticación para actualizar navbar si está en otra pestaña
        window.dispatchEvent(new Event('authStateChanged'));
    }

    // ===================================================================
    // 6. FUNCIONES GLOBALES
    // ===================================================================
    
    // Función para resetear formulario (se llama desde el HTML)
    window.resetForm = function () {
        console.log("Reseteando formulario...");

        // 1. Mostrar formulario y ocultar mensaje de éxito
        if (successMessage) successMessage.style.display = 'none';
        if (registrationForm) {
            registrationForm.style.display = 'block';
            registrationForm.reset();
        }

        // 2. Resetear botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear cuenta';
        }

        // 3. Resetear validaciones visuales
        if (strengthBars) {
            strengthBars.forEach(bar => {
                if (bar) bar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
        }

        if (strengthText) {
            strengthText.textContent = 'Seguridad: Muy débil';
            strengthText.style.color = '#8888aa';
        }

        // 4. Resetear requisitos
        const reqs = [reqLength, reqUppercase, reqLowercase, reqNumber, reqSpecial];
        reqs.forEach(el => {
            if (el) {
                el.classList.remove('valid');
                const icon = el.querySelector('i');
                if (icon) icon.style.color = '#8888aa';
            }
        });

        // 5. Limpiar mensajes de error
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });

        // 6. Enfocar primer campo
        if (fullNameInput) fullNameInput.focus();
        
        console.log("Formulario reseteado exitosamente");
    };

    // Función para depuración
    window.debugUsers = function () {
        console.log("=== DEBUG USUARIOS ===");
        console.log("allUsers:", JSON.parse(localStorage.getItem('allUsers')) || []);
        console.log("user (navbar):", JSON.parse(localStorage.getItem('user')) || 'No hay usuario');
        console.log("currentUser:", JSON.parse(localStorage.getItem('currentUser')) || 'No hay usuario');
        console.log("isLoggedIn:", localStorage.getItem('isLoggedIn'));
        console.log("isNewUser:", localStorage.getItem('isNewUser'));
        console.log("======================");
    };

    console.log("=== FORMULARIO DE REGISTRO CONFIGURADO CORRECTAMENTE ===");
});
