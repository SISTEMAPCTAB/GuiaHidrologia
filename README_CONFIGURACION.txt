PLATAFORMA AMH – GUÍA INTERACTIVA DE HIDROLOGÍA E INUNDACIONES DE TABASCO
Versión multiusuario con Supabase

QUÉ INCLUYE
- Registro de usuarios con correo y contraseña mediante Supabase Auth.
- Perfil: nombre, cargo/perfil, institución, municipio, teléfono y usuario.
- Avance del curso persistente en servidor.
- Evaluación final de 20 preguntas; mínimo aprobatorio 80% (16/20).
- Respuestas correctas fuera del HTML: la calificación oficial se realiza en una Supabase Edge Function.
- Registro histórico de intentos.
- Diploma solo para usuarios acreditados.
- Folio único: AMH-HID-2026-000001, etc.
- QR y página verificar.html para validar diplomas.
- Panel de administrador centralizado y exportación CSV.
- Políticas RLS para separar participantes y administradores.

CONFIGURACIÓN EN SUPABASE
1. Crea un proyecto en https://supabase.com/.
2. Abre SQL Editor y ejecuta TODO el archivo: supabase/schema.sql
3. En Authentication > URL Configuration agrega la URL pública del sitio como Site URL y Redirect URL.
4. En Authentication > Providers > Email decide si exigirás confirmación por correo. El frontend soporta ambos modos.
5. En Project Settings > API copia:
   - Project URL
   - anon public key
6. Edita config.js y reemplaza TU-PROYECTO y TU-ANON-KEY.
7. Despliega la función supabase/functions/grade-exam/index.ts con Supabase CLI:
   supabase functions deploy grade-exam
   Supabase proporciona automáticamente SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY a la función hospedada.
8. Crea la primera cuenta administrativa desde la propia página o Authentication > Users. Luego ejecuta en SQL Editor, sustituyendo el correo:
   update public.profiles p
   set is_admin=true
   from auth.users u
   where p.id=u.id and lower(u.email)=lower('ADMIN@EJEMPLO.COM');
9. Sube al servidor todo el contenido de esta carpeta manteniendo sus subcarpetas.
10. Prueba: registro -> módulos -> evaluación -> diploma -> QR -> verificar.html.

IMPORTANTE
- Nunca coloques SUPABASE_SERVICE_ROLE_KEY en config.js ni en archivos públicos. Solo la Edge Function usa esa clave en el entorno seguro de Supabase.
- La anon key sí está diseñada para frontend; la seguridad real se aplica con Auth + RLS.
- No elimines las políticas RLS.
- Antes de producción define una política institucional de privacidad y tratamiento de datos personales.

SERVIDOR WEB
El frontend es estático. Funciona en Apache/cPanel, Nginx, GitHub Pages o servicios equivalentes, siempre mediante HTTPS para producción.
