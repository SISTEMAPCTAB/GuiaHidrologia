ACTUALIZACIÓN 2026-08-26 — REGISTRO CENTRALIZADO OBLIGATORIO

Esta versión elimina completamente el guardado de participantes y avances mediante localStorage.
Si Supabase no está configurado o js/cloud.js no carga, la plataforma muestra “Plataforma no conectada” y NO simula registros locales.

PARA QUE LOS REGISTROS APAREZCAN EN EL PANEL ADMINISTRADOR:
1. Suba TODO el contenido de esta carpeta al servidor, reemplazando la versión anterior.
2. Edite config.js y coloque los valores reales de SUPABASE_URL y SUPABASE_ANON_KEY.
3. En Supabase > SQL Editor ejecute supabase/schema.sql una sola vez.
4. Despliegue la función supabase/functions/grade-exam/index.ts como Edge Function llamada grade-exam.
5. Cree una cuenta normal desde la página y luego, en Supabase SQL Editor, conviértala en administrador:
   update public.profiles set is_admin=true where id=(select id from auth.users where email='SU_CORREO@DOMINIO.COM');
6. Abra la página en ventana privada o borre caché del navegador. Los scripts llevan versión ?v=20260826-2 para evitar que se use una copia anterior.
7. Prueba mínima recomendada:
   - registrar un usuario desde un celular;
   - iniciar sesión con ese usuario;
   - marcar al menos un módulo;
   - entrar como administrador desde otra computadora;
   - confirmar que el usuario aparece en el panel con su avance.

IMPORTANTE:
- No suba solo index.html; también deben existir config.js, js/cloud.js, images/, verificar.html y la configuración Supabase.
- Si sigue apareciendo el texto “esta versión usa almacenamiento local del navegador”, el servidor o CDN está entregando el archivo index.html anterior.
- El panel administrador consulta la función RPC admin_dashboard() de Supabase; si no se ejecutó schema.sql, no podrá listar usuarios.
