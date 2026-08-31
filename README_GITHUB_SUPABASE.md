# Guía de Hidrología AMH v4 — PWA + GitHub Pages + Supabase + GA4

## Estructura
- `/` PWA del participante.
- `/admin/` panel administrativo independiente (no se enlaza desde la PWA).
- `/verificar/` verificación pública de diplomas.
- `/supabase/schema.sql` esquema, RLS, RPC y catálogo de actividades obligatorias.
- `/supabase/functions/grade-exam/` función segura que contiene la clave del examen y emite un único diploma.

## 1. Crear/configurar Supabase
1. Cree un proyecto en Supabase.
2. En **SQL Editor**, ejecute completo `supabase/schema.sql`.
3. En Authentication configure correo/contraseña. Si desea confirmación por correo, agregue como Site URL la URL de GitHub Pages.
4. Despliegue la Edge Function `grade-exam` con Supabase CLI: `supabase functions deploy grade-exam`.
5. No coloque `service_role` en GitHub ni en `config.js`; la Edge Function obtiene esa clave desde los secretos administrados por Supabase.

## 2. Configurar frontend
Edite `config.js` y reemplace:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (clave pública/anon; es correcto que esté en frontend, protegida mediante RLS)
- `GA4_MEASUREMENT_ID` si usará GA4.

## 3. Crear administrador
Primero registre una cuenta normalmente en Supabase Auth o mediante la PWA. Luego, desde SQL Editor, ejecute reemplazando el correo:
```sql
update public.profiles p set is_admin=true
from auth.users u where u.id=p.id and lower(u.email)=lower('ADMIN@DOMINIO.MX');
```
El administrador entra exclusivamente en `/admin/`. No hay credenciales incrustadas en el repositorio.

## 4. GitHub Pages
Suba **el contenido de esta carpeta** a la raíz del repositorio que publicará, por ejemplo `GuiaHidrologia`. En Settings → Pages seleccione `Deploy from a branch`, rama `main`, carpeta `/root`.
La URL quedará como `https://USUARIO.github.io/GuiaHidrologia/`.

## 5. PWA
GitHub Pages usa HTTPS, requisito de Service Worker. Android ofrecerá instalación. En iPhone: Safari → Compartir → Añadir a pantalla de inicio. El Service Worker almacena únicamente recursos estáticos; las operaciones académicas se consultan y registran en Supabase.

## 6. Reglas académicas
- 18 apartados formativos previos al examen.
- Cada apartado tiene actividades obligatorias definidas en `required_activities`.
- El siguiente apartado queda bloqueado hasta completar las actividades del actual.
- El examen se bloquea hasta 100% de los 18 apartados.
- Aprobación: 80% (16/20).
- La clave de respuestas solo existe dentro de la Edge Function.
- `certificates` tiene `unique(user_id, course_code)`: un participante no puede recibir dos diplomas del mismo curso.
- El QR apunta a `/verificar/?folio=...` y no incluye datos personales.

## 7. GA4
GA4 mide uso general. Supabase mide participantes identificados y resultados. El código no envía a GA4 contraseñas, respuestas ni nombres.

## 8. Actualizaciones y caché
Cuando cambie archivos, incremente `APP_VERSION` y el nombre `CACHE` de `service-worker.js`. Al detectar un Service Worker nuevo, la PWA ofrece “Actualizar ahora”.

## 9. Prueba mínima antes de producción
1. Registrar Usuario A en celular.
2. Confirmar que no puede abrir un módulo posterior sin completar el anterior.
3. Completar todas las actividades obligatorias y verificar desde otro navegador que el avance reaparece.
4. Verificar que el examen no abre antes del 100%.
5. Probar un intento <80% y otro >=80%.
6. Confirmar que el segundo acceso al diploma devuelve el mismo folio.
7. Escanear QR y comprobar `/verificar/`.
8. Entrar como admin desde otro equipo y comprobar KPIs, detalle y CSV.
9. Activar modo avión y confirmar que no se pueden acreditar actividades, examen ni diploma.

## Nota sobre pruebas incluidas
El paquete incluye `tests/static_checks.py`, que valida estructura, ausencia de claves administrativas, ausencia de `localStorage` como fuente académica, presencia de 20 preguntas y que la clave correcta no esté en el HTML. Las pruebas E2E reales contra Supabase requieren colocar las credenciales públicas del proyecto y desplegar la Edge Function.
